import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../lib/firebase";
import { Spin } from "antd";
import { useUserProfile } from "../../hooks/useUserProfile";
import { AppSidebar } from "./components/AppSidebar/AppSidebar";
import { PatientHeader } from "./components/PatientHeader/PatientHeader";
import { WelcomeSection } from "./components/WelcomeSection/WelcomeSection";
import { StatsCards } from "./components/StatsCards/StatsCards";
import { UpcomingAppointments } from "./components/UpcomingAppointments/UpcomingAppointments";
import { AppointmentCalendar } from "./components/AppointmentCalendar/AppointmentCalendar";
import { QuickActions } from "./components/QuickActions/QuickActions";
import { Settings } from "./components/Settings/Settings";
import { DoctorSearch } from "./components/DoctorSearch/DoctorSearch";
import { MyAppointments } from "./components/MyAppointments/MyAppointments";
import { OnlineConsultation } from "./components/OnlineConsultation/OnlineConsultation";
import "./PatientDashboard.scss";

/**
 * PatientDashboard Component
 *
 * Implements UC16: Patient dashboard with upcoming appointments and past consultation records
 *
 * Features:
 * - Profile management (UC4)
 * - Quick actions for common tasks (UC8, UC10)
 * - Doctor search shortcut (UC8, UC18)
 * - Upcoming appointments (UC12, UC16)
 * - Appointment history (UC16)
 * - Payment history (UC11)
 * - Notifications center (UC12)
 *
 * Business Rules Compliance:
 * - Data privacy: Uses authenticated user context only
 * - Medical liability: Dashboard is informational only
 */

export default function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    userProfile,
    loading: profileLoading,
    error: profileError,
    refreshProfile,
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

  // Redirect if no user
  if (!user) {
    navigate("/login");
    return null;
  }

  // Render different content based on current route
  const renderContent = () => {
    const path = location.pathname;

    switch (path) {
      case "/search-doctors":
        return <DoctorSearch />;
      case "/my-appointments":
        return <MyAppointments />;
      case "/tu-van-truc-tuyen":
        return <OnlineConsultation />;
      case "/benh-nhan/cai-dat":
        return <Settings />;
      default:
        // Default dashboard home
        return (
          <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
            <div className="space-y-6">
              <WelcomeSection />
              <StatsCards />
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <AppointmentCalendar />
                  <UpcomingAppointments />
                </div>
                <div className="space-y-6">
                  <QuickActions />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AppSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <PatientHeader />
        <main style={{ flex: 1, overflow: "auto" }} className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
