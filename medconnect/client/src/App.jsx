import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login/Login";
import PatientDashboard from "./pages/Patient/patient-dashboard";

function DoctorDashboard(){ return <div style={{padding:24}}><h2>Doctor Dashboard</h2></div> }
function AdminDashboard(){ return <div style={{padding:24}}><h2>Admin Dashboard</h2></div> }
function ForgotPassword(){ return <div style={{padding:24}}><h2>Forgot Password</h2></div> }
function Register(){ return <div style={{padding:24}}><h2>Register</h2></div> }

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/patient-dashboard" element={<PatientDashboard/>} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard/>} />
        <Route path="/admin-dashboard" element={<AdminDashboard/>} />
        <Route path="/forgotpassword" element={<ForgotPassword/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/" element={
          <div style={{padding:24}}>
            <h2>Trang chủ</h2>
            <p><Link to="/login">Đi đến trang đăng nhập</Link></p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}