/**
 * 04_DatabaseHandler/projectManager.js
 * 
 * Handles project submission and viewing
 */

import { 
    db, 
    collection,
    addDoc,
    query,
    where,
    getDocs
} from './firebaseConfig.js';

import { getCurrentUserData } from './profileManager.js';
import { uploadProjectPDF } from './cloudinaryUploader.js';

/**
 * Submit a new project
 */
window.submitProject = async function() {
    try {
        console.log("📤 Submitting project...");
        
        // Get current user data
        const userData = getCurrentUserData();
        
        if (!userData.enrollmentNumber) {
            alert("Please complete your profile before submitting a project!");
            return;
        }
        
        // Get form values
        const projectTitle = document.getElementById("projectTitle").value.trim();
        const projectDescription = document.getElementById("projectDescription").value.trim();
        const githubLink = document.getElementById("githubLink").value.trim();
        const liveProjectLink = document.getElementById("liveProjectLink").value.trim();
        const pdfLinkInput = document.getElementById("pdfLink").value.trim();
        const pdfFileInput = document.getElementById("pdfFileInput");
        const submissionDate = document.getElementById("submissionDate").value;
        
        // Validate required fields
        if (!projectTitle || !projectDescription || !githubLink || !submissionDate) {
            alert("Please fill all required fields!\n\nRequired:\n- Project Title\n- Description\n- GitHub Link\n- Submission Date");
            return;
        }
        
        // Validate GitHub URL
        if (!isValidGitHubUrl(githubLink)) {
            alert("Please enter a valid GitHub repository URL!\n\nExample: https://github.com/username/project-name");
            return;
        }
        
        // Check PDF
        const hasPdfFile = pdfFileInput && pdfFileInput.files[0];
        const hasPdfLink = pdfLinkInput && pdfLinkInput.length > 0;
        
        if (!hasPdfFile && !hasPdfLink) {
            const confirmSubmit = confirm("⚠️ No PDF report provided.\n\nDo you want to submit without a PDF?\n\nClick OK to continue, or Cancel to add a PDF.");
            if (!confirmSubmit) return;
        }
        
        // Show loading
        showAlert("Submitting project... Please wait...", false);
        
        // Prepare project data
        const projectData = {
            // Student information
            uid: userData.uid,
            studentName: userData.name,
            enrollmentNumber: userData.enrollmentNumber,
            email: userData.email,
            mobile: userData.mobile,
            branch: userData.branch,
            department: userData.department,
            semester: userData.semester,
            year: userData.year,
            
            // Project information
            projectTitle: projectTitle,
            projectDescription: projectDescription,
            githubLink: githubLink,
            liveProjectLink: liveProjectLink || "",
            submissionDate: submissionDate,
            
            // Metadata
            submittedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            status: "submitted",
            teacherComment: "",
            grade: "",
            reviewedBy: "",
            reviewedAt: ""
        };
        
        // Handle PDF upload
        if (hasPdfFile) {
            console.log("📄 Uploading PDF to Cloudinary...");
            
            try {
                const uploadResult = await uploadProjectPDF(
                    pdfFileInput.files[0],
                    userData.enrollmentNumber,
                    projectTitle
                );
                
                if (uploadResult.success) {
                    projectData.pdfUrl = uploadResult.pdfUrl;
                    projectData.pdfDownloadUrl = uploadResult.pdfDownloadUrl;
                    projectData.pdfSize = uploadResult.pdfSize;
                    projectData.pdfPages = uploadResult.pdfPages;
                    projectData.pdfSource = "cloudinary";
                    console.log("✅ PDF uploaded to Cloudinary!");
                } else {
                    throw new Error('Upload failed');
                }
                
            } catch (uploadError) {
                console.error("⚠️ Error uploading PDF:", uploadError);
                const continueWithout = confirm(
                    "PDF upload failed: " + uploadError.message + 
                    "\n\nDo you want to submit the project WITHOUT the PDF?"
                );
                if (!continueWithout) {
                    showAlert("Submission cancelled.", true);
                    return;
                }
            }
        } else if (hasPdfLink) {
            // Validate URL
            if (!isValidUrl(pdfLinkInput)) {
                alert("Please enter a valid PDF link!");
                return;
            }
            projectData.pdfUrl = pdfLinkInput;
            projectData.pdfSource = "link";
        }
        
        // Save to Firestore
        const projectsRef = collection(db, "Projects");
        const docRef = await addDoc(projectsRef, projectData);
        
        console.log("✅ Project submitted successfully with ID:", docRef.id);
        
        // Save to localStorage for offline view
        let localProjects = JSON.parse(localStorage.getItem('projects')) || [];
        localProjects.push({ ...projectData, id: docRef.id });
        localStorage.setItem('projects', JSON.stringify(localProjects));
        
        // Clear form
        clearProjectForm();
        
        // Show success
        showAlert("✅ Project submitted successfully!\n\nYour project has been sent for review.", true);
        
    } catch (error) {
        console.error("❌ Error submitting project:", error);
        showAlert("Failed to submit project: " + error.message, true);
    }
}

/**
 * Validate GitHub URL
 */
function isValidGitHubUrl(url) {
    const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubPattern.test(url);
}

/**
 * Validate URL
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Show My Projects
 */
window.showMyProjects = async function() {
    try {
        console.log("📋 Loading user's projects...");
        
        const userData = getCurrentUserData();
        
        if (!userData.enrollmentNumber) {
            alert("Please complete your profile first!");
            return;
        }
        
        document.getElementById("projectsOverlay").style.display = "flex";
        
        const projectsRef = collection(db, "Projects");
        const q = query(projectsRef, where("enrollmentNumber", "==", userData.enrollmentNumber));
        const querySnapshot = await getDocs(q);
        
        const projectsList = document.getElementById("projectsList");
        
        if (querySnapshot.empty) {
            projectsList.innerHTML = `
                <div class="no-projects">
                    <p>📭 No projects submitted yet.</p>
                    <p>Submit your first project to get started!</p>
                </div>
            `;
            return;
        }
        
        let projectsHTML = '';
        let projectCount = 1;
        
        querySnapshot.forEach((doc) => {
            const project = doc.data();
            projectsHTML += createProjectCard(project, projectCount, doc.id);
            projectCount++;
        });
        
        projectsList.innerHTML = projectsHTML;
        console.log(`✅ Loaded ${projectCount - 1} projects`);
        
    } catch (error) {
        console.error("❌ Error loading projects:", error);
        document.getElementById("projectsList").innerHTML = 
            '<p class="error-text">Failed to load projects. Please try again.</p>';
    }
}

/**
 * Create project card HTML
 */
function createProjectCard(project, index, docId) {
    const submittedDate = new Date(project.submittedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const statusConfig = {
        'submitted': { emoji: '📤', color: '#2196F3', text: 'Submitted' },
        'reviewed': { emoji: '👁️', color: '#FF9800', text: 'Under Review' },
        'approved': { emoji: '✅', color: '#4CAF50', text: 'Approved' },
        'rejected': { emoji: '❌', color: '#F44336', text: 'Rejected' }
    };
    
    const status = statusConfig[project.status] || statusConfig['submitted'];
    
    return `
        <div class="project-card" data-id="${docId}">
            <div class="project-header">
                <h3>${status.emoji} Project ${index}</h3>
                <span class="project-status" style="background: ${status.color}">
                    ${status.text}
                </span>
            </div>
            
            <div class="project-body">
                <h4 class="project-title">${project.projectTitle}</h4>
                <p class="project-description">${project.projectDescription}</p>
                
                <div class="project-details">
                    <p><strong>📚 Branch:</strong> ${project.branch}</p>
                    <p><strong>📖 Semester:</strong> ${project.semester}</p>
                    <p><strong>📅 Submission Date:</strong> ${project.submissionDate}</p>
                    <p><strong>🕒 Submitted At:</strong> ${submittedDate}</p>
                </div>
                
                <div class="project-links">
                    <a href="${project.githubLink}" target="_blank" class="btn-link btn-github">
                        🔗 GitHub Repository
                    </a>
                    ${project.liveProjectLink ? 
                        `<a href="${project.liveProjectLink}" target="_blank" class="btn-link btn-live">
                            🚀 Live Demo
                        </a>` : ''}
                    ${project.pdfUrl ? 
                        `<a href="${project.pdfUrl}" target="_blank" class="btn-link btn-pdf">
                            📄 View Report
                        </a>` : ''}
                </div>
                
                ${project.teacherComment ? `
                    <div class="teacher-feedback">
                        <h5>👨‍🏫 Teacher's Feedback:</h5>
                        <p>${project.teacherComment}</p>
                        ${project.grade ? `<p><strong>Grade:</strong> ${project.grade}</p>` : ''}
                        ${project.reviewedBy ? `<p class="reviewer">- ${project.reviewedBy}</p>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Close projects overlay
 */
window.closeMyProjects = function() {
    document.getElementById("projectsOverlay").style.display = "none";
}

/**
 * Handle PDF file preview
 */
document.addEventListener('DOMContentLoaded', () => {
    const pdfInput = document.getElementById("pdfFileInput");
    const pdfPreview = document.getElementById("pdfPreview");
    
    if (pdfInput && pdfPreview) {
        pdfInput.addEventListener("change", function() {
            const file = this.files[0];
            if (file) {
                if (file.type === 'application/pdf') {
                    const fileSize = (file.size / 1024 / 1024).toFixed(2);
                    pdfPreview.innerHTML = `
                        <div class="pdf-info">
                            <span class="pdf-icon">📄</span>
                            <div class="pdf-details">
                                <p class="pdf-name">${file.name}</p>
                                <p class="pdf-size">${fileSize} MB</p>
                                <p class="pdf-status">✅ Ready to upload</p>
                            </div>
                            <button type="button" class="pdf-remove" onclick="removePDF()">✕</button>
                        </div>
                    `;
                } else {
                    alert("Please select a PDF file!");
                    this.value = "";
                }
            }
        });
    }
});

/**
 * Remove PDF
 */
window.removePDF = function() {
    document.getElementById("pdfFileInput").value = "";
    document.getElementById("pdfPreview").innerHTML = "";
}

/**
 * Clear form
 */
function clearProjectForm() {
    document.getElementById("projectTitle").value = "";
    document.getElementById("projectDescription").value = "";
    document.getElementById("githubLink").value = "";
    document.getElementById("liveProjectLink").value = "";
    document.getElementById("pdfLink").value = "";
    if (document.getElementById("pdfFileInput")) {
        document.getElementById("pdfFileInput").value = "";
    }
    if (document.getElementById("pdfPreview")) {
        document.getElementById("pdfPreview").innerHTML = "";
    }
}

/**
 * Show alert
 */
function showAlert(message, showButton = true) {
    const alertBox = document.getElementById("customAlert");
    const alertMessage = document.getElementById("alertMessage");
    const alertButton = alertBox ? alertBox.querySelector("button") : null;
    
    if (alertMessage) alertMessage.textContent = message;
    if (alertButton) alertButton.style.display = showButton ? "block" : "none";
    if (alertBox) alertBox.style.display = "block";
}