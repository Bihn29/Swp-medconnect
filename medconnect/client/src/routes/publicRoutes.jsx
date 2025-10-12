import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
// The homepage component is located at pages/Home/Homepage/Homepage.jsx
import Home from "../pages/Home/Homepage/Homepage";
import About from "../pages/About/About";
import HomeVisit from "../pages/Home/HomeVisit/HomeVisit";
import HospitalVisit from "../pages/Home/HospitalVisit/HospitalVisit";
import SearchPage from "../pages/Home/SearchPage/SearchPage";
import Doctor from "../pages/Home/Doctor/Doctor";
import Specialization from "../pages/Home/Specialization/Specialization";
import Facility from "../pages/Home/Facility/Facility";
import Package from "../pages/Home/Package/Package";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import VerifyOtp from "../pages/Auth/VerifyOtp";
import ResetPassword from "../pages/Auth/ResetPassword";
import { Route } from "react-router-dom";
import GuestMiddleware from "../middlewares/GuestMiddleware";
import PatientDashboard from "../pages/Patient/PatientDashboard";
export const publicRoutes = (
  <>
    <Route element={<DefaultLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/gioi-thieu" element={<About />} />
      <Route path="/kham-tai-nha" element={<HomeVisit />} />
      <Route path="/kham-tai-vien" element={<HospitalVisit />} />
      <Route path="/tim-kiem" element={<SearchPage />} />
      <Route path="/bac-si" element={<Doctor />} />
      <Route path="/chuyen-khoa" element={<Specialization />} />
      <Route path="/co-so-y-te" element={<Facility />} />
      <Route path="/goi-kham" element={<Package />} />
      <Route path="/patient" element={<PatientDashboard />} />
    </Route>
    <Route element={<AuthLayout />}>
      <Route element={<GuestMiddleware />}>
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />
        <Route path="/quen-mat-khau" element={<ForgotPassword />} />
        <Route path="/xac-minh-otp" element={<VerifyOtp />} />
        <Route path="/dat-lai-mat-khau" element={<ResetPassword />} />
      </Route>
    </Route>
  </>
);
