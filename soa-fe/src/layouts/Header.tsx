import { NavLink, Outlet, ScrollRestoration } from "react-router-dom";
import "../styles/header.css";

export default function Header() {
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
                <NavLink to="/" end className={({isActive}) => `nav-link${isActive ? " active" : ""}`}>Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/blog" className={({isActive}) => `nav-link${isActive ? " active" : ""}`}>Blogs</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tours" className={({isActive}) => `nav-link${isActive ? " active" : ""}`}>Tours</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/create-tour" className={({isActive}) => `nav-link${isActive ? " active" : ""}`}>Create tour</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/my-tours" className={({isActive}) => `nav-link${isActive ? " active" : ""}`}>My tours</NavLink>
              </li>
            </ul>
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
