import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

interface Keypoint {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  ordinal: number;
  imageUrl?: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  touristId: number;
  visitDate: string;
  commentDate: string;
  imageUrls: string[];
}

interface TourResponse {
  tour: Tour;
  firstKeypoint?: Keypoint;
  keypoints?: Keypoint[];
  reviews: Review[];
  message: string;
}

const TourDetails: React.FC = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const [tourInfo, setTourInfo] = useState<TourResponse | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (tourId) {
      checkPurchaseStatusAndFetchTour();
      checkCartStatus();
    }
  }, [tourId]);

  // Dodatni useEffect za proveru korpe
  useEffect(() => {
    if (tourId) {
      checkCartStatus();
    }
  }, [tourId]);

  const checkCartStatus = async () => {
    const inCart = await checkIfInCart();
    setIsInCart(inCart);
  };



  const checkPurchaseStatusAndFetchTour = async () => {
    try {
      setLoading(true);
      
      // Prvo proveri da li je tura kupljena kroz token-e
      const purchaseResponse = await fetch(`http://localhost:8080/api/purchase/check-is-purchased/${tourId}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      let purchaseStatus = false;
      if (purchaseResponse.ok) {
        const purchaseData = await purchaseResponse.json();
        purchaseStatus = purchaseData.purchased;
        setIsPurchased(purchaseData.purchased);
      }

      // Zatim dohvati informacije o turi sa ispravnim statusom
      await fetchTourInfo(purchaseStatus);
      
    } catch (error) {
      setError('Greška pri proveri statusa kupovine');
    } finally {
      setLoading(false);
    }
  };

  // Dodatna funkcija za proveru da li je tura već u korpi
  const checkIfInCart = async () => {
    try {
      const cartResponse = await fetch('http://localhost:8080/api/purchase/cart', {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        // Proveri da li je trenutna tura već u korpi
        const isInCart = cartData.items && cartData.items.some((item: any) => item.tour_id === parseInt(tourId!));
        return isInCart;
      }
      return false;
    } catch (error) {
      console.error('Greška pri proveri korpe:', error);
      return false;
    }
  };

  const fetchTourInfo = async (purchaseStatus: boolean) => {
    try {
      let endpoint = '';
      
      if (purchaseStatus) {
        // Ako je kupljena - dohvati sve keypoint-ove
        endpoint = `http://localhost:8080/api/tours/${tourId}/purchased-keypoints`;
      } else {
        // Ako nije kupljena - dohvati samo prvi keypoint
        endpoint = `http://localhost:8080/api/tours/${tourId}/tourist-view`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTourInfo(data);
      } else {
        setError('Greška pri učitavanju informacija o turi');
      }
    } catch (error) {
      setError('Greška pri učitavanju informacija o turi');
    }
  };

  const addToCart = async () => {
    if (!tourInfo) return;

    try {
      setAddingToCart(true);
      const response = await fetch('http://localhost:8080/api/purchase/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({
          tour_id: tourInfo.tour.id,
          tour_name: tourInfo.tour.name,
          price: tourInfo.tour.price,
          quantity: 1
        })
      });

      if (response.ok) {
        alert('Tura uspešno dodana u korpu!');
        setIsInCart(true); // Ažuriraj state
        navigate('/shopping-cart');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Greška pri dodavanju u korpu');
      }
    } catch (error) {
      setError('Greška pri dodavanju u korpu');
    } finally {
      setAddingToCart(false);
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
          <button 
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => setError('')}
          >
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  if (!tourInfo) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Tura nije pronađena.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          {/* Tour Header */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h1 className="card-title">{tourInfo.tour.name}</h1>
                  <p className="lead text-muted">{tourInfo.tour.description}</p>
                </div>
                <div className="text-end">
                  <h2 className="text-primary mb-2">€{tourInfo.tour.price}</h2>
                  
                  {/* Ako je kupljena - prikaži "Kupljeno ✓" */}
                  {isPurchased && (
                    <span className="badge bg-success fs-6">Kupljeno ✓</span>
                  )}
                  
                  {/* Ako nije kupljena ali je u korpi - prikaži "U Korpi" */}
                  {!isPurchased && isInCart && (
                    <span className="badge bg-info fs-6">U Korpi ✓</span>
                  )}
                  
                  {/* Ako nije kupljena i nije u korpi - prikaži dugme */}
                  {!isPurchased && !isInCart && (
                    <button
                      className="btn btn-success btn-lg"
                      onClick={addToCart}
                      disabled={addingToCart}
                    >
                      {addingToCart ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Dodavanje...
                        </>
                      ) : (
                        'Dodaj u Korpu'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Tour Stats */}
              <div className="row mt-4">
                <div className="col-md-4">
                  <div className="text-center">
                    <h5>Vožnja</h5>
                    <p className="mb-1">{formatDistance(tourInfo.tour.drivingStats.distance)}</p>
                    <small className="text-muted">{formatDuration(tourInfo.tour.drivingStats.duration)}</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <h5>Hodanje</h5>
                    <p className="mb-1">{formatDistance(tourInfo.tour.walkingStats.distance)}</p>
                    <small className="text-muted">{formatDuration(tourInfo.tour.walkingStats.duration)}</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <h5>Bicikl</h5>
                    <p className="mb-1">{formatDistance(tourInfo.tour.cyclingStats.distance)}</p>
                    <small className="text-muted">{formatDuration(tourInfo.tour.cyclingStats.duration)}</small>
                  </div>
                </div>
              </div>

              {/* Difficulty and Tags */}
              <div className="mt-3">
                <span className={`badge me-2 ${
                  tourInfo.tour.difficulty === 'Easy' ? 'bg-success' :
                  tourInfo.tour.difficulty === 'Medium' ? 'bg-warning' : 'bg-danger'
                }`}>
                  {tourInfo.tour.difficulty}
                </span>
                
                {tourInfo.tour.tags && tourInfo.tour.tags.map((tag, index) => (
                  <span key={index} className="badge bg-secondary me-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Keypoints Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="mb-0">
                {isPurchased ? 'Sve Ključne Tačke' : 'Prva Ključna Tačka'}
              </h3>
              {!isPurchased && (
                <small className="text-muted">
                  Kupite turu da biste videli sve ključne punktove
                </small>
              )}
            </div>
            <div className="card-body">
              {isPurchased && tourInfo.keypoints && tourInfo.keypoints.length > 0 ? (
                // Prikaži sve keypoint-ove
                <div className="row">
                  {tourInfo.keypoints.map((keypoint) => (
                    <div key={keypoint.id} className="col-lg-6 col-xl-4 mb-3">
                      <div className="card h-100">
                        {keypoint.imageUrl && (
                          <img 
                            src={keypoint.imageUrl} 
                            className="card-img-top" 
                            alt={keypoint.name}
                            style={{ height: '150px', objectFit: 'cover' }}
                          />
                        )}
                        <div className="card-body">
                          <h6 className="card-title">
                            {keypoint.ordinal}. {keypoint.name}
                          </h6>
                          <p className="card-text small">{keypoint.description}</p>
                          <small className="text-muted">
                            Koordinate: {keypoint.latitude.toFixed(4)}, {keypoint.longitude.toFixed(4)}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Prikaži samo prvi keypoint
                tourInfo.firstKeypoint && (
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="card">
                        {tourInfo.firstKeypoint.imageUrl && (
                          <img 
                            src={tourInfo.firstKeypoint.imageUrl} 
                            className="card-img-top" 
                            alt={tourInfo.firstKeypoint.name}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        )}
                        <div className="card-body">
                          <h5 className="card-title">
                            1. {tourInfo.firstKeypoint.name}
                          </h5>
                          <p className="card-text">{tourInfo.firstKeypoint.description}</p>
                          <small className="text-muted">
                            Koordinate: {tourInfo.firstKeypoint.latitude.toFixed(4)}, {tourInfo.firstKeypoint.longitude.toFixed(4)}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Reviews Section */}
            <div className="card">
              <div className="card-header">
                <h3 className="mb-0">Recenzije</h3>
              </div>
              <div className="card-body">
              {tourInfo.reviews && tourInfo.reviews.length > 0 ? (
                tourInfo.reviews.map((review) => (
                  <div key={review.id} className="border-bottom pb-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                                                 <h6 className="mb-1">Turista {review.touristId}</h6>
                        <div className="mb-2">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-${i < review.rating ? 'warning' : 'muted'}`}>
                              ★
                            </span>
                          ))}
                          <span className="ms-2 text-muted">({review.rating}/5)</span>
                        </div>
                        <p className="mb-1">{review.comment}</p>
                      </div>
                      <small className="text-muted">
                         {new Date(review.commentDate).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">Još nema recenzija za ovu turu.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetails;
