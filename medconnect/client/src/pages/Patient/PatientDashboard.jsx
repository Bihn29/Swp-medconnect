import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase";
import { Spin } from "antd";
import { useUserProfile } from "../../hooks/useUserProfile";
import { DashboardHeader } from "../../components/DashboardHeader";
import {
  ProfileCard,
  QuickActions,
  UpcomingAppointments,
  AppointmentHistory,
  PaymentHistory,
  NotificationsCenter,
  DoctorSearchShortcut,
} from "./components";
import "./PatientDashboard.scss";

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
      <DashboardHeader userProfile={userProfile} />

      <main className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
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
