import { Route } from "react-router-dom";
import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import PatientMiddleware from "../middlewares/PatientMiddleware";
import PatientDashboard from "../pages/Patient/PatientDashboard";
import AppointmentBooking from "../pages/Appointment/AppointmentBooking";

export const privateRoutes = (
  <>
    {/* Patient-only routes */}
    <Route element={<DefaultLayout />}>
      <Route element={<PatientMiddleware />}>
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/dat-lich-kham" element={<AppointmentBooking />} />
      </Route>
    </Route>
  </>
);
