import * as admin from 'firebase-admin';

// Helper that safely parses private keys regardless of how Vercel stores them
function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;

  let sanitized = key.trim();

  // Remove surrounding single or double quotes if present
  if (
    (sanitized.startsWith('"') && sanitized.endsWith('"')) ||
    (sanitized.startsWith("'") && sanitized.endsWith("'"))
  ) {
    sanitized = sanitized.slice(1, -1);
  }

  // Convert literal '\n' characters into real newlines
  sanitized = sanitized.replace(/\\n/g, '\n');

  return sanitized;
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

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
      `Firebase Admin credentials missing. projectId: ${Boolean(projectId)}, clientEmail: ${Boolean(clientEmail)}, privateKey: ${Boolean(privateKey)}`
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

export function getAdminDb(): admin.firestore.Firestore {
  if (globalForFirebase.__firebaseAdmin?.adminDb) {
    return globalForFirebase.__firebaseAdmin.adminDb;
  }

  const app = initAdminApp();
  const db = app.firestore();
  db.settings({ ignoreUndefinedProperties: true });

  globalForFirebase.__firebaseAdmin!.adminDb = db;
  return db;
}

export function isAdminConfigured(): boolean {
  return Boolean(projectId && clientEmail && privateKey);
}

export const FieldValue = admin.firestore.FieldValue;