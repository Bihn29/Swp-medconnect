import dotenv from "dotenv";
dotenv.config();

import sql from "mssql";
import { toE164 } from "./auth.js";

let pool;

export async function getPool() {
  if (pool) return pool;

  const config = {
    server: process.env.MSSQL_SERVER || process.env.DB_HOST,
    port: parseInt(process.env.MSSQL_PORT || process.env.DB_PORT || "1433", 10),
    database: process.env.MSSQL_DATABASE || process.env.DB_NAME,
    user: process.env.MSSQL_USER || process.env.DB_USER,
    password: process.env.MSSQL_PASSWORD || process.env.DB_PASSWORD,
    options: {
      encrypt:
        (process.env.MSSQL_ENCRYPT ??
          process.env.DB_ENCRYPT ??
          "").toString().toLowerCase() === "true",
      trustServerCertificate:
        (process.env.MSSQL_TRUST_SERVER_CERT ??
          process.env.DB_TRUST_CERT ??
          "").toString().toLowerCase() !== "false",
      ...(process.env.MSSQL_INSTANCE
        ? { instanceName: process.env.MSSQL_INSTANCE }
        : {}),
    },
  };

  // Debug log để chắc chắn config đúng
  if (!config.server) {
    console.error("❌ Thiếu MSSQL_SERVER hoặc DB_HOST trong .env");
  } else {
    console.log("ℹ️ MSSQL config =>", {
      server: config.server,
      port: config.port,
      db: config.database,
      instance: config.options.instanceName,
    });
  }

  try {
    pool = await sql.connect(config);
    console.log("✅ MSSQL connected");
    return pool;
  } catch (err) {
    console.error("❌ MSSQL connect error:", err.message);
    throw err;
  }
}

export async function findUserByEmail(email) {
  const p = await getPool();
  const result = await p
    .request()
    .input("email", sql.NVarChar, email.toLowerCase())
    .query(`
      SELECT U.UserID, U.Email, U.PasswordHash, U.Role, U.Status
      FROM Users U
      WHERE LOWER(U.Email) = @email
    `);
  const u = result.recordset[0];
  return u && u.Status === "ACTIVE" ? u : null;
}

export async function findUserByPhone(rawPhone) {
  const phone = toE164(rawPhone);
  if (!phone) return null;
  const p = await getPool();
  const result = await p
    .request()
    .input("phone", sql.NVarChar, phone)
    .query(`
      SELECT U.UserID, U.Email, U.PasswordHash, U.Role, U.Status, P.Phone
      FROM Users U
      JOIN Patients P ON P.UserID = U.UserID
      WHERE P.Phone = @phone
    `);
  const u = result.recordset[0];
  return u && u.Status === "ACTIVE" ? u : null;
}

export async function findUserByIdentifier(identifier) {
  const id = String(identifier || "").trim().toLowerCase();
  if (!id) return null;
  if (id.includes("@")) {
    return findUserByEmail(id);
  }
  return findUserByPhone(id);
}