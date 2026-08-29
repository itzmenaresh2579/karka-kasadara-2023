import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import "./StaffLogin.css";

export default function StaffLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    navigate("/staff/dashboard");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/staff/dashboard");
    } catch (err) {
      setError("Login failed. Please check your email and password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="staff-login-wrap">
      <form className="card staff-login-card" onSubmit={handleSubmit}>
        <div className="navbar-logo-dot" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ textAlign: "center" }}>Staff Login</h2>
        <p style={{ textAlign: "center", color: "var(--ink-soft)", marginBottom: 24 }}>
          Sign in to manage school website content
        </p>

        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={busy}>
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
