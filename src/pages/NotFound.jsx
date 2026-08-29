import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
      <h1 style={{ fontSize: "3rem" }}>404</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>Oops, this page wandered off to play.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}
