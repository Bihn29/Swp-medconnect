import admin from "firebase-admin";
import "dotenv/config";

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebase() {
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
  
  return admin;
}
