import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBC2AK5dmCb2taRBgAdH7Olbbxu7yjGFUM",
  authDomain: "alhikma-dawam.firebaseapp.com",
  projectId: "alhikma-dawam",
  storageBucket: "alhikma-dawam.firebasestorage.app",
  messagingSenderId: "276033519457",
  appId: "1:276033519457:web:173c30fb89dab714194f20",
  measurementId: "G-0BHGBX4HHJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firestore for APIs
export const db = firebase.firestore();
