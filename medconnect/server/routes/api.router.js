import express from "express";
const apiRouter = express.Router();
import userRouter from "./users/user.route.js";
import authRouter from "./authRoutes.js";

apiRouter.use("/users", userRouter);
// Auth routes (register, login, session, etc.)
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
