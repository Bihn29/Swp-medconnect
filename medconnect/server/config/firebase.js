import admin from "firebase-admin";
import "dotenv/config";

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebase() {
  const { FB_PROJECT_ID, FB_CLIENT_EMAIL, FB_PRIVATE_KEY } = process.env;
  
  if (!FB_PROJECT_ID || !FB_CLIENT_EMAIL || !FB_PRIVATE_KEY) {
    console.warn("⚠️ Firebase Admin config missing - Firebase features will be disabled");
    console.warn("To enable Firebase, set FB_PROJECT_ID, FB_CLIENT_EMAIL, and FB_PRIVATE_KEY in .env");
    return null;
  }
  
  const privateKey = FB_PRIVATE_KEY.replace(/\\n/g, "\n");
  console.log("✅ [Firebase Admin] Using project:", FB_PROJECT_ID);
  console.log("✅ [Firebase Admin] Client email:", FB_CLIENT_EMAIL);
  console.log("✅ [Firebase Admin] Private key starts with:", privateKey.slice(0, 30));

  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FB_PROJECT_ID,
        clientEmail: FB_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
  
  return admin;
}
