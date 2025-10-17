import { Route } from "react-router-dom";

// Layouts
import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";

// Middlewares
import AuthMiddleware from "../middlewares/AuthMiddleware";
import PatientMiddleware from "../middlewares/PatientMiddleware";

// Shared Components
import Profile from "../pages/Auth/Profile";

// Patient Components
import PatientDashboard from "../pages/Patient/PatientDashboard";
import PatientSettings from "../pages/Patient/PatientSettings";
import AppointmentBooking from "../pages/Appointment/AppointmentBooking";

// Doctor Components
import DoctorDashboard from "../pages/Doctor/DoctorDashboard/DoctorDashboard";
import AppointmentList from "../pages/Doctor/AppointmentList/AppointmentList";
import AppointmentDetail from "../pages/Doctor/AppointmentDetail/AppointmentDetail";
import CalendarView from "../pages/Doctor/Calendar/CalendarView";
import ConsultationRecords from "../pages/Doctor/ConsultationRecords/ConsultationRecords";
import ProfileSettings from "../pages/Doctor/ProfileSettings/ProfileSettings";
import ScheduleManagement from "../pages/Doctor/ScheduleManagement/ScheduleManagement";
import Notifications from "../pages/Doctor/Notifications/Notifications";
import Feedback from "../pages/Doctor/Feedback/Feedback";

/**
 * Private Routes - Routes requiring authentication
 * Organized by user roles and functionality
 */
export const privateRoutes = (
  <>
    {/* ==================== PATIENT DASHBOARD (NO DEFAULT LAYOUT) ==================== */}
    {/* Patient dashboard with custom layout (no default header/footer) */}
    <Route element={<AuthMiddleware />}>
      <Route element={<PatientMiddleware />}>
        <Route path="/benh-nhan" element={<PatientDashboard />} />
        <Route path="/benh-nhan/cai-dat" element={<PatientSettings />} />
      </Route>
    </Route>

    {/* ==================== OTHER ROUTES WITH DEFAULT LAYOUT ==================== */}
    <Route element={<DefaultLayout />}>
      {/* ==================== AUTHENTICATED ROUTES ==================== */}
      <Route element={<AuthMiddleware />}>
        {/* ==================== SHARED ROUTES ==================== */}
        {/* Routes accessible by all authenticated users */}
        <Route path="/tai-khoan" element={<Profile />} />

        {/* ==================== DOCTOR ROUTES ==================== */}
        {/* Main doctor dashboard */}
        <Route path="/bac-si" element={<DoctorDashboard />} />

        {/* ==================== APPOINTMENT MANAGEMENT ==================== */}
        {/* Doctor appointment management routes */}
        <Route path="/bac-si/lich-hen" element={<AppointmentList />} />
        <Route path="/bac-si/lich-hen/:id" element={<AppointmentDetail />} />

        {/* ==================== SCHEDULE MANAGEMENT ==================== */}
        {/* Doctor schedule and calendar routes */}
        <Route path="/bac-si/lich-lam-viec" element={<CalendarView />} />
        <Route path="/bac-si/quan-ly-lich" element={<ScheduleManagement />} />

        {/* ==================== MEDICAL RECORDS ==================== */}
        {/* Doctor medical records and consultation routes */}
        <Route path="/bac-si/ho-so-kham" element={<ConsultationRecords />} />

        {/* ==================== SETTINGS & PROFILE ==================== */}
        {/* Doctor settings and profile management */}
        <Route path="/bac-si/cai-dat" element={<ProfileSettings />} />

        {/* ==================== NOTIFICATIONS & FEEDBACK ==================== */}
        {/* Doctor notifications and feedback routes */}
        <Route path="/bac-si/thong-bao" element={<Notifications />} />
        <Route path="/bac-si/danh-gia" element={<Feedback />} />
      </Route>

      {/* ==================== PATIENT-SPECIFIC ROUTES ==================== */}
      {/* Routes that require patient role specifically */}
      <Route element={<PatientMiddleware />}>
        <Route path="/dat-lich-kham" element={<AppointmentBooking />} />
      </Route>
    </Route>
  </>
);
