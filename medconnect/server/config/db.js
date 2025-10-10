// import sql from "mssql";

// const config = {
//   server: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT || "1433", 10),
//   database: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   options: {
//     encrypt: String(process.env.DB_ENCRYPT).toLowerCase() === "true",
//     trustServerCertificate: String(process.env.DB_TRUST_CERT).toLowerCase() === "true",
//   },
//   pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
// };

// let pool;
// export async function getPool() {
//   if (pool) return pool;
//   pool = await sql.connect(config);
//   return pool;
// }
// export { sql };
