
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDnFNHzV4hOUm6h1TF3RNbaghxEEyFqHJw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "habitquest75.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "habitquest75",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "habitquest75.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "305882096804",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:305882096804:web:82253ac220ea8d528ef231"
};

// Initialize Firebase once
const app = initializeApp(firebaseConfig);

// Initialize and export services
export const auth = getAuth(app);
export const db = getFirestore(app);
