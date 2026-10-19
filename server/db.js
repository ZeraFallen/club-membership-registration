import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// The service account key stays on your machine and is listed in .gitignore.
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!keyPath) {
  console.error('FIREBASE_SERVICE_ACCOUNT_PATH is not set. Copy .env.example to .env first.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
} catch (err) {
  console.error(`Could not read the service account key at ${keyPath}:`, err.message);
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });

// The "members" collection holds one document per registration.
export const membersCollection = getFirestore().collection('members');
