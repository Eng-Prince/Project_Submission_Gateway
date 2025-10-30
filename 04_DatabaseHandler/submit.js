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
      } else {
        alert("Please fill all fields!");
      }
    }