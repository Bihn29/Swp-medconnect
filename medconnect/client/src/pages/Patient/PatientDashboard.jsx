import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase";
import { Spin } from "antd";
import { useUserProfile } from "../../hooks/useUserProfile";
import { ProfileCard } from "./components/ProfileCard/ProfileCard";
import { QuickActions } from "./components/QuickActions/QuickActions";
import { UpcomingAppointments } from "./components/UpcomingAppointments/UpcomingAppointments";
import { AppointmentHistory } from "./components/AppointmentHistory/AppointmentHistory";
import { PaymentHistory } from "./components/PaymentHistory/PaymentHistory";
import { NotificationsCenter } from "./components/NotificationsCenter/NotificationsCenter";
import { DoctorSearchShortcut } from "./components/DoctorSearchShortcut/DoctorSearchShortcut";
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
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main
        className="container mx-auto px-4 py-6 lg:px-8 lg:py-8"
        style={{ marginTop: "3rem", marginBottom: "3rem" }}
      >
        <div className="space-y-6">
          {/* Top Section - Profile & Quick Actions */}
          <div className="grid gap-6 lg:grid-cols-3">
            <ProfileCard userProfile={userProfile} />
            <div className="lg:col-span-2">
              <QuickActions />
            </div>
          </div>

          {/* Doctor Search */}
          <DoctorSearchShortcut />

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Appointments & History */}
            <div className="lg:col-span-2 space-y-6">
              <UpcomingAppointments />
              <AppointmentHistory />
            </div>

            {/* Right Column - Notifications & Payments */}
            <div className="space-y-6">
              <NotificationsCenter />
              <PaymentHistory />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
