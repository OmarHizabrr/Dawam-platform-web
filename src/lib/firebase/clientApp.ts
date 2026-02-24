import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDx_Ydv3gVawGA7qupmnjSuo6ELmc2Mn8M",
    authDomain: "dawam-platform-web.firebaseapp.com",
    projectId: "dawam-platform-web",
    storageBucket: "dawam-platform-web.firebasestorage.app",
    messagingSenderId: "170380381800",
    appId: "1:170380381800:web:f915cea92bd9dd53a375dd",
    measurementId: "G-YPFQ5SMSMD"
};

// Initialize Firebase for Client side
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
