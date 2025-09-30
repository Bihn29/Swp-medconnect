import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import PatientDashboard from "./pages/Patient/Patient-dashboard";
import Homepage from "./pages/Guest/Homepage";

// Import các component từ cấu trúc cũ
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import DefaultLayout from "./layouts/DefaultLayout/DefaultLayout";

function DoctorDashboard() { 
  return <div style={{padding:24}}><h2>Doctor Dashboard</h2></div> 
}

function AdminDashboard() { 
  return <div style={{padding:24}}><h2>Admin Dashboard</h2></div> 
}

function ForgotPassword() { 
  return <div style={{padding:24}}><h2>Forgot Password</h2></div> 
}

function Register() { 
  return <div style={{padding:24}}><h2>Register</h2></div> 
}

export default function App() {
  return (
    <Routes>
      {/* Main Homepage for guests */}
      <Route path="/" element={<Homepage />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/patient-dashboard" element={<PatientDashboard/>} />
      <Route path="/doctor-dashboard" element={<DoctorDashboard/>} />
      <Route path="/admin-dashboard" element={<AdminDashboard/>} />
      <Route path="/forgotpassword" element={<ForgotPassword/>} />
      
      {/* Layout routes */}
      <Route element={<DefaultLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  );
}
