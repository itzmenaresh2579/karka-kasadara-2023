import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import HomeEditor from "../admin/HomeEditor";
import AboutEditor from "../admin/AboutEditor";
import ContactEditor from "../admin/ContactEditor";
import GalleryManager from "../admin/GalleryManager";
import "./AdminDashboard.css";

const TABS = [
  { id: "home", label: "Home Page" },
  { id: "about", label: "About Page" },
  { id: "contact", label: "Contact Info" },
  { id: "gallery", label: "Gallery" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("home");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="admin-wrap">
      <div className="admin-topbar">
        <div className="container admin-topbar-inner">
          <div>
            <strong>School Content Manager</strong>
            <div className="admin-user-email">{user?.email}</div>
          </div>
          <button className="btn btn-outline admin-logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <div className="container admin-body">
        <div className="admin-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`admin-tab ${tab === t.id ? "is-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="admin-panel">
          {tab === "home" && <HomeEditor />}
          {tab === "about" && <AboutEditor />}
          {tab === "contact" && <ContactEditor />}
          {tab === "gallery" && <GalleryManager />}
        </div>
      </div>
    </div>
  );
}
