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
        Đang kiểm tra quyền truy cập admin...
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  // Check if user is an admin
  const isAdmin = 
    userProfile?.role === "admin" || 
    userProfile?.role === "ADMIN" ||
    user?.role === "admin" ||
    user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "16px",
          color: "#f5222d",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ color: "#f5222d", marginBottom: "10px" }}>
            🔒 Truy cập bị từ chối
          </h2>
          <p>
            Bạn không có quyền truy cập trang admin. Chỉ có tài khoản admin mới có thể truy cập.
          </p>
        </div>
        
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1890ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Quay lại
          </button>
          
          <button
            onClick={() => window.location.href = "/"}
            style={{
              padding: "10px 20px",
              backgroundColor: "#52c41a",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminMiddleware;
