import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../services/AuthService';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'Tourist', // Default role
    name: '',
    surname: '',
    biography: '',
    moto: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      
      // Dodaj sva polja
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Dodaj sliku ako je izabrana
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      const response = await AuthService.register(formDataToSend);
      setSuccess(response.message);
      
      // Reset forma nakon uspešne registracije
      setTimeout(() => {
        // Redirect na login stranicu
        window.location.href = '/login';
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
                <h2 className="fw-bold">Create Account</h2>
                <p className="text-muted">Join us and start your travel journey!</p>
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
                        placeholder="Choose a username"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password *</label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Create a password"
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
                        placeholder="Enter your email"
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
                        placeholder="Enter your first name"
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
                        placeholder="Enter your last name"
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
                
                <div className="mb-4">
                  <label htmlFor="image" className="form-label">Profile Photo</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="form-control form-control-lg"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <div className="mt-2">
                      <small className="text-muted">
                        Selected: {selectedFile.name}
                      </small>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger ms-2"
                        onClick={clearFile}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-decoration-none fw-bold">
                      Login here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
