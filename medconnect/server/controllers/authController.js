import admin from "firebase-admin";

import { verifyPassword, hashPassword, toE164 } from "../helpers/auth.js";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import AuthProvider from "../models/auth_providers.model.js";
import { ok, fail } from "../utils/response.js";
import {
  COOKIE_NAME,
  SESSION_EXPIRES_IN,
  ERROR_CODES,
} from "../constants/index.js";

const isProd = process.env.NODE_ENV === "production";

/**
 * Password login controller
 */
export async function loginPassword(req, res) {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Missing identifier or password");
    }

    console.log("[login] identifier:", identifier);

    // 🔧 LẤY KÈM passwordHash (vì trong schema đang select:false)
    let user;
    if (String(identifier || "").includes("@")) {
      user = await User.findOne({
        email: String(identifier).toLowerCase().trim(),
        status: "active",
      }).select("+passwordHash");               // 👈 THÊM DÒNG NÀY
    } else {
      const phone = toE164(identifier);
      if (phone) {
        user = await User.findOne({
          phone,
          status: "active",
        }).select("+passwordHash");             // 👈 THÊM DÒNG NÀY
      }
    }

    if (!user) {
      console.log("[login] user not found");
      return fail(res, 404, ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    // 🔧 ĐÚNG THỨ TỰ so sánh: (plain, hash)
    const okPwd = await verifyPassword(user.passwordHash, password);
    if (!okPwd) {
      return fail(res, 401, ERROR_CODES.INVALID_CREDENTIALS, "Invalid credentials");
    }

    const uid = `app_${user._id}`;
    const customToken = await admin.auth().createCustomToken(uid, {
      app_user_id: String(user._id),
      role: user.role,
    });

return ok(res, {
  customToken,
  role: user.role || null,
  user: { fullName: user.fullName, email: user.email }
});
  } catch (e) {
    console.error("❌ /api/auth/login-password error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}


/**
 * Google login controller
 */
export async function googleLogin(req, res) {
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Missing idToken");
    }

    const decoded = await admin.auth().verifyIdToken(idToken, true);
    const email = decoded.email?.toLowerCase();
    if (!email) {
      return fail(res, 403, ERROR_CODES.FORBIDDEN, "Email not found in token");
    }

    const dbUser = await User.findOne({
      email: email,
      status: "active",
    }).lean();
    if (!dbUser) {
      return fail(res, 403, ERROR_CODES.FORBIDDEN, "User not found in DB");
    }

    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN,
    });

    res.cookie(COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_EXPIRES_IN,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });

    return ok(res, { role: dbUser.role ?? null });
  } catch (e) {
    console.error("❌ /api/auth/google-login error:", e);
    return fail(res, 401, ERROR_CODES.UNAUTHORIZED, e.message || String(e));
  }
}

/**
 * Create session controller
 */
export async function createSession(req, res) {
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Missing idToken");
    }

    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN,
    });

    res.cookie(COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_EXPIRES_IN,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });

    return ok(res);
  } catch (e) {
    console.error("❌ /api/auth/session error:", e);
    return fail(res, 401, ERROR_CODES.UNAUTHORIZED, e.message || String(e));
  }
}

/**
 * Get current user controller
 */
export function getCurrentUser(req, res) {
  const claims = req.user || {};
  return ok(res, {
    user: {
      uid: claims.uid || null,
      email: claims.email || null,
      phone: claims.phone_number || null,
      role: claims.role ?? null,
      appUserId: claims.app_user_id ?? null,
    },
  });
}

/**
 * Register controller
 */
export async function register(req, res) {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role = "PATIENT",
    } = req.body || {};

    if (!fullName || !email || !phone || !password) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Missing required fields");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Invalid email format");
    }

    // Validate phone format (Vietnamese)
    const phoneRegex = /^\+84\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Invalid phone format");
    }

    // Validate password length
    if (password.length < 8) {
      return fail(
        res,
        400,
        ERROR_CODES.BAD_REQUEST,
        "Password must be at least 8 characters"
      );
    }

    // Check if user already exists
    // Check existing email
    const existingUserByEmail = await User.findOne({
      email: email.toLowerCase(),
    }).lean();
    if (existingUserByEmail) {
      return fail(res, 409, ERROR_CODES.CONFLICT, "Email already exists");
    }

    // Normalize phone and check
    const normalizedPhone = toE164(phone);
    if (!normalizedPhone) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Invalid phone format");
    }
    const existingUserByPhone = await User.findOne({
      phone: normalizedPhone,
    }).lean();
    if (existingUserByPhone) {
      return fail(
        res,
        409,
        ERROR_CODES.CONFLICT,
        "Phone number already exists"
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in MongoDB
    const userDoc = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash: hashedPassword,
      role: (role || "patient").toLowerCase(),
      status: "active",
      fullName: fullName.trim(),
      phone: normalizedPhone,
    });

    if (!userDoc) {
      return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Failed to create user");
    }

    // Create patient document when role is patient
    if ((role || "patient").toLowerCase() === "patient") {
      await Patient.create({
        userId: userDoc._id,
        fullName: fullName.trim(),
        phone: normalizedPhone,
      });
    }

    // Create Firebase custom token
    const uid = `app_${userDoc._id}`;
    const customToken = await admin.auth().createCustomToken(uid, {
      app_user_id: String(userDoc._id),
      role: userDoc.role,
    });

    console.log("[register] success for user:", userDoc._id);

    // Create AuthProvider record for local login
    try {
      await AuthProvider.create({
        userId: userDoc._id,
        provider: "local",
        providerUid: String(userDoc._id),
        email: userDoc.email,
        phone: userDoc.phone,
        verified: true,
      });
    } catch (e) {
      console.warn("Failed to create AuthProvider record:", e.message || e);
    }
    return ok(res, {
      customToken,
      role: userDoc.role,
      user: {
        id: userDoc._id,
        fullName: userDoc.fullName,
        email: userDoc.email,
        phone: userDoc.phone,
        role: userDoc.role,
      },
    });
  } catch (e) {
    console.error("❌ /api/auth/register error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Google register controller (đã sửa)
 * - find-or-create theo email (tránh E11000 email trùng)
 * - không set phone khi không có (tránh phone: null)
 * - chỉ tạo Patient nếu chưa có
 * - upsert AuthProvider, phát hiện xung đột providerUid
 */
export async function googleRegister(req, res) {
  try {
    const { idToken, fullName, role = "PATIENT" } = req.body || {};
    if (!idToken)
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Missing idToken");

    // verify idToken
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken, true);
      console.log("[GG-REG] decoded:", {
        uid: decoded?.uid,
        email: decoded?.email,
        name: decoded?.name,
        phone: decoded?.phone_number,
      });
    } catch (err) {
      console.error("[GG-REG] verifyIdToken FAILED:", err?.message);
      return fail(
        res,
        401,
        ERROR_CODES.UNAUTHORIZED,
        "Invalid or expired idToken"
      );
    }

    const email = decoded.email?.toLowerCase();
    if (!email)
      return fail(res, 403, ERROR_CODES.FORBIDDEN, "Email not found in token");

    const normalizedRole = (role || "patient").toLowerCase();

    // 1) find-or-create User theo email
    let userDoc = await User.findOne({ email });
    if (!userDoc) {
      try {
        userDoc = await User.create({
          email,
          passwordHash: null, // Google không cần mật khẩu
          role: normalizedRole, // "patient" | "doctor" | "admin"
          status: "active",
          fullName: fullName || decoded.name || "Google User",
          // chỉ set phone nếu có, KHÔNG set null
          ...(decoded.phone_number ? { phone: decoded.phone_number } : {}),
          authProvider: "google",
        });
        console.log("[GG-REG] User.create OK:", String(userDoc._id));
      } catch (e) {
        console.error("[GG-REG] User.create FAILED:", {
          name: e?.name,
          code: e?.code,
          keyValue: e?.keyValue,
          message: e?.message,
        });
        return fail(
          res,
          500,
          ERROR_CODES.SERVER_ERROR,
          e?.message || String(e)
        );
      }
    } else {
      // đã có user cùng email → có thể cập nhật nhẹ nhàng nếu muốn
      // (KHÔNG ghi đè phone/null)
      console.log("[GG-REG] user existed:", String(userDoc._id));
    }

    // 2) tạo Patient nếu role là patient và chưa có
    if (normalizedRole === "patient") {
      const existsPatient = await Patient.findOne({
        userId: userDoc._id,
      }).lean();
      if (!existsPatient) {
        await Patient.create({
          userId: userDoc._id,
          fullName: userDoc.fullName,
          phone: userDoc.phone || null,
        });
        console.log("[GG-REG] Patient.create OK");
      }
    }

    // 3) upsert AuthProvider cho Google
    const ap = await AuthProvider.findOne({
      provider: "google",
      providerUid: decoded.uid,
    }).lean();

    if (ap && String(ap.userId) !== String(userDoc._id)) {
      // providerUid này đã liên kết user khác → báo xung đột
      return fail(
        res,
        409,
        ERROR_CODES.CONFLICT,
        "Google account is linked to another user"
      );
    }

    await AuthProvider.updateOne(
      { provider: "google", providerUid: decoded.uid },
      {
        $setOnInsert: {
          provider: "google",
          providerUid: decoded.uid,
          userId: userDoc._id,
          email: userDoc.email,
          phone: userDoc.phone || null,
          verified: true,
          linkedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log("[GG-REG] SUCCESS userId:", String(userDoc._id));
    return ok(res, {
      role: userDoc.role,
      user: {
        id: userDoc._id,
        fullName: userDoc.fullName,
        email: userDoc.email,
        phone: userDoc.phone,
        role: userDoc.role,
      },
    });
  } catch (e) {
    console.error("❌ /api/auth/google-register error:", {
      name: e?.name,
      code: e?.code,
      keyValue: e?.keyValue,
      message: e?.message,
    });
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e?.message || String(e));
  }
}

/**
 * Logout controller
 */
export function logout(req, res) {
  try {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return ok(res);
  } catch (e) {
    console.error("❌ /api/auth/logout error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}


// --------------------------------------------------

/* ======= ADD: Forgot/Verify OTP/Reset Password ======= */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

/* Helper gửi mail OTP đơn giản, dùng cấu hình SMTP từ .env */
async function sendOtpMail(to, otp) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  await transporter.sendMail({
    from,
    to,
    subject: "Mã OTP đặt lại mật khẩu (hiệu lực 10 phút)",
    text: `Mã OTP của bạn là: ${otp}. Mã sẽ hết hạn sau 10 phút.`,
    html: `<p>Mã OTP của bạn là: <b>${otp}</b></p><p>Mã sẽ hết hạn sau <b>10 phút</b>.</p>`,
  });
}

/**
 * POST /api/auth/forgot
 * body: { email }
 * Luôn trả 200 để tránh lộ tài khoản.
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Thiếu email");

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
      status: "active",
    }).select("+passwordHash +resetOtpHash +resetTokenHash");

    if (!user) return ok(res, { ok: true }); // im lặng

    // hạn chế brute-force: tối đa 5 lần khi OTP còn hiệu lực
    if (
      user.resetOtpExpiresAt &&
      user.resetOtpExpiresAt > new Date() &&
      user.resetOtpAttempts >= 5
    ) {
      return ok(res, { ok: true });
    }

    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    user.resetOtpHash = await bcrypt.hash(otp, 10);
    user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10'
    user.resetOtpAttempts = 0;

    // vô hiệu hoá token cũ (nếu còn)
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;

    await user.save();
    await sendOtpMail(user.email, otp);

    return ok(res, { ok: true });
  } catch (e) {
    console.error("forgotPassword error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * POST /api/auth/verify-otp
 * body: { email, otp }
 * return: { resetToken }
 */
export async function verifyPasswordOtp(req, res) {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp)
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Thiếu dữ liệu");

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
      status: "active",
    }).select("+resetOtpHash");

    if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt)
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "OTP không hợp lệ");

    if (user.resetOtpAttempts >= 5)
      return fail(
        res,
        429,
        ERROR_CODES.TOO_MANY_REQUESTS,
        "Quá số lần thử. Vui lòng yêu cầu OTP mới."
      );

    if (user.resetOtpExpiresAt < new Date())
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "OTP đã hết hạn");

    const okOtp = await bcrypt.compare(String(otp), user.resetOtpHash);
    if (!okOtp) {
      user.resetOtpAttempts += 1;
      await user.save();
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "OTP không hợp lệ");
    }

    // OTP hợp lệ → cấp resetToken ngắn hạn (JWT)
    const resetToken = jwt.sign(
      { sub: String(user._id), purpose: "reset" },
      process.env.JWT_RESET_SECRET,
      { expiresIn: process.env.JWT_RESET_EXPIRES || "15m" }
    );
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetTokenHash = tokenHash;
    user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Xoá OTP sau khi dùng
    user.resetOtpHash = undefined;
    user.resetOtpExpiresAt = undefined;
    user.resetOtpAttempts = 0;

    await user.save();
    return ok(res, { resetToken });
  } catch (e) {
    console.error("verifyPasswordOtp error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * POST /api/auth/reset
 * body: { token, newPassword }
 */
export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword)
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Thiếu dữ liệu");

    // verify JWT
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_RESET_SECRET);
      if (payload?.purpose !== "reset") throw new Error("bad purpose");
    } catch {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Mã xác thực không hợp lệ");
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      _id: payload.sub,
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
    }).select("+passwordHash +resetTokenHash");

    if (!user)
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Mã xác thực không hợp lệ");

    // đặt mật khẩu mới
    const hashed = await hashPassword(newPassword);
    user.passwordHash = hashed;

    // vô hiệu hoá token sau khi dùng
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;

    await user.save();
    return ok(res, { ok: true, message: "Đổi mật khẩu thành công" });
  } catch (e) {
    console.error("resetPassword error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/* ======= (giữ nguyên các controller hiện có) ======= */

// ... phần loginPassword / googleLogin / createSession / getCurrentUser / register / googleRegister / logout giữ nguyên ở dưới (không thay đổi)
