import "./DefaultLayout.scss";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
const DefaultLayout = () => {
  return (
    <div>
      <Header />
      <main style={{ paddingTop: "70px" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DefaultLayout;
