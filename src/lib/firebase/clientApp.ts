import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase for Client side
// We check for apiKey to avoid crashes during build if env vars are missing
const app = (typeof window !== "undefined" || !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) && getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps().length > 0 ? getApp() : null;

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const googleProvider = new GoogleAuthProvider();

// Analytics initialization (client-only)
const analytics = typeof window !== "undefined" && app ? isSupported().then(yes => yes ? getAnalytics(app!) : null) : null;

export { app, auth, db, analytics, googleProvider };
