import express from "express";
const apiRouter = express.Router();
import authRouter from "./authRoutes.js";

// Auth routes (register, login, forgot/reset password, etc.)
apiRouter.use("/auth", authRouter);
console.log("[router] mounted /api/auth");

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
