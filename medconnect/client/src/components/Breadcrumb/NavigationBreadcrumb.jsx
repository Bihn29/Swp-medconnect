import React from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import "./NavigationBreadcrumb.css";

const NavigationBreadcrumb = ({ items = [] }) => {
  const navigate = useNavigate();

  const handleNavigation = (path, e) => {
    e.preventDefault();
    navigate(path);
  };

  const renderBreadcrumbItem = (item, index, isLast) => {
    if (isLast) {
      // Last item (current page) should not be clickable
      return (
        <Breadcrumb.Item key={index}>
          {item.icon && item.icon}
          {item.label}
        </Breadcrumb.Item>
      );
    }

    // Clickable items
    return (
      <Breadcrumb.Item key={index}>
        {item.icon && (
          <>
            <a
              href={item.path}
              onClick={(e) => handleNavigation(item.path, e)}
              className="breadcrumb-link"
            >
              {item.icon}
            </a>
            <span className="breadcrumb-separator">/</span>
            <a
              href={item.path}
              onClick={(e) => handleNavigation(item.path, e)}
              className="breadcrumb-link"
            >
              {item.label}
            </a>
          </>
        )}
        {!item.icon && (
          <a
            href={item.path}
            onClick={(e) => handleNavigation(item.path, e)}
            className="breadcrumb-link"
          >
            {item.label}
          </a>
        )}
      </Breadcrumb.Item>
    );
  };

  return (
    <Breadcrumb className="navigation-breadcrumb">
      {items.map((item, index) =>
        renderBreadcrumbItem(item, index, index === items.length - 1)
      )}
    </Breadcrumb>
  );
};

export default NavigationBreadcrumb;
