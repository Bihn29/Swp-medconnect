import admin from "firebase-admin";
import { fail } from "../utils/response.js";
import { COOKIE_NAME } from "../constants/index.js";

/**
 * Authentication middleware
 */
export async function authGuard(req, res, next) {
  const cookie = req.cookies[COOKIE_NAME] || "";
  try {
    const decoded = await admin.auth().verifySessionCookie(cookie, true);
    req.user = decoded;
    next();
  } catch (e) {
    console.error("❌ authGuard error:", e);
    return fail(res, 401, "UNAUTHORIZED", e.message || String(e));
  }
}
