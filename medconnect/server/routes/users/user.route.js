import express from "express";
import User from "../../models/user.model.js";
import { sendMail } from "../../utils/email.js";
const userRouter = express.Router();

// CPU
const otp = new Map();

// ✅ GET all users
userRouter.get("/", async (req, res) => {
  try {
    const number = Math.floor(100000 + Math.random() * 900000);
    otp.set("doimapkhau", number);

   const boolearn =  await sendMail(
      "binhnthe186298@fpt.edu.vn",
      "Test Email from MedConnect",
      "<h1>This is a test email from MedConnect</h1><p>If you received this, the email configuration works!</p>"
    )

    // if(boolearn.status =  "sent"){
    //   const opt = await otp.create
    // }
    // console.log("Fetching all users");
    // const users = await User.find();
    return res.status(200).json({
      message: "Email sent successfully. Check your inbox.",
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Server error while fetching users" });
  }
});

userRouter.get("/", async (req, res) => {
  try {
    const opt = req.body
    const number = Math.floor(100000 + Math.random() * 900000);
    const checkotp = otp.get("doimapkhau", number);
    if(otp !== checkotp){
      return res.status(400).json({
        message: "Mã OTP không đúng",
      });
    }
   
    return res.status(200).json({
      message: "Email sent successfully. Check your inbox.",
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Server error while fetching users" });
  }
});

export default userRouter;
