import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="display-4 mb-4">Welcome to Travel Application</h1>
          <p className="lead text-muted mb-5">
            Discover amazing destinations, create unforgettable tours, and connect with fellow travelers.
          </p>
          
          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="btn btn-primary btn-lg px-4">
              Login
            </Link>
            <Link to="/register" className="btn btn-outline-primary btn-lg px-4">
              Register
            </Link>
            <Link to="/available-tours" className="btn btn-success btn-lg px-4">
              Browse Tours
            </Link>
          </div>
          
          <div className="mt-5">
            <div className="row">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center">
                    <h5 className="card-title">Explore Tours</h5>
                    <p className="card-text text-muted">
                      Discover amazing tours created by experienced guides
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center">
                    <h5 className="card-title">Create Tours</h5>
                    <p className="card-text text-muted">
                      Share your expertise and create unique travel experiences
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center">
                    <h5 className="card-title">Connect</h5>
                    <p className="card-text text-muted">
                      Connect with fellow travelers and share experiences
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}