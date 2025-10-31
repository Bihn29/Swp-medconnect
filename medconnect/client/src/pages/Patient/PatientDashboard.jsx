import React, { useEffect } from "react";
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

  // Force re-render and scroll to top when location changes
  // This ensures content updates when navigating between different patient routes
  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Render different content based on current route
  const renderContent = () => {
    const path = location.pathname;

    switch (path) {
      case "/benh-nhan/tim-bac-si":
      case "/tim-bac-si": // Legacy route support
      case "/search-doctors": // Legacy route support
        return <DoctorSearch />;
      case "/benh-nhan/lich-hen-cua-toi":
      case "/lich-hen-cua-toi": // Legacy route support
      case "/my-appointments": // Legacy route support
        return <MyAppointments />;
      case "/benh-nhan/ho-so-benh-an":
      case "/ho-so-benh-an": // Legacy route support
      case "/medical-records": // Legacy route support
        return <HealthProfile />;
      case "/benh-nhan/ho-so-suc-khoe-gia-dinh":
      case "/ho-so-suc-khoe-gia-dinh": // Legacy route support
      case "/family-health-records": // Legacy route support
        return <FamilyHealthProfile />;
      case "/benh-nhan/thong-bao":
      case "/thong-bao": // Legacy route support
        return <Notifications />;
      case "/benh-nhan/trang-chu":
      case "/benh-nhan": // Legacy route support
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
