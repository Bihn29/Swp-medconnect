import express from "express";
const apiRouter = express.Router();
import authRouter from "./authRoutes.js";
import doctorRouter from "./doctorRoutes.js";
import notificationRouter from "./notificationRoutes.js";
import specializationRouter from "./specializations/specialization.route.js";
import patientRouter from "./patientRoutes.js";
import usersRouter from "./users/user.route.js";

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

// Notification routes
apiRouter.use("/notifications", notificationRouter);
console.log("[router] mounted /api/notifications");

//admin
// apiRouter.use("/doctor", adminRouter);
// //staff
// apiRouter.use("/staff", staffRouter);
// //common
// apiRouter.use("/common", commonRouter);

// common api
//payment zalo
// router.use("/zalo", paymentRouter);
// //payment payos
// router.use("/payos", payosRouter);
export default apiRouter;
