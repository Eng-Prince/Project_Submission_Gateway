/*
    In this javascript file we store, update the data we get from submit page
*/

import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js' // importing fun InitApp from fire apps

import {getAuth } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js'

import{getFirestore, 
    doc,
    getDoc, 
    setDoc, 
    updateDoc,
    collection,
    addDoc 
}   from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'


const firebaseConfig = {
  apiKey: "AIzaSyBX1GRJNR8oVn1VqGES1PFVwMDs4thqvgk",
  authDomain: "projectsubmission-d6c00.firebaseapp.com",
  projectId: "projectsubmission-d6c00",
  storageBucket: "projectsubmission-d6c00.firebasestorage.app",
  messagingSenderId: "127406788051",
  appId: "1:127406788051:web:bcdb95dcdc779786373326",
  measurementId: "G-J1K43R271Y"
};

console.log("Using Firebase for Doc purposes")

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);



// Step 2: Now we gonna use the firebase for our other stuff
window.saveProfile = async function () {
// Step 1: Getting the dom from the html
    const name = document.getElementById("name").value
    const email= document.getElementById("email").value
    const year = document.getElementById("Year").value
    const enroll = document.getElementById("enroll").value

    if(!name || !email || !year || !enroll){
        alert("Please fill all the form ");
        return
    }
    
    try {
        await setDoc(doc(db, "UserProfile", "220101033001"),{
            name: name,
            email: email,
            year : year,
            enroll : enroll
        });

        alert("Profile set successfully")
    }
    catch(error){
        console.log("Error occur while saving file:", error)
    }
}
