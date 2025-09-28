import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import admin from "firebase-admin";
import "dotenv/config";

import { verifyPassword } from "./helpers/auth.js";
import { findUserByIdentifier, findUserByEmail, getPool } from "./helpers/db.mssql.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(morgan("dev"));

const { FB_PROJECT_ID, FB_CLIENT_EMAIL, FB_PRIVATE_KEY } = process.env;
if (!FB_PROJECT_ID || !FB_CLIENT_EMAIL || !FB_PRIVATE_KEY) {
  console.error("Missing Firebase Admin config");
  process.exit(1);
}
const privateKey = FB_PRIVATE_KEY.replace(/\\n/g, "\n");
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FB_PROJECT_ID,
      clientEmail: FB_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const COOKIE_NAME = "session";
const isProd = process.env.NODE_ENV === "production";

function fail(res, status, code, message) {
  return res.status(status).json({ ok: false, code, message });
}
function ok(res, data = {}) {
  return res.json({ ok: true, ...data });
}

app.get("/healthz", (_req, res) => ok(res, { ping: "pong" }));

app.post("/api/auth/login-password", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) return fail(res, 400, "BAD_REQUEST", "Missing identifier or password");

    console.log("[login] identifier:", identifier);

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      console.log("[login] user not found");
      return fail(res, 404, "USER_NOT_FOUND", "User not found");
    }
    console.log("[login] user:", user);

    const okPwd = await verifyPassword(user.PasswordHash, password);
    if (!okPwd) return fail(res, 401, "INVALID_CREDENTIALS", "Invalid credentials");

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
    return fail(res, 500, "SERVER_ERROR", e.message || String(e));
  }
});

app.post("/api/auth/google-login", async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return fail(res, 400, "BAD_REQUEST", "Missing idToken");

    const decoded = await admin.auth().verifyIdToken(idToken, true);
    const email = decoded.email?.toLowerCase();
    if (!email) return fail(res, 403, "FORBIDDEN", "Email not found in token");

    const dbUser = await findUserByEmail(email);
    if (!dbUser) return fail(res, 403, "FORBIDDEN", "User not found in DB");

    const expiresIn = 7 * 24 * 60 * 60 * 1000;
    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn,
    });

    res.cookie(COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });

    return ok(res, { role: dbUser.Role ?? null });
  } catch (e) {
    console.error("❌ /api/auth/google-login error:", e);
    return fail(res, 401, "UNAUTHORIZED", e.message || String(e));
  }
});

app.post("/api/auth/session", async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return fail(res, 400, "BAD_REQUEST", "Missing idToken");

    const expiresIn = 7 * 24 * 60 * 60 * 1000;
    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn,
    });

    res.cookie(COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
    });

    return ok(res);
  } catch (e) {
    console.error("❌ /api/auth/session error:", e);
    return fail(res, 401, "UNAUTHORIZED", e.message || String(e));
  }
});

async function authGuard(req, res, next) {
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

app.get("/api/auth/me", authGuard, (req, res) => {
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
});

app.post("/api/auth/logout", (_req, res) => {
  try {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return ok(res);
  } catch (e) {
    console.error("❌ /api/auth/logout error:", e);
    return fail(res, 500, "SERVER_ERROR", e.message || String(e));
  }
});

app.get("/db-check", async (_req, res) => {
  try {
    const pool = await getPool();
    const rs = await pool.request().query("SELECT GETDATE() AS now");
    return res.json({ ok: true, now: rs.recordset[0].now });
  } catch (e) {
    console.error("❌ /db-check error:", e);
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
});

app.use((req, res) => fail(res, 404, "NOT_FOUND", "Route not found"));
app.use((err, _req, res, _next) => {
  console.error("❌ Express error:", err);
  fail(res, 500, "SERVER_ERROR", err.message || String(err));
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Auth server listening at http://localhost:${PORT}`)
);