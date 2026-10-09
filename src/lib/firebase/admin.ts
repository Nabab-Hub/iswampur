import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY
);

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminFirestore: Firestore | null = null;

if (isFirebaseAdminConfigured) {
  try {
    const apps = getApps();
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    adminApp = apps.length > 0
      ? apps[0]
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey,
          }),
        });

    adminAuth = getAuth(adminApp);
    adminFirestore = getFirestore(adminApp);
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

export { adminApp, adminAuth, adminFirestore };
