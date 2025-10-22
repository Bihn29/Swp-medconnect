import { Route } from "react-router-dom";

// Layouts
import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";

// Middlewares
import AuthMiddleware from "../middlewares/AuthMiddleware";
import PatientMiddleware from "../middlewares/PatientMiddleware";
import AdminMiddleware from "../middlewares/AdminMiddleware";
import DoctorMiddleware from "../middlewares/DoctorMiddleware";

// Shared Components
import Profile from "../pages/Auth/Profile";

// Patient Components
import PatientDashboard from "../pages/Patient/PatientDashboard";
import PatientSettings from "../pages/Patient/PatientSettings.jsx";
import PatientVideoCallPage from "../pages/Patient/VideoCallPage";
import AppointmentBooking from "../pages/Appointment/AppointmentBooking";
import AppointmentBookingHome from "../pages/Appointment/AppointmentBookingHome";
import SpecializationSelection from "../pages/Appointment/SpecializationSelection";
import DoctorSelection from "../pages/Appointment/DoctorSelection";
import TimeSlotSelection from "../pages/Appointment/TimeSlotSelection";

// Doctor Components
import DoctorDashboard from "../pages/Doctor/DoctorDashboard/DoctorDashboard";
import DoctorVideoCallPage from "../pages/Doctor/DoctorVideoCallPage";
import AppointmentList from "../pages/Doctor/AppointmentList/AppointmentList";
import AppointmentDetail from "../pages/Doctor/AppointmentDetail/AppointmentDetail";
import CalendarView from "../pages/Doctor/Calendar/CalendarView";
import ConsultationRecords from "../pages/Doctor/ConsultationRecords/ConsultationRecords";
import ProfileSettings from "../pages/Doctor/ProfileSettings/ProfileSettings";
import ScheduleManagement from "../pages/Doctor/ScheduleManagement/ScheduleManagement";
import Notifications from "../pages/Doctor/Notifications/Notifications";
import Feedback from "../pages/Doctor/Feedback/Feedback";

// Admin Components
import AdminDashboard from "../pages/Admin/AdminDashboard";
import VerifyDoctors from "../pages/Admin/VerifyDoctors";
import UserManagement from "../pages/Admin/UserManagement";
import Specializations from "../pages/Admin/Specializations";
import AppointmentManagement from "../pages/Admin/AppointmentManagement";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";

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
        <Route
          path="/benh-nhan/video-call/:appointmentId"
          element={<PatientVideoCallPage />}
        />
        <Route path="/search-doctors" element={<PatientDashboard />} />
        <Route path="/my-appointments" element={<PatientDashboard />} />
        <Route path="/tu-van-truc-tuyen" element={<PatientDashboard />} />
      </Route>
    </Route>

    {/* ==================== DOCTOR ROUTES (NO DEFAULT LAYOUT) ==================== */}
    {/* Doctor routes with custom layout (no default header/footer) */}
    <Route element={<AuthMiddleware />}>
      <Route element={<DoctorMiddleware />}>
        {/* Main doctor dashboard */}
        <Route path="/bac-si" element={<DoctorDashboard />} />

        {/* Video Call Routes */}
        <Route
          path="/bac-si/video-call/:appointmentId"
          element={<DoctorVideoCallPage />}
        />

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
    </Route>

    {/* ==================== OTHER ROUTES WITH DEFAULT LAYOUT ==================== */}
    <Route element={<DefaultLayout />}>
      {/* ==================== AUTHENTICATED ROUTES ==================== */}
      <Route element={<AuthMiddleware />}>
        {/* ==================== SHARED ROUTES ==================== */}
        {/* Routes accessible by all authenticated users */}
        <Route path="/tai-khoan" element={<Profile />} />
      </Route>

      {/* ==================== PATIENT-SPECIFIC ROUTES ==================== */}
      {/* Routes that require patient role specifically */}
      <Route element={<PatientMiddleware />}>
        <Route path="/dat-lich-kham" element={<AppointmentBooking />} />
        {/* Appointment booking routes */}
        <Route path="/dat-lich" element={<AppointmentBookingHome />} />
        <Route
          path="/dat-lich/chon-chuyen-khoa"
          element={<SpecializationSelection />}
        />
        <Route path="/dat-lich/chon-bac-si" element={<DoctorSelection />} />
        <Route
          path="/dat-lich/chon-thoi-gian"
          element={<TimeSlotSelection />}
        />
        <Route path="/dat-lich/:doctorId" element={<AppointmentBooking />} />
      </Route>
    </Route>

    {/* ==================== ADMIN ROUTES ==================== */}
    {/* Admin routes with admin middleware protection */}
    <Route element={<AdminMiddleware />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/verify-doctors" element={<VerifyDoctors />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/specializations" element={<Specializations />} />
        <Route path="/admin/appointments" element={<AppointmentManagement />} />
      </Route>
    </Route>
  </>
);
