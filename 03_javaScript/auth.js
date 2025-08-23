/*  This code is used for the login & singUp authentication for teacher and students
    by using the firebase database 

*/

import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js' // importing fun InitApp from fir/ app

import {getAuth, 
        createUserWithEmailAndPassword,
       signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js'

import { getFirestore, doc, getDoc, setDoc , updateDoc } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'

const firebaseConfig = {
  apiKey: "AIzaSyBX1GRJNR8oVn1VqGES1PFVwMDs4thqvgk",
  authDomain: "projectsubmission-d6c00.firebaseapp.com",
  projectId: "projectsubmission-d6c00",
  storageBucket: "projectsubmission-d6c00.firebasestorage.app",
  messagingSenderId: "127406788051",
  appId: "1:127406788051:web:bcdb95dcdc779786373326",
  measurementId: "G-J1K43R271Y"
};

console.log("Using Firebase");
const app = initializeApp(firebaseConfig); // in the fun passing firebaseConfig
const auth = getAuth(app) 
const db = getFirestore(app);

// Step 1: Selecting element in js 

const btnSignUp = DOM.btnSignUp;
const btnSignIn = DOM.btnSignIn;

const studSelect = DOM.studSelect;
const teachSelect = DOM.teachSelect;

// SIGN UP LOGIC
btnSignUp.addEventListener("click", async() => {
  try {
    const signUpEmail = DOM.signUpEmail.value;
    const signUpEnroll = DOM.signUpEnroll.value; 
    const signUpPwd = DOM.signUpPwd.value;

    let readDoc, snapShot;
    // Step 2: In database searching for the elements

    if (studSelect.checked) {
      readDoc = doc(db, "StudentEligibility", signUpEnroll);
      console.log("Looking for readDoc", readDoc)
      snapShot = await getDoc(readDoc);

      if (!snapShot.exists()) {
        alert("Your Enrollment no. is not registerd as a student"); 
        return;
      }

      // Now check if the stored email matches
      const data = snapShot.data();
      if(data.email !== signUpEmail){
        alert("Your email is not registered as student")
        return;
      }
    }

    if (teachSelect.checked) {
        readDoc = doc(db, "TeacherEligibility", signUpEnroll);
        snapShot = await getDoc(readDoc);

      if (!snapShot.exists()) {
        alert("You' Enrollment no is not registered"); 
        return;
      }

      // now check if email is exist or not
      const data = snapShot.data();
      if(data.email !== signUpEmail){
        alert("Your email is not registered as Teacher")
        return;
      }
      
    }

    // Step 3: Creating user account
    const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPwd);

    await updateDoc(readDoc, {
        uid: userCredential.user.uid,
        accountCreated: true,
        createdAt: new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",

        })
      });
    

    alert("Sign up successful"); 
    switchToLogin();
    return;

    // Rediricting to login page
  }
  catch (error) {
    alert(error.message);

    // if there is an error in on server side
    if(userCredential && error.message.includes('updateDoc')){
      await userCredential.user.delete(); 
      alert("Something went wrong");
    }
  }
});



// SIGN IN LOGIC

btnSignIn.addEventListener( "click", async () => {
  const loginEmail = document.getElementById("loginEmail").value;
  const loginPassword = document.getElementById("loginPassword").value;

  try{
    const userCredential =  await signInWithEmailAndPassword(auth, loginEmail, loginPassword)

    alert("Login Successfull")
    console.log("Logged in:" , userCredential.user)

    // Redirecting to login page
    formpage();
  } catch(error){
    alert(error.message);
    }
})
