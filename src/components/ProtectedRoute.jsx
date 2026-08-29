import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-wrap">Loading…</div>;
  if (!user) return <Navigate to="/staff" replace />;

  return children;
}
