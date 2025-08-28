import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Tour } from "../models/Tour";
import { getTours } from "../services/CreateTourService";
import { AuthService } from "../services/AuthService";
import "bootstrap/dist/css/bootstrap.min.css";

export default function MyTours() {
    const navigate = useNavigate();
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if user is authenticated
    useEffect(() => {
      if (!AuthService.isAuthenticated()) {
        navigate('/login');
        return;
      }
    }, [navigate]);

    useEffect(() => {
      const ac = new AbortController();
      setLoading(true);

      (async () => {
        try {
          const demoTours = await getTours(ac.signal);
          
          // Ensure tours is always an array
          if (Array.isArray(demoTours)) {
            setTours(demoTours);
          } else {
            setTours([]);
          }


        } catch (err: any) {
          console.error("Error in useEffect:", err);
          if (axios.isCancel?.(err) || err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
            return;
          }
          setError(err?.response?.data?.message ?? err?.message ?? "Unknown error");
          setTours([]); // Set empty array on error
        } finally {
          setLoading(false);
        }
      })();

      return () => ac.abort();
    }, []);


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
        {/* Lista tura */}
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
                         <div className="card-body">
                           <h5 className="card-title">{tour.name || `Tura ${index + 1}`}</h5>
                           <p className="card-text text-muted">{tour.description || 'Nema opisa'}</p>
                           <div className="d-flex justify-content-between align-items-center">
                             <span className={`badge ${
                               tour.difficulty === 'Easy' ? 'bg-success' : 
                               tour.difficulty === 'Medium' ? 'bg-warning' : 'bg-danger'
                             }`}>
                               {tour.difficulty === 'Easy' ? 'Lako' : 
                                tour.difficulty === 'Medium' ? 'Srednje' : 'Teško'}
                             </span>
                             <small className="text-muted">
                               {tour.tags && tour.tags.length > 0 ? tour.tags.join(', ') : 'Nema tagova'}
                             </small>
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
    </div>
  );
}