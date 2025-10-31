import React from "react";
import { useLocation } from "react-router-dom";
import { WelcomeSection } from "./components/WelcomeSection/WelcomeSection";
import { StatsCards } from "./components/StatsCards/StatsCards";
import { UpcomingAppointments } from "./components/UpcomingAppointments/UpcomingAppointments";
import { CurrentConsultation } from "./components/CurrentConsultation/CurrentConsultation";
import { AppointmentCalendar } from "./components/AppointmentCalendar/AppointmentCalendar";
import { QuickActions } from "./components/QuickActions/QuickActions";
import { DoctorSearch } from "./components/DoctorSearch/DoctorSearch";
import { MyAppointments } from "./components/MyAppointments/MyAppointments";
import { HealthProfile } from "./components/HealthProfile/HealthProfile";
import { FamilyHealthProfile } from "./components/FamilyHealthProfile/FamilyHealthProfile";
import { Notifications } from "./components/Notifications/Notifications";
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
  const location = useLocation();

  // Render different content based on current route
  const renderContent = () => {
    const path = location.pathname;

    switch (path) {
      case "/search-doctors":
        return <DoctorSearch />;
      case "/my-appointments":
        return <MyAppointments />;
      case "/medical-records":
        return <HealthProfile />;
      case "/family-health-records":
        return <FamilyHealthProfile />;
      case "/thong-bao":
        return <Notifications />;
      default:
        // Default dashboard home
        return (
          <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
            <div className="space-y-6">
              <WelcomeSection />
              <StatsCards />
              <CurrentConsultation />
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

  return renderContent();
}
