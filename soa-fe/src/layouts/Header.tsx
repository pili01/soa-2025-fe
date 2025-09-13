import { NavLink, Outlet, ScrollRestoration, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "../styles/header.css";
import AuthService from "../services/AuthService";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileImgUrl, setProfileImgUrl] = useState('/default-profile.png');
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    AuthService.getMyProfile().then(profile => {
      if (profile.photo_url) {
        AuthService.getProfilePhoto(profile.photo_url).then(url => {
          setProfileImgUrl(url);
        });
      }
    });
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleEditProfile = () => {
    setDropdownOpen(false);
    navigate('/editProfile');
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    // Add your logout logic here (e.g., clear tokens)
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="light">
        <div className="container">
          <NavLink className="navbar-brand fw-semibold" to="/">Travel application</NavLink>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/" end className="nav-link">Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/blog" className="nav-link">Blogs</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tours" className="nav-link">Tours</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/available-tours" className="nav-link">Available Tours</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/create-tour" className="nav-link">Create tour</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/my-tours" className="nav-link">My tours</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/shopping-cart" className="nav-link">🛒 Cart</NavLink>
              </li>
            </ul>
            {/* Profile image dropdown */}
            <div className="ms-auto position-relative" ref={dropdownRef} style={{ zIndex: 100 }}>
              <img
                src={profileImgUrl}
                alt="Profile"
                style={{ width: 60, height: 60, borderRadius: '25%', objectFit: 'cover', cursor: 'pointer', border: '1px solid #ddd' }}
                onClick={() => setDropdownOpen((open) => !open)}
              />
              {dropdownOpen && (
                <div
                  className="dropdown-menu show"
                  style={{ right: 0, left: 'auto', minWidth: 160, position: 'absolute', top: '110%', background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                >
                  <button className="dropdown-item w-100 text-start" onClick={handleEditProfile} style={{ padding: '10px 16px', border: 'none', background: 'none' }}>
                    Edit Profile
                  </button>
                  <button className="dropdown-item w-100 text-start" onClick={handleLogout} style={{ padding: '10px 16px', border: 'none', background: 'none' }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Outlet />
      </main>

      <ScrollRestoration />
    </>
  );
}
