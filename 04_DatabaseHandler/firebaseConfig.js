/**
 * 04_DatabaseHandler/firebaseConfig.js
 * 
 * Firebase initialization and configuration
 * All Firebase services are exported from here
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBX1GRJNR8oVn1VqGES1PFVwMDs4thqvgk",
  authDomain: "projectsubmission-d6c00.firebaseapp.com",
  projectId: "projectsubmission-d6c00",
  storageBucket: "projectsubmission-d6c00.firebasestorage.app",
  messagingSenderId: "127406788051",
  appId: "1:127406788051:web:bcdb95dcdc779786373326",
  measurementId: "G-J1K43R271Y"
};

console.log("🔥 Initializing Firebase...");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("✅ Firebase initialized successfully");

// Export everything
export { 
    app,
    auth, 
    db,
    onAuthStateChanged,
    signOut,
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    limit
};

// Make available globally for debugging
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;