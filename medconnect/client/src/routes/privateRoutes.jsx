import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import { Route } from "react-router-dom";
import Profile from "../pages/Auth/Profile";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import PatientDashboard from "../pages/Patient/PatientDashboard";
export const privateRoutes = (
  <>
    <Route element={<DefaultLayout />}>
      <Route element={<AuthMiddleware />}>
        <Route path="/tai-khoan" element={<Profile />} />
        <Route path="/benh-nhan" element={<PatientDashboard />} />
      </Route>
    </Route>
  </>
);
