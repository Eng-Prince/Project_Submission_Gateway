/* This is a JavaScript logic which we use to make the webpage dynamic 
   i.e changning login and signup page or handling UI 
*/

const container = document.getElementById("mainContainer");

// We will clear the user email and pwd after they switch
function switchToSignup() {
    console.log("Switch to sign up")

  container.classList.add("active");
  // formpage();

  DOM.loginEmail.value = "";
  DOM.loginPassword.value = "";

}

// there we also clear the user input ie. pwd email and enroll to null
function switchToLogin() {
  console.log("Switch to login")
  container.classList.remove("active");
  DOM.signUpEmail.value = "";
  DOM.signUpEnroll.value = "";
  DOM.signUpPwd.value = "";
}


const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  // Optional: Toggle emoji/icon
  togglePassword.textContent = type === "password" ? "👁️" : "🙈";
});


const images = [
  'https://via.placeholder.com/300x200/ff7f7f/333333?text=First+Image',
  'https://via.placeholder.com/300x200/7fbfff/333333?text=Second+Image',
  'https://via.placeholder.com/300x200/7fff7f/333333?text=Third+Image'
];

// Function to update the image based on selected radio
function changeImg(index) {
  document.getElementById('mainImg').src = images[index];
}

function loginPage(){
  const Email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("password").value.trim();
  
  if (Email === "" || pass === "") {
      alert("Please fill out all fields!");
      return;
  }else{
    NewWindow();
  }

}

function NewWindow() {
  window.location.href = "01_html/submit_Page.html";
}

function formpage() {

  const Email = document.getElementById("signUpEmail").value.trim();
  const pass = document.getElementById("signUpPassword").value.trim();
  const studentRadio = document.getElementById("studentRoll");
  const techerRadio = document.getElementById("teacherRoll");

  if (studentRadio.checked || techerRadio.checked) {
    if (Email === "" || pass === "") {
      alert("Please fill out all fields!");
      return;
    } if (studentRadio.checked) {
      NewWindow();
    } else {
      NewWindow();
    }
  }
  else {
    alert("Please select Your Profession before continuing.");
  }
}

function studentimg(role){
  const image = document.querySelector(".ipic2");

      if (role === "student") {
        image.src = "images/s1.png";
      } else if (role === "teacher") {
        image.src = "images/t1.png";
      }
}


