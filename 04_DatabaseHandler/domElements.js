/*
  In this code we take the element from html and place in variable name
  so we don't have to do it over and over hence elimating dry 
*/

const DOM = {
   
    // Button
    btnSignIn: document.getElementById("btnLogin"),
    btnSignUp: document.getElementById("btnSignUp"),
    
    // Login Fields
    loginEmail: document.getElementById("loginEmail"),
    loginPassword: document.getElementById("loginPassword"),

    // Signup Fields
    signUpEmail: document.getElementById("signUpEmail"),
    signUpEnroll: document.getElementById("signUpEnroll"),
    signUpPwd: document.getElementById("signUpPassword"),
  
    // Error Handling
    loginPwdError: document.getElementById("signInPwdError"),
    loginEmailError: document.getElementById("signInEmailError"),
    
    signUpPwdError: document.getElementById("signUpPwdError"),
    signUpEmailError: document.getElementById("signUpEmailError"),
    signUpEnrollError: document.getElementById("signUpEnrollError"),

    // Professional Selection 
    studSelect: document.getElementById("studentRoll"),
    teachSelect: document.getElementById("teacherRoll")
  
  };

  window.DOM = DOM; // This make DOM globally available