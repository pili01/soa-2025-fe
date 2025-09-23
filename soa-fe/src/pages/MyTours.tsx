import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Tour } from "../models/Tour";
import { getTours, publishTour, archiveTour, setTourPrice } from "../services/CreateTourService";
import AuthService from "../services/AuthService";
import "bootstrap/dist/css/bootstrap.min.css";

export default function MyTours() {
    const navigate = useNavigate();
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [selectedTourId, setSelectedTourId] = useState<number | null>(null); 
    const [price, setPrice] = useState<number>(0); 

    useEffect(() => {
      if (!AuthService.isAuthenticated()) {
        navigate('/login');
        return;
      }
    }, [navigate]);

    const fetchTours = async (signal: AbortSignal) => {
      try {
        const data = await getTours(signal);
        if (Array.isArray(data)) {
          setTours(data);
        } else {
          setTours([]);
        }
      } catch (err: any) {
        console.error("Error fetching tours:", err);
        if (axios.isCancel?.(err) || err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
          return;
        }
        setError(err?.response?.data?.message ?? err?.message ?? "Unknown error");
        setTours([]);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      const ac = new AbortController();
      setLoading(true);
      fetchTours(ac.signal);
      return () => ac.abort();
    }, []);

    const handlePublishTour = async (tourId: number) => {
      try {
        await publishTour(tourId);
        setLoading(true);
        await fetchTours(new AbortController().signal);
      } catch (err: any) {
        console.error("Failed to publish tour:", err);
        setError(err?.response?.data?.message ?? err?.message ?? "Failed to publish tour");
      }
    };

    const handleArchiveTour = async (tourId: number) => {
      try {
        await archiveTour(tourId);
        setLoading(true);
        await fetchTours(new AbortController().signal);
      } catch (err: any) {
        console.error("Failed to archive tour:", err);
        setError(err?.response?.data?.message ?? err?.message ?? "Failed to archive tour");
      }
    };

    // Funkcije za rad sa modalom
    const handleSetPriceClick = (tourId: number) => {
      setSelectedTourId(tourId);
      setIsModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedTourId(null);
      setPrice(0); // Resetuj cenu
    };

    const handleApplyPrice = async () => {
      if (selectedTourId !== null) {
        try {
          await setTourPrice(selectedTourId, price);
          handleCloseModal();
          setLoading(true);
          await fetchTours(new AbortController().signal);
        } catch (err: any) {
          console.error("Failed to set price:", err);
          setError(err?.response?.data?.message ?? err?.message ?? "Failed to set price");
        }
      }
    };

    if (loading) return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Učitavam ture...</p>
        </div>
      </div>
    );

    if (error) return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Greška!</h4>
          <p>{error}</p>
        </div>
      </div>
    );
        
    return (
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header">
                <h2 className="mb-0">Moje ture</h2>
              </div>
              <div className="card-body">
                {!tours || tours.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted mb-3">Nemaš još uvek kreirane ture.</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/create-tour')}
                      >
                        Kreiraj prvu turu
                      </button>
                    </div>
                  ) : (
                    <div className="row">
                      {tours.map((tour, index) => (
                        <div key={tour.id || index} className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body d-flex flex-column">
                              <h5 className="card-title">{tour.name || `Tura ${index + 1}`}</h5>
                              <p className="card-text text-muted flex-grow-1">{tour.description || 'Nema opisa'}</p>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className={`badge ${
                                  tour.difficulty === 'Easy' ? 'bg-success' : 
                                  tour.difficulty === 'Medium' ? 'bg-warning' : 'bg-danger'
                                }`}>
                                  {tour.difficulty === 'Easy' ? 'Lako' : 
                                   tour.difficulty === 'Medium' ? 'Srednje' : 'Teško'}
                                </span>
                                <div className="d-flex flex-column text-end">
                                  <small className="text-muted">
                                    Status: <strong>{tour.status}</strong>
                                  </small>
                                  <small className="text-muted">
                                    Price: <strong>${tour.price}</strong>
                                  </small>
                                </div>
                              </div>
                              <div className="d-flex justify-content-end align-items-center">
                                <small className="text-muted">
                                  {tour.tags && tour.tags.length > 0 ? tour.tags.join(', ') : 'Nema tagova'}
                                </small>
                              </div>
                              <div className="mt-3 d-flex gap-2">
                                {tour.status === "Published" ? (
                                  <button
                                    className="btn btn-sm btn-danger w-100"
                                    onClick={() => handleArchiveTour(tour.id)}
                                  >
                                    Archive Tour
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-sm btn-success w-100"
                                    onClick={() => handlePublishTour(tour.id)}
                                  >
                                    Publish
                                  </button>
                                )}
                                <button
                                  className="btn btn-sm btn-primary w-100"
                                  onClick={() => handleSetPriceClick(tour.id)} // Pozivamo novu funkciju
                                >
                                  Set Price
                                </button>
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
        </div>

        {/* Prozorcic za Set Price */}
        {isModalOpen && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Set Price</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="price-input" className="form-label">Enter new price:</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="price-input" 
                      value={price} 
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleApplyPrice}>
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}