import express from "express";
const apiRouter = express.Router();
import userRouter from "./users/user.route.js";

apiRouter.use("/users", userRouter);
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