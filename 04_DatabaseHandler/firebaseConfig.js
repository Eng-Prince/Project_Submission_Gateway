/**
 * firebaseConfig.js
 * 
 * This file initializes Firebase and exports the necessary services
 * for use throughout the application.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
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
    getDocs
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js';

// Firebase configuration object
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
const storage = getStorage(app);

console.log("✅ Firebase initialized successfully");

// Export Firebase services for use in other modules
export { 
    auth, 
    db, 
    storage,
    onAuthStateChanged,
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    ref,
    uploadBytes,
    getDownloadURL
};

/**
 * Get currently logged-in user's UID
 * @returns {Promise<string|null>} User UID or null if not logged in
 */
export function getCurrentUserUID() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user.uid);
            } else {
                resolve(null);
            }
        });
    });
}

/**
 * Get currently logged-in user
 * @returns {Promise<Object|null>} User object or null
 */
export function getCurrentUser() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            resolve(user);
        });
    });
}