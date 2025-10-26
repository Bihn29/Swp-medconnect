/* ================ Core & Libs ================ */
import express from "express";
import http from "http";
import mongoose from "mongoose";

import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import apiRouter from "./routes/api.router.js";
import { initializeFirebase } from "./config/firebase.js";
import SignalingServer from "./services/signalingServer.js";

// Initialize Firebase Admin SDK (will exit process if config missing)
initializeFirebase();

/* ================ App & CORS ================ */
const app = express();
const allowedOrigins = ["http://localhost:5173"];
const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow requests from allowed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Log rejected origin for debugging
    console.warn(`⚠️ CORS rejected origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Parse JSON and urlencoded request bodies FIRST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS must be after body parsers
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// app.use(morgan("dev"));
app.use("/uploads", express.static("../client/public/uploads"));
app.use("/server-uploads", express.static("uploads"));
app.use(cookieParser());

// router
// Expose APIs under /api to match frontend (frontend uses /api/auth/...)
app.use("/api", apiRouter);

/* ================ 404 & Error Handler ================ */
app.use((_req, res) => {
  res.status(404).json({ error: "Không tìm thấy trang" });
});
app.use((err, req, res, _next) => {
  console.error("❌ Error handler caught:", err.stack);

  // Ensure CORS headers are set even on errors
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Internal Server Error",
  });
});

/* ================ Start Server & Socket.IO ================ */
const server = http.createServer(app);

// Initialize Signaling Server for WebRTC
const signalingServer = new SignalingServer(server);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("✅ Kết nối đến MongoDB thành công");
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối đến MongoDB:", err.message);
  });

const PORT = process.env.PORT || 9999;
server.listen(PORT, () => {
  const domain = `http://localhost:${PORT}`;
  console.log(`🚀 Server đang chạy tại: ${domain}`);
});
// });
