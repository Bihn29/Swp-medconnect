
/* ================ Core & Libs ================ */
import express from "express";
import http from "http";
import mongoose from "mongoose";

import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import apiRouter from "./routes/api.router.js";

/* ================ App & CORS ================ */
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  
];
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


// app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(cookieParser());



// router
app.use("/api/v1", apiRouter);

/* ================ 404 & Error Handler ================ */
app.use((_req, res) => {
  res.status(404).json({ error: "Không tìm thấy trang" });
});
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Internal Server Error",
  });
});


/* ================ Start Server & Socket.IO ================ */
const server = http.createServer(app);

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
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
