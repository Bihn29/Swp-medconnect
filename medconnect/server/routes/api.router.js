import express from "express";
const apiRouter = express.Router();
import userRouter from "./users/user.route.js";
import authRouter from "./authRoutes.js";
import doctorRouter from "./doctorRoutes.js";
import notificationRouter from "./notificationRoutes.js";

apiRouter.use("/users", userRouter);
// Auth routes (register, login, session, etc.)
apiRouter.use("/auth", authRouter);
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
