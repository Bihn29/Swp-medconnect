import admin from "firebase-admin";
import { verifyPassword, hashPassword } from "../helpers/auth.js";
import { findUserByIdentifier, findUserByEmail, createUser } from "../helpers/db.mssql.js";
import { ok, fail } from "../utils/response.js";
import { COOKIE_NAME, SESSION_EXPIRES_IN, ERROR_CODES } from "../constants/index.js";

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

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      console.log("[login] user not found");
      return fail(res, 404, ERROR_CODES.USER_NOT_FOUND, "User not found");
    }
    console.log("[login] user:", user);

    const okPwd = await verifyPassword(user.PasswordHash, password);
    if (!okPwd) {
      return fail(res, 401, ERROR_CODES.INVALID_CREDENTIALS, "Invalid credentials");
    }

    const uid = `app_${user.UserID}`;
    console.log("[login] creating customToken for uid:", uid);

    const customToken = await admin.auth().createCustomToken(uid, {
      app_user_id: String(user.UserID),
      role: user.Role,
    });

    console.log("[login] success!");
    return ok(res, { customToken, role: user.Role ?? null });
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

    const dbUser = await findUserByEmail(email);
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

    return ok(res, { role: dbUser.Role ?? null });
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
    const { fullName, email, phone, password, role = "PATIENT" } = req.body || {};
    
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
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Password must be at least 8 characters");
    }

    // Check if user already exists
    const existingUserByEmail = await findUserByEmail(email.toLowerCase());
    if (existingUserByEmail) {
      return fail(res, 409, ERROR_CODES.CONFLICT, "Email already exists");
    }

    const existingUserByPhone = await findUserByIdentifier(phone);
    if (existingUserByPhone) {
      return fail(res, 409, ERROR_CODES.CONFLICT, "Phone number already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in database
    const newUser = await createUser({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone,
      passwordHash: hashedPassword,
      role: role.toUpperCase()
    });

    if (!newUser) {
      return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Failed to create user");
    }

    // Create Firebase custom token
    const uid = `app_${newUser.UserID}`;
    const customToken = await admin.auth().createCustomToken(uid, {
      app_user_id: String(newUser.UserID),
      role: newUser.Role,
    });

    console.log("[register] success for user:", newUser.UserID);
    return ok(res, { 
      customToken, 
      role: newUser.Role,
      user: {
        id: newUser.UserID,
        fullName: newUser.FullName,
        email: newUser.Email,
        phone: newUser.Phone,
        role: newUser.Role
      }
    });
  } catch (e) {
    console.error("❌ /api/auth/register error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Google register controller
 */
export async function googleRegister(req, res) {
  try {
    const { idToken, fullName, role = "PATIENT" } = req.body || {};
    if (!idToken) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Missing idToken");
    }

    const decoded = await admin.auth().verifyIdToken(idToken, true);
    const email = decoded.email?.toLowerCase();
    if (!email) {
      return fail(res, 403, ERROR_CODES.FORBIDDEN, "Email not found in token");
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return fail(res, 409, ERROR_CODES.CONFLICT, "User already exists");
    }

    // Create user in database
    const newUser = await createUser({
      fullName: fullName || decoded.name || "Google User",
      email: email,
      phone: decoded.phone_number || null,
      passwordHash: null, // Google users don't have password
      role: role.toUpperCase()
    });

    if (!newUser) {
      return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Failed to create user");
    }

    // Create session cookie
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

    console.log("[google-register] success for user:", newUser.UserID);
    return ok(res, { 
      role: newUser.Role,
      user: {
        id: newUser.UserID,
        fullName: newUser.FullName,
        email: newUser.Email,
        phone: newUser.Phone,
        role: newUser.Role
      }
    });
  } catch (e) {
    console.error("❌ /api/auth/google-register error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
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
