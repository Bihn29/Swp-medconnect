import React from "react";
import { HomeOutlined } from "@ant-design/icons";
import NavigationBreadcrumb from "../../components/Breadcrumb/NavigationBreadcrumb";
import "./About.scss";

const About = () => {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="container">
        <NavigationBreadcrumb
          items={[
            {
              label: "Trang chủ",
              path: "/",
              icon: <HomeOutlined />,
            },
            {
              label: "Giới thiệu",
            },
          ]}
        />
      </div>

      <h1>About</h1>
    </div>
  );
};

export default About;
