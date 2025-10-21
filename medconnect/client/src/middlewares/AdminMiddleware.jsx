import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUserProfile } from "../hooks/useUserProfile";

const AdminMiddleware = () => {
  const { user, loading } = useAuth();
  const { userProfile, loading: profileLoading } = useUserProfile();

  // Show loading while checking authentication
  if (loading || profileLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "16px",
          color: "#666",
        }}
      >
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  // Check if user is an admin
  const isAdmin = userProfile?.role === "admin";

  if (!isAdmin) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "16px",
          color: "#f5222d",
        }}
      >
        Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản admin.
      </div>
    );
  }

  return <Outlet />;
};

export default AdminMiddleware;
