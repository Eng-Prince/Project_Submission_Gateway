// Importint FireBase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js"; 

// Import Auth
import { getAuth, 
       onAuthStateChanged,
       signInWithEmailAndPassword,
       createUserWithEmailAndPassword
      } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js"; // These 3 are services from the module Firebase Auth

// DataBasse
import{ getFirestore,
        doc, getDoc, setDoc
      } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration 
const firebaseConfig = {
  apiKey: "AIzaSyCoUhO3EHqbxgGavi9oFTN4MHrI6h0VU6U",
  authDomain: "clgproject-86e4c.firebaseapp.com",
  projectId: "clgproject-86e4c",
  storageBucket: "clgproject-86e4c.firebasestorage.app",
  messagingSenderId: "218489742189",
  appId: "1:218489742189:web:cbb13a6e2f748035437064"
};

//  Step 1: Initialize Firebase
const app = initializeApp(firebaseConfig);

// Step 2: Initializiing firebase auth
const auth = getAuth(app);
const db = getFirestore(app);

// Step 3: Creating a Logic for Sign Up

// const btnSignUp = document.getElementById("btnSignUp");
// btnSignUp.addEventListener("click", async() =>{
//   const email = document.getElementById("signUpEmail").value;
//   const password = document.getElementById("signUpPassword").value;
//   const name = document.getElementById("signUpName").value;

//   try{
//     // check if name is authorized or not
//     const docRef = doc(db, "allowed_users", name); //dbInst,  collectionName, documentID,
//     const docSnap = await getDoc(docRef);

//     if(!docSnap.exists()){
//       alert("You're not authorized to sign up")
//       return;
//     }
//   const userCredentials =  await createUserWithEmailAndPassword(  // await because it takes time
//                             auth, email, password); 
//   alert("Sign up Successfull! ")  
  
// } 
// catch(error){
//     alert("Error signing up: " + error.message)
//   }
// });

// Step 4: Sign in Logic 
const btnSignIn = document.getElementById("btnLogin");

btnSignIn.addEventListener("click", async() =>{
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try{
    const userCredentials = await signInWithEmailAndPassword(auth, email, password);
    alert("Login Successful");
    console.log("Logged in:" + userCredentials.user)

  } catch(error){
    alert("Login Failed" + error.message);
  }
});
