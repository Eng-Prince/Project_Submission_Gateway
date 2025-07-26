const container = document.getElementById("mainContainer");

function switchToSignup() {
  container.classList.add("active");
  // formpage();
}

function switchToLogin() {
  container.classList.remove("active");
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
  window.location.href = "/views/infoForm.html";
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
        image.src = "s1.png";
      } else if (role === "teacher") {
        image.src = "t1.png";
      }
}


