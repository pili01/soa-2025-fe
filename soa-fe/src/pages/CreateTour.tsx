import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, MapRef, MapLayerMouseEvent, Marker } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Plus, X, MapPin, Trash2 } from 'lucide-react';
import AuthService from '../services/AuthService';

interface TourData {
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

interface Keypoint {
  name: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  ordinal: number;
}

export default function CreateTour() {
  const navigate = useNavigate();
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Check if user is authenticated and is a Guide
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const userRole = AuthService.getUserRole();
    if (userRole !== 'Guide') {
      setError('Samo vodiči mogu da kreiraju ture');
      setIsCheckingAuth(false);
      return;
    }

    // Check if user is blocked (this would require additional API call)
    // For now, we'll assume the backend will handle this
    
    setIsCheckingAuth(false);
  }, [navigate]);
  
  const [tourData, setTourData] = useState<TourData>({
    name: '',
    description: '',
    difficulty: 'Easy',
    tags: []
  });
  
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mapRef = useRef<MapRef | null>(null);

  const initialView = {
    longitude: 20.4489, // Belgrade
    latitude: 44.7866,
    zoom: 10,
    bearing: 0,
    pitch: 0,
  };

  // Automatically update ordinals when keypoints change
  useEffect(() => {
    setKeypoints(prev => 
      prev.map((keypoint, index) => ({
        ...keypoint,
        ordinal: index + 1
      }))
    );
  }, [keypoints.length]);

  const handleMapClick = (e: MapLayerMouseEvent) => {
    const { lng, lat } = e.lngLat;
    const newKeypoint: Keypoint = {
      name: '',
      description: '',
      imageUrl: '',
      latitude: lat,
      longitude: lng,
      ordinal: 0 // Will be automatically set by useEffect
    };
    setKeypoints(prev => [...prev, newKeypoint]);
  };

  const updateKeypoint = (index: number, field: keyof Keypoint, value: any) => {
    const updatedKeypoints = [...keypoints];
    updatedKeypoints[index] = { ...updatedKeypoints[index], [field]: value };
    setKeypoints(updatedKeypoints);
  };

  const removeKeypoint = (index: number) => {
    setKeypoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, keypointIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Molimo izaberite sliku');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Slika ne sme biti veća od 5MB');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('keypointId', keypointIndex.toString());
      formData.append('tourId', '0'); // Temporary, will be updated after tour creation

      const response = await fetch('http://localhost:8080/api/keypoint-image/saveKeypointPhoto', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        updateKeypoint(keypointIndex, 'imageUrl', result.photoURL);
        setSuccess('Slika uspešno upload-ovana!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Greška pri upload-u slike');
      }
    } catch (error) {
      setError('Greška pri upload-u slike');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tourData.tags.includes(tagInput.trim())) {
      setTourData({
        ...tourData,
        tags: [...tourData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTourData({
      ...tourData,
      tags: tourData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const isValid = (): boolean => {
    return tourData.name.trim() !== '' &&
           tourData.description.trim() !== '' &&
           tourData.difficulty &&
           keypoints.length >= 2 &&
           keypoints.every(kp => kp.name.trim() !== '' && kp.description.trim() !== '');
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid()) {
      setError('Popuni sva obavezna polja i dodaj minimalno 2 keypoint-a');
      return;
    }

    // Double check user role before submitting
    const userRole = AuthService.getUserRole();
    if (userRole !== 'Guide') {
      setError('Samo vodiči mogu da kreiraju ture');
      return;
    }

    // Check if user is blocked (this would require additional API call)
    // For now, we'll assume the backend will handle this

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8080/api/tours/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({
          tour: tourData,
          keypoints: keypoints
        })
      });

      if (response.ok) {
        setSuccess('Tura uspešno kreirana!');
        setTimeout(() => {
          navigate('/my-tours');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Greška pri kreiranju ture');
        }
      } catch (error) {
      setError('Greška pri kreiranju ture');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Proveravam autentifikaciju...</p>
        </div>
      </div>
    );
  }

  if (error && !isCheckingAuth) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Greška!</h4>
          <p>{error}</p>
          <button
            className="btn btn-outline-danger"
            onClick={() => navigate('/')}
          >
            Nazad na početnu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header">
              <h2 className="mb-0">Kreiraj novu turu</h2>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Tour Basic Info */}
                <div className="form-section">
                  <h5>Osnovne informacije</h5>
                  
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Naziv ture *</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="name"
                      value={tourData.name}
                      onChange={(e) => setTourData({...tourData, name: e.target.value})}
                      placeholder="Unesi naziv ture"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Opis ture *</label>
                    <textarea
                      className="form-control form-control-lg"
                      id="description"
                      rows={4}
                      value={tourData.description}
                      onChange={(e) => setTourData({...tourData, description: e.target.value})}
                      placeholder="Opis ture..."
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="difficulty" className="form-label">Težina *</label>
                    <select
                      className="form-select form-select-lg"
                      id="difficulty"
                      value={tourData.difficulty}
                      onChange={(e) => setTourData({...tourData, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard'})}
                      required
                    >
                      <option value="Easy">Lako</option>
                      <option value="Medium">Srednje</option>
                      <option value="Hard">Teško</option>
                    </select>
        </div>

                  <div className="mb-3">
                    <label className="form-label">Tagovi</label>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {tourData.tags.map(tag => (
                        <span key={tag} className="badge bg-primary d-flex align-items-center tag-badge">
                          {tag}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-2"
                            onClick={() => removeTag(tag)}
                          />
                        </span>
                      ))}
            </div>
                    <div className="input-group tag-input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Dodaj tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={addTag}
                      >
                        <Plus size={16} />
                      </button>
            </div>
          </div>
        </div>

                {/* Keypoints Section */}
                <div className="form-section">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Keypoint-ovi *</h5>
                    <small className="text-muted">Minimalno 2 keypoint-a</small>
        </div>

                  {keypoints.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted mb-3">Nema keypoint-ova. Klikni na mapu da dodaš prvi keypoint!</p>
                    </div>
                  )}

                  {keypoints.map((keypoint, index) => (
                    <div key={index} className="card mb-3 border-primary keypoint-card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">
                          <MapPin size={16} className="me-2" />
                          Keypoint {index + 1}
                        </h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeKeypoint(index)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Naziv lokacije *</label>
                  <input
                    type="text"
                                className="form-control"
                                value={keypoint.name}
                                onChange={(e) => updateKeypoint(index, 'name', e.target.value)}
                                placeholder="Naziv lokacije"
                                required
                              />
                            </div>
                          </div>
                                                                <div className="col-md-6">
                                        <div className="mb-3">
                                          <label className="form-label">Slika lokacije</label>
                                          <div className="d-flex align-items-center gap-2">
                                            <input
                                              type="file"
                                              className="form-control"
                                              accept="image/*"
                                              onChange={(e) => handleImageUpload(e, index)}
                                            />
                                            {keypoint.imageUrl && (
                                              <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => updateKeypoint(index, 'imageUrl', '')}
                                              >
                                                <X size={14} />
                                              </button>
                                            )}
                                          </div>
                                          {keypoint.imageUrl && (
                                            <div className="mt-2">
                                              <img 
                                                src={keypoint.imageUrl} 
                                                alt="Preview" 
                                                className="img-thumbnail"
                                                style={{ maxWidth: '100px', maxHeight: '100px' }}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label">Opis lokacije *</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            value={keypoint.description}
                            onChange={(e) => updateKeypoint(index, 'description', e.target.value)}
                            placeholder="Opis lokacije..."
                            required
                  />
                </div>

                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Geografska širina</label>
                  <input
                                type="number"
                                className="form-control"
                                value={keypoint.latitude}
                                onChange={(e) => updateKeypoint(index, 'latitude', parseFloat(e.target.value))}
                                step="0.0001"
                                readOnly
                  />
                </div>
                </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Geografska dužina</label>
                  <input
                                type="number"
                                className="form-control"
                                value={keypoint.longitude}
                                onChange={(e) => updateKeypoint(index, 'longitude', parseFloat(e.target.value))}
                                step="0.0001"
                                readOnly
                  />
                </div>
                          </div>
                </div>
              </div>
            </div>
                  ))}

                  <div className="text-center">
            <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => {
                        const newKeypoint: Keypoint = {
                          name: '',
                          description: '',
                          imageUrl: '',
                          latitude: 0,
                          longitude: 0,
                          ordinal: 0 // Will be automatically set by useEffect
                        };
                        setKeypoints(prev => [...prev, newKeypoint]);
                      }}
                    >
                      <Plus size={16} className="me-2" />
                      Dodaj keypoint
            </button>
                  </div>
                </div>

                <div className="d-grid">
              <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isLoading || !isValid()}
              >
                    {isLoading ? 'Kreiram turu...' : 'Kreiraj turu'}
              </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Map Sidebar */}
        <div className="col-lg-4">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">Mapa</h5>
              <small className="text-muted">Klikni na mapu da dodaš keypoint</small>
            </div>
            <div className="card-body p-0">
              <Map
                ref={mapRef}
                id="create-tour-map"
                initialViewState={initialView}
                mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=eQ7kHusRBi4TZNe7vYuj"
                onClick={handleMapClick}
                style={{ height: '500px', width: '100%' }}
              >
                {keypoints.map((keypoint, index) => (
                  <Marker
                    key={`keypoint-${index}`}
                    longitude={keypoint.longitude}
                    latitude={keypoint.latitude}
                    anchor="bottom"
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: '#0d6efd',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {index + 1}
                    </div>
                  </Marker>
                ))}
              </Map>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}