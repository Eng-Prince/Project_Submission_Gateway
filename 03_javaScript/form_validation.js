/*  This code is used for validation whethere an email is valid or not
    or whether the pwd is long enough
*/


// Validation for SignIn

const loginEmailError = DOM.loginEmailError;
const loginPwdError = DOM.loginPwdError;


// Function for email authentication

function validateEmail(){
  const email = DOM.loginEmail.value.trim();

  // if email is empty
  if (email === "") {
    loginEmailError.textContent = "Please fill the email";
    loginEmailError.style.display = "block";
    return false;
  }

  const isLower = email === email.toLowerCase();
  const domain = email.endsWith("@gmail.com");
  const minLength = email.length > 3;
  const noSpaces = !/\s/.test(email);

  const isValid = isLower && domain && minLength && noSpaces;

  if(!isValid){
      loginEmailError.style.display = "block";

      if(!isLower) loginEmailError.textContent = "Email should be in lower case" ;
      else if(!domain) loginEmailError.textContent = "Email should end with @gmail.com ";
      else if(!minLength) loginEmailError.textContent = "Email should be greater than 3";
      else if(!noSpaces) loginEmailError.textContent = "Email cannot contain spaces";

  } else{
    loginEmailError.style.display = "none";
    }

  return isValid;
}

// Function to validate Pwd
function validatePwd(){
  const pwd = DOM.loginPassword.value.trim();

  // if password is empty
   if (pwd === "") {
    loginPwdError.textContent = "Please fill the password";
    loginPwdError.style.display = "block";
    return false;
  }

  // Checking condition
  const minLength = pwd.length >= 6;
  const hasLetter = /[A-Za-z]/.test(pwd);
  const hasNumb = /[0-9]/.test(pwd);
  const noSpaces = !/\s/.test(pwd);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>=+-]/.test(pwd);
  
  const isValid = minLength && noSpaces && hasLetter && hasNumb && hasSymbol;

  if(!isValid){
      loginPwdError.style.display = "block";
      
      if(!minLength) loginPwdError.textContent = "The password should 6 character long" ;
      else if (!hasLetter) loginPwdError.textContent = "The password should has letter";
      else if (!hasNumb) loginPwdError.textContent = "The password should contain any Numerical";
      else if (!hasSymbol) loginPwdError.textContent = "The password should contain any Symbol";
      else if (!noSpaces) loginPwdError.textContent = "The password should had no spaces";

  } else{
    loginPwdError.style.display = "none";
    }

  return isValid;
}


DOM.btnSignIn.addEventListener("click", () =>{

      const isEmailValid = validateEmail();
      const isPwdValid = validatePwd();

      if(isEmailValid && isPwdValid) {
        console.log("All Validation passed ready to sing in");
      }

});


// Creating the Sign UP Validataton

const signUpEnrollError =  DOM.signUpEnrollError;
const signUpEmailError = DOM.signUpEmailError;
const signUpPwdError = DOM.signUpPwdError;

// function for Enroll
function validateSignUpEnroll(){
const enroll = DOM.signUpEnroll.value;

if(enroll === ""){
   signUpEnrollError.style.display = "block";
   signUpEnrollError.textContent = "Please fill the Enrollment Number";
   return false;
}

  // Condition for Enroll
  const length = enroll.length === 12 ;
  const onlyNumbers =  /^[0-9]+$/.test(enroll);
  const noSpaces = !/\s/.test(enroll);

  const isValid = length && onlyNumbers && noSpaces;

  if(!isValid){
     signUpEnrollError.style.display = "block";

     if(!length){
      signUpEnrollError.textContent = "The Enroll should be 12 digit long";
     }
     else if(!onlyNumbers){
      signUpEnrollError.textContent = "The Enroll should only contains Numbers";
     }
     else if(!noSpaces){
      signUpEnrollError.textContent = "The Enroll should has no spaces";
     }
  }

  else{
    signUpEnrollError.style.display = "none";
  }
    
 return isValid;
}

// Function for Email
function validateSignUpEmail(){
const email = DOM.signUpEmail.value;

 if(email === ""){
    signUpEmailError.style.display = "block";
    signUpEmailError.textContent = "Please fill the Email";
    return false;
 }

// Necessary condition for Email
   
  const isLower = email === email.toLowerCase();
  const domain = email.endsWith("@gmail.com");
  const minLength = email.length > 10;
  const noSpaces = !/\s/.test(email);

  const isValid = isLower && domain && minLength && noSpaces;

  if(!isValid){
      signUpEmailError.style.display = "block";

      if(!isLower) signUpEmailError.textContent = "Email should be in lower case" ;
      else if(!domain) signUpEmailError.textContent = "Email should end with @gmail.com ";
      else if(!minLength) signUpEmailError.textContent = "Email should be greater than 3";
      else if(!noSpaces) signUpEmailError.textContent = "Email cannot contain spaces";

  } else{
    signUpEmailError.style.display = "none";
    }

  return isValid;

}

function validateSignUpPwd(){
const pwd = DOM.signUpPwd.value.trim();

  // if password is empty
   if (pwd === "") {
    signUpPwdError.textContent = "Please fill the password";
    signUpPwdError.style.display = "block";
    return false;
  }

  // Checking condition
  const minLength = pwd.length >= 6;
  const hasLetter = /[A-Za-z]/.test(pwd);
  const hasNumb = /[0-9]/.test(pwd);
  const noSpaces = !/\s/.test(pwd);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>=+-]/.test(pwd);
  
  const isValid = minLength && noSpaces && hasLetter && hasNumb && hasSymbol;

  if(!isValid){
      signUpPwdError.style.display = "block";
      
      if(!minLength) signUpPwdError.textContent = "The password should 6 character long" ;
      else if (!hasLetter) signUpPwdError.textContent = "The password should has letter";
      else if (!hasNumb) signUpPwdError.textContent = "The password should contain any Numerical";
      else if (!hasSymbol) signUpPwdError.textContent = "The password should contain any Symbol";
      else if (!noSpaces) signUpPwdError.textContent = "The password should had no spaces";

  } else{
    signUpPwdError.style.display = "none";
    }

  return isValid;
}

DOM.btnSignUp.addEventListener("click", () =>{
    const enroll = validateSignUpEnroll();
    const emila = validateSignUpEmail();
    const pwds  = validateSignUpPwd();

    if(enroll && emila && pwds){
      console.log("Verify for sign up ")
    }
});


/*
// Valiation for selcting user professional

const teacher = DOM.teachSelect;
const student = DOM.studSelect;

function isTeacher(){
   if(teacher.checked){
    alert("Teacher selected")
    return true;
   }
   else{
    return false;
   }
}
function isStudent(){
  if(student.checked){
    alert("Student selected")
    return true;
  }

  else{
    return false
  }
}

btnSignUp.addEventListener("click", () =>{
const stud = isStudent();
    const teach = isTeacher();

    if( !stud && !teach){
      alert("Select a teacher or student")
    }

});

*/