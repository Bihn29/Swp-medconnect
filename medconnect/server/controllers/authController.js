import admin from "firebase-admin";
import { verifyPassword } from "../helpers/auth.js";
import { findUserByIdentifier, findUserByEmail } from "../helpers/db.mssql.js";
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
