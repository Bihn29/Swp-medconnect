import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const GuestMiddleware = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? <Outlet /> : <Navigate to="/patient" />;
};

export default GuestMiddleware;
