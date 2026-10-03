import * as admin from 'firebase-admin';

// Helper to sanitize private key (handles quotes, literal newlines, and escaped \n)
function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  return key
    .replace(/^['"]|['"]$/g, '') // remove surrounding quotes
    .replace(/\\n/g, '\n');      // convert escaped \n into actual newlines
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

// Global singleton cache for Next.js hot-reloading
interface FirebaseAdminGlobal {
  adminApp?: admin.app.App;
  adminDb?: admin.firestore.Firestore;
}

const globalForFirebase = globalThis as unknown as {
  __firebaseAdmin?: FirebaseAdminGlobal;
};

if (!globalForFirebase.__firebaseAdmin) {
  globalForFirebase.__firebaseAdmin = {};
}

function initAdminApp(): admin.app.App {
  if (globalForFirebase.__firebaseAdmin?.adminApp) {
    return globalForFirebase.__firebaseAdmin.adminApp;
  }

  if (admin.apps.length > 0 && admin.apps[0]) {
    globalForFirebase.__firebaseAdmin!.adminApp = admin.apps[0];
    return admin.apps[0];
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin SDK credentials missing. Please check your FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables in .env.local.'
    );
  }

  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  globalForFirebase.__firebaseAdmin!.adminApp = app;
  return app;
}

/**
 * Returns the singleton Firestore database instance.
 * settings() is executed strictly once on initial instantiation.
 */
export function getAdminDb(): admin.firestore.Firestore {
  if (globalForFirebase.__firebaseAdmin?.adminDb) {
    return globalForFirebase.__firebaseAdmin.adminDb;
  }

  const app = initAdminApp();
  const db = app.firestore();
  
  // Apply settings only once on creation
  db.settings({ ignoreUndefinedProperties: true });

  globalForFirebase.__firebaseAdmin!.adminDb = db;
  return db;
}

/**
 * Check if Firebase Admin environment variables are configured.
 */
export function isAdminConfigured(): boolean {
  return Boolean(projectId && clientEmail && privateKey);
}

// Re-export FieldValue for atomicity and transactions
export const FieldValue = admin.firestore.FieldValue;