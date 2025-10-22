import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase";
import { Spin } from "antd";
import { useUserProfile } from "../../hooks/useUserProfile";
import { AppSidebar } from "./components/AppSidebar/AppSidebar";
import { PatientHeader } from "./components/PatientHeader/PatientHeader";
import { Settings } from "./components/Settings/Settings";
import "./PatientDashboard.scss";

const PatientSettings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {
    userProfile,
    loading: profileLoading,
    error: profileError,
  } = useUserProfile();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center justify-center">
          <Spin size="large" />
          <span className="ml-2">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AppSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <PatientHeader />
        <main
          style={{ flex: 1, overflow: "auto", backgroundColor: "#ffffff" }}
          className="main-content"
        >
          <Settings />
        </main>
      </div>
    </div>
  );
};

export default PatientSettings;
