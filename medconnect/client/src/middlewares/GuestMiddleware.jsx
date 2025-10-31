import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUserProfile } from "../hooks/useUserProfile";

const GuestMiddleware = () => {
  const { user, loading: authLoading } = useAuth();
  const { userProfile, loading: profileLoading } = useUserProfile();

  if (authLoading || profileLoading) return null;

  // If user is authenticated, redirect to appropriate dashboard
  if (user && userProfile) {
    const userRole = userProfile?.role || user?.role;

    if (userRole === "doctor") {
      return <Navigate to="/bac-si/trang-chu" replace />;
    } else if (userRole === "admin" || userRole === "ADMIN") {
      return <Navigate to="/admin/trang-chu" replace />;
    } else if (userRole === "patient" || userRole === "user" || !userRole) {
      return <Navigate to="/benh-nhan/trang-chu" replace />;
    }
  }

  return <Outlet />;
};

export default GuestMiddleware;
