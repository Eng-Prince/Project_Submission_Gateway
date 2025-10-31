/*    

*/

const fileInput = document.getElementById("fileInput");
const previewBox = document.getElementById("previewBox");
const filePreview = document.getElementById("filePreview");
let selectedFile = null;

fileInput.addEventListener("change", function () {
  selectedFile = this.files[0];

  if (!selectedFile) return;

  const fileType = selectedFile.type;

  // PDF Preview
  if (fileType === "application/pdf") {
    filePreview.innerHTML = `<embed src="${URL.createObjectURL(selectedFile)}" type="application/pdf" />`;
  }
});

function uploadFile() {
  if (!selectedFile) {
    alert("Please select a file first.");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  fetch("/upload", {
    method: "POST",
    body: formData
  })
    .then(res => res.text())
    .then(msg => alert(msg))
    .catch(() => alert("Upload failed."));
}

function showAlert(message) {
  document.getElementById("alertMessage").innerText = message;
  document.getElementById("customAlert").style.display = "block";
  // setTimeout(() => {
  //   location.reload();
  // }, 2000)
}

function closeAlert() {
  document.getElementById("customAlert").style.display = "none";
}

function Register() {

    document.getElementById("form-container").addEventListener("submit", function(e) {
      e.preventDefault();

    showAlert("Registration successful!");
    // location.reload();
    //  localStorage.setItem("projects", JSON.stringify(storage));
    return ;
  });

}




let storage = JSON.parse(localStorage.getItem('projects')) || [];

showAllProjects();


function showAllProjects() {

  let projectHTML = '';

  // if( storage.length === 0) {
  //   projectList.innerHTML = "<p>No projects submitted yet.</p>";
  //   return;
  // }

  for (let i = 0; i < storage.length; i++) {
    const project = storage[i];

  
    
    const projectTitle = project.projectTitle;
    const projectURL = project.projectUrl
    const SubmitDate = project.submitDate;
    const html = `
    
    <div class="DetailsContainer">
    <h3>Project ${i + 1}</h3>
    <h4>Project Title : ${projectTitle}</h4>
    <p>Project URL: <a href="${projectURL}" target="_blank">${projectURL}</a></p>
    <p>Date of Submission: ${SubmitDate} </p>
     </div>
    <button class="delete-btn" onclick="deleteProject()">Delete</button>


    `;
    projectHTML += html;
  }

  document.getElementById('projectList').innerHTML = projectHTML;
  
}
  //  projects.forEach((project, index) => {
  //       const projectDiv = document.createElement("div");
  //       projectDiv.className = "projects";
  //       projectDiv.innerHTML = `
  //         <strong>Project ${index + 1}</strong><br>
  //         <b>Title:</b> ${project.Firstname}<br>
  //         <b>Description:</b> ${project.RollNo}
  //       `;
  //       projectList.appendChild(projectDiv);
  //     });

  // projectList.innerHTML = projectHTML;

function showProjects() {
  // const firstName = document.getElementById("FirstName").value;
  // const lastname = document.getElementById("lastName").value;
  // const enrollment = document.getElementById("enrollment").value;
  const projectTitle = document.getElementById("Project-tittle").value;
  const submitDate = document.getElementById("date").value;
  const projectUrl = document.getElementById("url").value;

  storage.push({
    // firstName,
    // lastname,
    // enrollment,
    projectTitle,
    submitDate,
    projectUrl
  });

  localStorage.setItem("projects", JSON.stringify(storage));

  // document.getElementById("FirstName").value = '';
  // document.getElementById("enrollment").value = '';

  showAllProjects();
}
function deleteProject() {
  localStorage.removeItem("projects");
  storage = [];
  document.getElementById("projectList").innerHTML = null;
  // return 
  // showAllProjects();
}

function saveProfile() {
      let name = document.getElementById("name").value;
      let email = document.getElementById("email").value;


      if(name && email) {
      // Hide popup
      document.getElementById("popupOverlay").classList.add("hidden");
      // Remove blur from background page
      document.getElementById("blur_bg").style.filter = "none";
        document.getElementById("FirstName").value = name;
        document.getElementById("nameShow").value = name;
        document.getElementById("EmailShow").value = email;        
        alert("Profile saved successfully!");
      } else {
        alert("Please fill all fields!");
      }
    }

    function openProfile() {
      document.getElementById("overlay").style.display = "flex";
      setTimeout(() => {
        document.getElementById("profileBox").classList.add("show");
      }, 50); // small delay for animation
    }

    function closeProfile() {
      document.getElementById("profileBox","profileBox2").classList.remove("show");
      setTimeout(() => {
        document.getElementById("overlay", "overlay2").style.display = "none";
      }, 400); // wait for animation to finish
    }
    function closeProjectD() {
      document.getElementById("profileBox2").classList.remove("show");
      setTimeout(() => {
        document.getElementById("overlay2").style.display = "none";
      }, 400); // wait for animation to finish
    }
    
    function projectDetails(){
      document.getElementById("overlay2").style.display = "flex";
      setTimeout(() => {
        document.getElementById("profileBox2").classList.add("show");
      }, 50);
      
    } 

    function logout(){
      window.location.href = "Main_index.html";

    }

    function profileclick (){
    const fileinput = document.getElementById("fileInput");
    const preview = document.getElementById("preview");
    const profile = document.getElementById("profile-cr")

    // When clicking image -> open file input
    preview.addEventListener("click", () => {
      fileinput.click();
    });

    // When selecting a file -> update image
    fileInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          preview.src = e.target.result;
          profile.src = e.target.result;
           // show uploaded image
        };
        reader.readAsDataURL(file);
      }
    });
  }