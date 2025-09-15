import React, { useState, useRef, useEffect } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AuthService from '../services/AuthService';

export default function EditProfile() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'Tourist', // Default role
    name: '',
    surname: '',
    biography: '',
    moto: '',
    photo_url: '',
    old_photo_url: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        const profile = await AuthService.getMyProfile();
        setFormData({
          username: profile.username || '',
          email: profile.email || '',
          role: profile.role || 'Tourist',
          name: profile.name || '',
          surname: profile.surname || '',
          biography: profile.biography || '',
          moto: profile.moto || '',
          photo_url: profile.photo_url || '',
          old_photo_url: profile.photo_url || '',
        });
        // If profile image exists, you can show it here
        if (profile.photo_url) {
          const photoUrl = await AuthService.getProfilePhoto(profile.photo_url);
          setFormData(prev => ({
            ...prev,
            photo_url: photoUrl
          }));
        }
      } catch (err) {
        setError('Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };


  // Update profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        // Don't send empty password unless changed
        // if (key === 'password' && !value) return;
        if (key !== 'photo_url') {
          formDataToSend.append(key, value);
        }
      });
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
        const responsePhoto = await AuthService.updatePhoto(selectedFile);
        formDataToSend.append('photo_url', responsePhoto.photoName);
      }else{
        formDataToSend.append('photo_url', formData.old_photo_url);
      }
      const response = await AuthService.updateProfile(formDataToSend);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Edit Profile</h2>
                <p className="text-muted">Update your information below.</p>
              </div>

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

              {/* Profile photo with pencil icon overlay */}
              <div className="mb-4 d-flex justify-content-center">
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : formData.photo_url || '/default-profile.png'}
                    alt="Profile"
                    style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%', border: '2px solid #ddd' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      background: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      padding: 8,
                      boxShadow: '0 0 4px rgba(0,0,0,0.2)',
                      cursor: 'pointer',
                    }}
                    aria-label="Edit photo"
                  >
                    <FaPencilAlt size={18} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="d-none"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                {selectedFile && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger ms-3 align-self-center"
                    onClick={clearFile}
                  >
                    Remove
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label">Username *</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        placeholder="Username"
                        disabled // Username usually can't be changed
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Email"
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="role" className="form-label">Role *</label>
                      <select
                        className="form-select form-select-lg"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        disabled // Role usually can't be changed
                      >
                        <option value="Tourist">Tourist</option>
                        <option value="Guide">Guide</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="First name"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="surname" className="form-label">Surname *</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="surname"
                        name="surname"
                        value={formData.surname}
                        onChange={handleInputChange}
                        required
                        placeholder="Last name"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="biography" className="form-label">Biography</label>
                      <textarea
                        className="form-control form-control-lg"
                        id="biography"
                        name="biography"
                        rows={3}
                        value={formData.biography}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="moto" className="form-label">Moto</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="moto"
                        name="moto"
                        value={formData.moto}
                        onChange={handleInputChange}
                        placeholder="Your personal motto"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <div className="text-center">
                  <Link to="/" className="text-decoration-none fw-bold">
                    Back to Home
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
