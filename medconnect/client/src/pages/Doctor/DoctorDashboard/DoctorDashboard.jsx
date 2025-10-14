"use client"

import { useState } from "react"
import Sidebar from "../Sidebar/Sidebar"
import DashboardOverview from "../DashboardOverview/DashboardOverview"
import CalendarView from "../Calendar/CalendarView"
import AppointmentList from "../AppointmentList/AppointmentList"
import AppointmentDetail from "../AppointmentDetail/AppointmentDetail"
import ConsultationRecords from "../ConsultationRecords/ConsultationRecords"
import ProfileSettings from "../ProfileSettings/ProfileSettings"
import ScheduleManagement from "../ScheduleManagement/ScheduleManagement"
import Notifications from "../Notifications/Notifications"
import Feedback from "../Feedback/Feedback"

const DoctorDashboard = () => {
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <DashboardOverview
            onViewAppointments={() => setActiveView("appointments")}
            onViewSchedule={() => setActiveView("schedule")}
            onViewNotifications={() => setActiveView("notifications")}
            onViewFeedback={() => setActiveView("feedback")}
          />
        )
      case "schedule":
        return <ScheduleManagement />
      case "calendar":
        return <CalendarView />
      case "appointments":
        return selectedAppointment ? (
          <AppointmentDetail appointment={selectedAppointment} onBack={() => setSelectedAppointment(null)} />
        ) : (
          <AppointmentList onSelectAppointment={setSelectedAppointment} />
        )
      case "consultations":
        return <ConsultationRecords />
      case "notifications":
        return <Notifications />
      case "feedback":
        return <Feedback />
      case "profile":
        return <ProfileSettings />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="flex-1 ml-[280px] p-8 overflow-y-auto">{renderContent()}</main>
    </div>
  )
}

export default DoctorDashboard
