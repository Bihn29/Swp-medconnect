// main.jsx
import "antd/dist/reset.css";
import "./assets/css/style.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Polyfills for Node.js modules in browser
import { Buffer } from "buffer";
window.Buffer = Buffer;

import App from "./App.jsx";

// Tạo 1 instance cho toàn app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // tùy chọn hay dùng
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
