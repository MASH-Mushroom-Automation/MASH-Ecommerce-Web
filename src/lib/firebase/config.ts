/**
 * Firebase Configuration
 * 
 * Initializes Firebase app with environment variables.
 * Project: MASH (mash-5b627)
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (prevent duplicate initialization in Next.js)
let firebaseApp: FirebaseApp;
let db: Firestore;

if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);
} else {
  firebaseApp = getApps()[0];
  db = getFirestore(firebaseApp);
}

export { firebaseApp, db };
