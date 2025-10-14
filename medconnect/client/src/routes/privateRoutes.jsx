import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import { Route } from "react-router-dom";
import Profile from "../pages/Auth/Profile";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import PatientDashboard from "../pages/Patient/PatientDashboard";
import DoctorDashboard from "../pages/Doctor/DoctorDashboard/DoctorDashboard";
import AppointmentList from "../pages/Doctor/AppointmentList/AppointmentList";
import AppointmentDetail from "../pages/Doctor/AppointmentDetail/AppointmentDetail";
import CalendarView from "../pages/Doctor/Calendar/CalendarView";
import ConsultationRecords from "../pages/Doctor/ConsultationRecords/ConsultationRecords";
import ProfileSettings from "../pages/Doctor/ProfileSettings/ProfileSettings";
import ScheduleManagement from "../pages/Doctor/ScheduleManagement/ScheduleManagement";
import Notifications from "../pages/Doctor/Notifications/Notifications";
import Feedback from "../pages/Doctor/Feedback/Feedback";
export const privateRoutes = (
  <>
    <Route element={<DefaultLayout />}>
      <Route element={<AuthMiddleware />}>
        <Route path="/tai-khoan" element={<Profile />} />
        <Route path="/benh-nhan" element={<PatientDashboard />} />
        
        {/* Doctor Routes */}
        <Route path="/bac-si/dashboard" element={<DoctorDashboard />} />
        <Route path="/bac-si/lich-hen" element={<AppointmentList />} />
        <Route path="/bac-si/lich-hen/:id" element={<AppointmentDetail />} />
        <Route path="/bac-si/lich-lam-viec" element={<CalendarView />} />
        <Route path="/bac-si/ho-so-kham" element={<ConsultationRecords />} />
        <Route path="/bac-si/cai-dat" element={<ProfileSettings />} />
        <Route path="/bac-si/quan-ly-lich" element={<ScheduleManagement />} />
        <Route path="/bac-si/thong-bao" element={<Notifications />} />
        <Route path="/bac-si/danh-gia" element={<Feedback />} />

      </Route>
    </Route>
  </>
);
