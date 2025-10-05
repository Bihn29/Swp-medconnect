import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
// The homepage component is located at pages/Home/Homepage/Homepage.jsx
import Home from "../pages/Home/Homepage/Homepage";
import About from "../pages/About/About";
import Products from "../pages/Products/Products";
import ProductDetail from "../pages/Products/ProductDetail";
import HomeVisit from "../pages/Home/HomeVisit/HomeVisit";
import HospitalVisit from "../pages/Home/HospitalVisit/HospitalVisit";
import SearchPage from "../pages/Home/SearchPage/SearchPage";
import Login from "../pages/Auth/Login";
import { Route } from "react-router-dom";
import GuestMiddleware from "../middlewares/GuestMiddleware";
export const publicRoutes = (
  <>
    <Route element={<DefaultLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/gioi-thieu" element={<About />} />
      <Route path="/kham-tai-nha" element={<HomeVisit />} />
      <Route path="/kham-tai-vien" element={<HospitalVisit />} />
      <Route path="/tim-kiem" element={<SearchPage />} />
      <Route path="/san-pham">
        <Route path="" element={<Products />} />
        <Route path=":id" element={<ProductDetail />} />
      </Route>
    </Route>
    <Route element={<AuthLayout />}>
      <Route element={<GuestMiddleware />}>
        <Route path="/dang-nhap" element={<Login />} />
      </Route>
    </Route>
  </>
);
