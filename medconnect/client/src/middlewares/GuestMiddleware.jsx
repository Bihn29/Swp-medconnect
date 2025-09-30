import { Outlet, Navigate } from "react-router-dom";
const isLogin = false;
const GuestMiddleware = () => {
  return !isLogin ? <Outlet /> : <Navigate to="/" />;
};

export default GuestMiddleware;
