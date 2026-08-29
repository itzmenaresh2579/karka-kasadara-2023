import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/gallery", label: "Gallery" },
    { to: "/contact", label: "Admission" },
  ];

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          <span className="navbar-logo-dot" />
          <span className="navbar-brand-text">
            Karka Kasadara
            <small>Kids School</small>
          </span>
        </Link>

        <nav className={`navbar-links ${open ? "is-open" : ""}`}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `navbar-link ${isActive ? "is-active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/staff" className="btn btn-primary navbar-staff-btn" onClick={() => setOpen(false)}>
            Staff Login
          </Link>
        </nav>

        <button aria-label="Menu" className="navbar-burger" onClick={() => setOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
