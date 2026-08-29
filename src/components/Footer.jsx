import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer({ contact }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <span className="navbar-logo-dot" />
            <span>Karka Kasadara Kids School</span>
          </div>
          <p className="footer-tag">Nurturing curious little minds in Kodumudi, Tamil Nadu.</p>
        </div>

        <div>
          <h4>Explore</h4>
          <Link to="/about">About Us</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/contact">Admission</Link>
        </div>

        <div>
          <h4>Contact</h4>
          <p>{contact?.address || "Kodumudi, Tamil Nadu"}</p>
          <p>{contact?.phone || ""}</p>
          <p>{contact?.email || ""}</p>
        </div>
      </div>
      <div className="footer-bottom container">
        <span>© {new Date().getFullYear()} Karka Kasadara Kids School. All rights reserved.</span>
      </div>
    </footer>
  );
}
