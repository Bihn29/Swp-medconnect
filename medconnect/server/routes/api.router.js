import express from "express";
const apiRouter = express.Router();
import authRouter from "./authRoutes.js";
import doctorRouter from "./doctors/doctor.Routes.js";
import notificationRouter from "./notificationRoutes.js";
import specializationRouter from "./specializations/specialization.route.js";
import patientRouter from "./patientRoutes.js";
import usersRouter from "./users/user.route.js";
import adminRouter from "./admin/admin.routes.js";
import clinicRouter from "./clinicRoutes.js";
import reviewRouter from "./reviewRoutes.js";
import rescheduleRouter from "./rescheduleRoutes.js";
import videoCallRouter from "./videoCallRoutes.js";
import payosRouter from "./payos.routes.js";
import medicalVisitRouter from "./medicalVisitRoutes.js";
import managerRouter from "./managerRoutes.js";
import { getAllAppointments } from "../controllers/doctorController.js";
import { getAppointmentBySlotId } from "../controllers/appointmentController.js";

// Health check endpoint
apiRouter.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Auth routes (register, login, forgot/reset password, etc.)
apiRouter.use("/auth", authRouter);
// Patient routes
apiRouter.use("/patients", patientRouter);
apiRouter.use("/specializations", specializationRouter); // Mount specialization router at /api/specializations
// Users routes
apiRouter.use("/users", usersRouter);
console.log("[router] mounted /api/auth");

// Doctor routes
apiRouter.use("/doctors", doctorRouter);
console.log("[router] mounted /api/doctors");

// Appointments routes (public for fallback)
apiRouter.get("/appointments", getAllAppointments);
apiRouter.get("/appointments/slot/:slotId", getAppointmentBySlotId);
console.log("[router] mounted /api/appointments");

// Notification routes
apiRouter.use("/notifications", notificationRouter);
console.log("[router] mounted /api/notifications");

// Test routes (for development)
apiRouter.get("/debug-slots", async (req, res) => {
  try {
    const DoctorTimeSlot = (await import("../models/doctorTimeSlot.model.js"))
      .default;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);
    maxDate.setHours(23, 59, 59, 999);

    // Get all slots
    const allSlots = await DoctorTimeSlot.find().sort({ startAt: 1 }).lean();

    // Get slots beyond 30 days
    const oldSlots = await DoctorTimeSlot.find({
      startAt: { $gt: maxDate },
    })
      .sort({ startAt: 1 })
      .lean();

    res.json({
      success: true,
      data: {
        today: today.toISOString(),
        maxDate: maxDate.toISOString(),
        totalSlots: allSlots.length,
        oldSlots: oldSlots.length,
        sampleOldSlots: oldSlots.slice(0, 10).map((slot) => ({
          id: slot._id,
          doctorId: slot.doctorId,
          startAt: slot.startAt,
          endAt: slot.endAt,
          status: slot.status,
          daysFromToday: Math.ceil(
            (slot.startAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
      },
    });
  } catch (error) {
    console.error("❌ Debug error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin routes
apiRouter.use("/admin", adminRouter);
console.log("[router] mounted /api/admin");

// Clinic routes
apiRouter.use("/clinics", clinicRouter);
console.log("[router] mounted /api/clinics");

// Review routes
apiRouter.use("/reviews", reviewRouter);
console.log("[router] mounted /api/reviews");

// Reschedule routes
apiRouter.use("/reschedule", rescheduleRouter);
console.log("[router] mounted /api/reschedule");

// Video call routes
apiRouter.use("/video-calls", videoCallRouter);
console.log("[router] mounted /api/video-calls");

// PayOS payment routes
apiRouter.use("/payments/payos", payosRouter);
console.log("[router] mounted /api/payments/payos");

// Medical Visit routes (new appointment flow with visit grouping)
apiRouter.use("/medical-visits", medicalVisitRouter);
console.log("[router] mounted /api/medical-visits");
// Manager routes
apiRouter.use("/managers", managerRouter);
console.log("[router] mounted /api/managers");

// Public service prices route (for doctor to get active services)
import { getActiveServicePrices } from "../controllers/servicePriceController.js";
apiRouter.get("/service-prices/active", getActiveServicePrices);
console.log("[router] mounted /api/service-prices/active");

//admin
// apiRouter.use("/doctor", adminRouter);
// //staff
// apiRouter.use("/staff", staffRouter);
// //common
// apiRouter.use("/common", commonRouter);

export default apiRouter;
