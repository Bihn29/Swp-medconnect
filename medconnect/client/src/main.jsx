import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

// ✅ Import style Ant Design (bắt buộc)
import 'antd/dist/reset.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
