// Firebase SDK Configuration
// This file initializes Firebase services for the SapSense application

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration for SapSense web application
const firebaseConfig = {
  apiKey: "AIzaSyAQ_uQGCEtbKv8ZcOifrbWH1RrnK-hNzpQ",
  authDomain: "sapsense-7b9b0.firebaseapp.com",
  projectId: "sapsense-7b9b0",
  storageBucket: "sapsense-7b9b0.firebasestorage.app",
  messagingSenderId: "726458892648",
  appId: "1:726458892648:web:91d19e5162ce4df1af56dd",
  measurementId: "G-E1WEZ8T45W"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics (only in browser environment)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Firestore Database
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Export Firebase services for use throughout the application
export { app, analytics, auth, db, storage };
