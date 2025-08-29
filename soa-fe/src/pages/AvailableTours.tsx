import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

interface Tour {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  tags: string[];
  price: number;
  status: string;
  drivingStats: {
    distance: number;
    duration: number;
  };
  walkingStats: {
    distance: number;
    duration: number;
  };
  cyclingStats: {
    distance: number;
    duration: number;
  };
}

interface TourWithFirstKeypoint {
  // Direktno svojstva ture (nema tour wrapper)
  id: number;
  authorId: number;
  name: string;
  description: string;
  difficulty: string;
  tags: string[];
  status: string;
  price: number;
  drivingStats: {
    distance: number;
    duration: number;
  };
  walkingStats: {
    distance: number;
    duration: number;
  };
  cyclingStats: {
    distance: number;
    duration: number;
  };
  timePublished: string;
  timeDrafted: string;
  firstKeypoint: {
    id: number;
    tourId: number;
    name: string;
    description: string;
    imageUrl?: string;
    latitude: number;
    longitude: number;
    ordinal: number;
  };
  // Reviews nema u backend response
  reviews?: Array<{
    id: number;
    rating: number;
    comment: string;
    authorName: string;
    createdAt: string;
  }>;
}

const AvailableTours: React.FC = () => {
  const [tours, setTours] = useState<TourWithFirstKeypoint[]>([]);
  const [purchasedTours, setPurchasedTours] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableTours();
    fetchPurchasedTours();
  }, []);

  const fetchPurchasedTours = async () => {
    try {
      const token = AuthService.getToken();
      if (!token) return;

      // Dohvati sve kupljene ture za trenutnog turistu
      const response = await fetch('http://localhost:8080/api/purchase/purchases', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Kreiraj Set sa ID-jevima kupljenih tura
        const purchasedIds = new Set<number>(data.purchases?.map((purchase: any) => purchase.tour_id) || []);
        setPurchasedTours(purchasedIds);
      }
    } catch (error) {
      console.error('Greška pri dohvatanju kupljenih tura:', error);
    }
  };

  const fetchAvailableTours = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = AuthService.getToken();
      if (!token) {
        setError('Niste prijavljeni');
        return;
      }

      const response = await fetch('http://localhost:8080/api/tours/get-published', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response:', data);
      
      // Proveri strukturu podataka
      if (Array.isArray(data)) {
        console.log('Data is array, length:', data.length);
        if (data.length > 0) {
          console.log('First item structure:', data[0]);
          console.log('First item keys:', Object.keys(data[0]));
          console.log('Has tour property?', 'tour' in data[0]);
          console.log('Has id property?', 'id' in data[0]);
          console.log('Has name property?', 'name' in data[0]);
        }
        setTours(data);
      } else {
        console.error('Data is not an array:', typeof data, data);
        setError('Neispravan format podataka sa servera');
      }
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju tura');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (tourId: number, tourName: string, price: number) => {
    try {
      const response = await fetch('http://localhost:8080/api/purchase/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({
          tour_id: tourId,
          tour_name: tourName,
          price: price
        })
      });

      if (response.ok) {
        alert('Tura uspešno dodana u korpu!');
        navigate('/shopping-cart');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Greška pri dodavanju u korpu');
      }
    } catch (error) {
      setError('Greška pri dodavanju u korpu');
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${meters}m`;
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Učitavanje...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Dostupne Ture</h2>
          
          {tours.length === 0 ? (
            <div className="alert alert-info">
              Trenutno nema dostupnih tura.
            </div>
          ) : (
                        <div className="row">
              {tours.map((tourData) => (
                <div key={tourData.id} className="col-lg-6 col-xl-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    {tourData.firstKeypoint?.imageUrl && (
                      <img 
                        src={tourData.firstKeypoint.imageUrl} 
                        className="card-img-top" 
                        alt={tourData.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{tourData.name}</h5>
                      <p className="card-text text-muted">{tourData.description}</p>
                      
                      <div className="mb-3">
                        <span className={`badge me-2 ${
                          tourData.difficulty === 'Easy' ? 'bg-success' :
                          tourData.difficulty === 'Medium' ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {tourData.difficulty}
                        </span>
                        
                        {tourData.tags && tourData.tags.map((tag: string, index: number) => (
                          <span key={index} className="badge bg-secondary me-1">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mb-3">
                        <small className="text-muted">
                          <strong>Vožnja:</strong> {tourData.drivingStats?.distance ? formatDistance(tourData.drivingStats.distance) : 'N/A'} ({tourData.drivingStats?.duration ? formatDuration(tourData.drivingStats.duration) : 'N/A'})<br/>
                          <strong>Hodanje:</strong> {tourData.walkingStats?.distance ? formatDistance(tourData.walkingStats.distance) : 'N/A'} ({tourData.walkingStats?.duration ? formatDuration(tourData.walkingStats.duration) : 'N/A'})<br/>
                          <strong>Bicikl:</strong> {tourData.cyclingStats?.distance ? formatDistance(tourData.cyclingStats.distance) : 'N/A'} ({tourData.cyclingStats?.duration ? formatDuration(tourData.cyclingStats.duration) : 'N/A'})
                        </small>
                      </div>

                      {tourData.reviews && tourData.reviews.length > 0 && (
                        <div className="mb-3">
                          <small className="text-muted">
                            <strong>Ocena:</strong> 
                            {tourData.reviews.reduce((acc, review) => acc + review.rating, 0) / tourData.reviews.length} / 5
                            ({tourData.reviews.length} recenzija)
                          </small>
                        </div>
                      )}

                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h4 className="text-primary mb-0">€{tourData.price || 0}</h4>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => navigate(`/tour/${tourData.id}`)}
                            >
                              Pogledaj Detalje
                            </button>
                            {purchasedTours.has(tourData.id) ? (
                              <span className="badge bg-success fs-6">Već kupljeno ✓</span>
                            ) : (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => addToCart(tourData.id, tourData.name, tourData.price || 0)}
                              >
                                Dodaj u Korpu
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableTours;
 