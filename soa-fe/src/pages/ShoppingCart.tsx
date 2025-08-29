import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

interface CartItem {
  id: number;
  tour_id: number;
  tour_name: string;
  price: number;
}

interface CartResponse {
  id: number;
  items: CartItem[];
  total_price: number;
}

const ShoppingCart: React.FC = () => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/purchase/cart', {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

             if (response.ok) {
         const data = await response.json();
         console.log('Cart data received:', data); // Debug log
         setCart(data);
       } else {
        setError('Greška pri učitavanju korpe');
      }
    } catch (error) {
      setError('Greška pri učitavanju korpe');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const response = await fetch('http://localhost:8080/api/purchase/cart/items', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({
          item_id: itemId
        })
      });

      if (response.ok) {
        // Refresh cart after removal
        fetchCart();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Greška pri uklanjanju iz korpe');
      }
    } catch (error) {
      setError('Greška pri uklanjanju iz korpe');
    }
  };

  const processCheckout = async () => {
    try {
      setCheckoutLoading(true);
      const response = await fetch('http://localhost:8080/api/purchase/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({
          cart_id: cart?.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Kupovina uspešna! Dobili ste token-e za sve ture.');
        // Redirect to available tours where they can now see all keypoints
        navigate('/available-tours');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Greška pri checkout-u');
      }
    } catch (error) {
      setError('Greška pri checkout-u');
    } finally {
      setCheckoutLoading(false);
    }
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

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <h3>Vaša korpa je prazna</h3>
          <p className="text-muted">Dodajte ture da biste nastavili sa kupovinom.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/available-tours')}
          >
            Pogledaj Dostupne Ture
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Shopping Korpa</h2>
          
          <div className="row">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Stavke u korpi</h5>
                </div>
                <div className="card-body">
                  {cart.items && cart.items.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between align-items-center border-bottom py-3">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{item.tour_name}</h6>
                        <small className="text-muted">ID ture: {item.tour_id}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="h5 text-primary me-3 mb-0">€{item.price}</span>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Ukloni
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Pregled kupovine</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <span>Broj stavki:</span>
                    <strong>{cart.items ? cart.items.length : 0}</strong>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-3">
                    <span>Ukupna cena:</span>
                    <strong className="h4 text-primary mb-0">€{cart.total_price}</strong>
                  </div>
                  
                  <button
                    className="btn btn-success w-100"
                    onClick={processCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Procesiranje...
                      </>
                    ) : (
                      'Checkout - Kupi Ture'
                    )}
                  </button>
                  
                  <div className="mt-3">
                    <small className="text-muted">
                      Nakon uspešne kupovine dobićete token-e za sve ture koje omogućavaju pristup svim keypoint-ovima.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
