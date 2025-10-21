import express from "express";
import { authGuard } from "../middleware/auth.js";
import {
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getAllDoctors,
} from "../controllers/adminController.js";

const router = express.Router();

// Admin middleware to check if user is admin
const adminGuard = (req, res, next) => {
  const userRole = req.user?.role;
  if (userRole !== "admin") {
    return res.status(403).json({
      success: false,
      error: "FORBIDDEN",
      message: "Admin access required"
    });
  }
  next();
};

// Apply auth guard and admin guard to all routes
router.use(authGuard);
router.use(adminGuard);

// Admin routes
router.get("/pending-doctors", getPendingDoctors);
router.get("/doctors", getAllDoctors);
router.post("/approve-doctor/:doctorId", approveDoctor);
router.post("/reject-doctor/:doctorId", rejectDoctor);

export default router;
