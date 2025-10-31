import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Avatar, Spin } from "antd";
import {
  HomeOutlined,
  SearchOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { auth } from "../../lib/firebase";
import { useUserProfile } from "../../hooks/useUserProfile";
import { PatientHeader } from "../../pages/Patient/components/PatientHeader/PatientHeader";
import "./PatientLayout.scss";

const { Sider, Content } = Layout;

const PatientLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userProfile, loading: profileLoading } = useUserProfile();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Redirect if no user
  useEffect(() => {
    if (!loading && !user) {
      navigate("/dang-nhap", { replace: true });
    }
  }, [loading, user, navigate]);

  // Menu items
  const menuItems = [
    {
      key: "/benh-nhan",
      icon: <HomeOutlined />,
      label: "Trang chủ",
    },
    {
      key: "/search-doctors",
      icon: <SearchOutlined />,
      label: "Tìm bác sĩ",
    },
    {
      key: "/my-appointments",
      icon: <CalendarOutlined />,
      label: "Lịch hẹn của tôi",
    },
    {
      key: "/medical-records",
      icon: <FileTextOutlined />,
      label: "Hồ sơ sức khỏe",
    },
    {
      key: "/payments",
      icon: <CreditCardOutlined />,
      label: "Thanh toán",
    },
    {
      key: "/thong-bao",
      icon: <BellOutlined />,
      label: "Thông báo",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = async () => {
    try {
      // Navigate to homepage first, then sign out
      // This prevents the brief login page flash
      navigate("/", { replace: true });
      // Sign out from Firebase (non-blocking)
      auth.signOut().catch(console.error);
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback to hard redirect
      window.location.href = "/";
    }
  };

  // Get user info for sidebar profile
  const userInfo = {
    name: userProfile?.fullName || userProfile?.displayName || "Người dùng",
    email: userProfile?.email || "",
    role: userProfile?.role === "patient" ? "Bệnh nhân" : "Người dùng",
    avatar: userProfile?.photoURL || userProfile?.avatar,
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large">
          <div style={{ padding: "50px" }}>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              Đang tải dữ liệu người dùng...
            </div>
          </div>
        </Spin>
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

  return (
    <Layout className="patient-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="patient-sider"
        width={280}
      >
        <div
          className="patient-logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <div className="logo-icon">
            <PlusOutlined />
          </div>
          <div className="logo-text">
            <div className="logo-title">MedConnect</div>
            <div className="logo-subtitle">Chăm sóc sức khỏe</div>
          </div>
        </div>

        <div className="patient-profile">
          <Avatar
            size={48}
            src={userInfo.avatar}
            icon={!userInfo.avatar && <UserOutlined />}
          />
          <div className="profile-info">
            <div className="profile-name">{userInfo.name}</div>
            <div className="profile-role">{userInfo.role}</div>
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="patient-menu"
        />

        <div className="patient-footer">
          <Menu
            mode="inline"
            items={[
              {
                key: "/benh-nhan/cai-dat",
                icon: <SettingOutlined />,
                label: "Cài đặt",
                onClick: () => navigate("/benh-nhan/cai-dat"),
              },
              {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Đăng xuất",
                onClick: handleLogout,
              },
            ]}
            className="footer-menu"
          />
        </div>
      </Sider>

      <Layout className="patient-main">
        <PatientHeader />

        <Content className="patient-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default PatientLayout;
