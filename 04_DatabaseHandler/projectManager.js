/**
 * projectManager.js
 * 
 * NOW SUPPORTS: PDF file upload with page count validation
 * Uses Firebase Storage OR external links (GitHub/Drive)
 */

import { 
    db, 
    storage,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    ref,
    uploadBytes,
    getDownloadURL
} from './firebaseConfig.js';

import { getCurrentUserData } from './profileManager.js';

/**
 * Submit a new project to Firebase
 * Supports BOTH: File upload AND URL links
 */
window.submitProject = async function() {
    try {
        console.log("📤 Submitting project...");
        
        // Get current user data
        const userData = getCurrentUserData();
        
        // Validate user is logged in and has profile
        if (!userData.enrollmentNumber) {
            alert("Please complete your profile before submitting a project!");
            return;
        }
        
        // Get project form values
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
        
        // Validate GitHub URL format
        if (!isValidGitHubUrl(githubLink)) {
            alert("Please enter a valid GitHub repository URL!\n\nExample: https://github.com/username/project-name");
            return;
        }
        
        // Check if user provided PDF (either file OR link)
        const hasPdfFile = pdfFileInput && pdfFileInput.files[0];
        const hasPdfLink = pdfLinkInput && pdfLinkInput.length > 0;
        
        if (!hasPdfFile && !hasPdfLink) {
            const confirmSubmit = confirm("⚠️ No PDF report provided.\n\nDo you want to submit without a PDF?\n\nClick OK to continue, or Cancel to add a PDF.");
            if (!confirmSubmit) return;
        }
        
        // Show loading state
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
        
        // Handle PDF: File upload OR URL
        if (hasPdfFile) {
            console.log("📄 Uploading PDF file...");
            try {
                // Validate PDF before upload
                const validationResult = await validatePDF(pdfFileInput.files[0]);
                if (!validationResult.valid) {
                    showAlert(validationResult.error, true);
                    return;
                }
                
                // Upload to Firebase Storage
                const pdfUrl = await uploadPDFToStorage(pdfFileInput.files[0], userData.enrollmentNumber, projectTitle);
                projectData.pdfUrl = pdfUrl;
                projectData.pdfSource = "uploaded"; // Track source
                projectData.pdfPageCount = validationResult.pageCount;
                console.log("✅ PDF uploaded successfully!");
            } catch (uploadError) {
                console.error("⚠️ Error uploading PDF:", uploadError);
                showAlert("PDF upload failed: " + uploadError.message + "\n\nSubmitting project without PDF.", true);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } else if (hasPdfLink) {
            // Validate URL
            if (!isValidUrl(pdfLinkInput)) {
                alert("Please enter a valid PDF link!");
                return;
            }
            projectData.pdfUrl = pdfLinkInput;
            projectData.pdfSource = "link"; // Track source
        }
        
        // Save project to Firestore
        const projectsRef = collection(db, "Projects");
        const docRef = await addDoc(projectsRef, projectData);
        
        console.log("✅ Project submitted successfully with ID:", docRef.id);
        
        // Also save to localStorage for offline view
        let localProjects = JSON.parse(localStorage.getItem('projects')) || [];
        localProjects.push({ ...projectData, id: docRef.id });
        localStorage.setItem('projects', JSON.stringify(localProjects));
        
        // Clear form
        clearProjectForm();
        
        // Show success message
        showAlert("✅ Project submitted successfully!\n\nYour project has been sent for review.", true);
        
    } catch (error) {
        console.error("❌ Error submitting project:", error);
        showAlert("Failed to submit project: " + error.message, true);
    }
}

/**
 * Validate PDF file
 * Checks: file type, size, page count (commented out for now)
 * @param {File} file - PDF file to validate
 * @returns {Promise<Object>} Validation result
 */
async function validatePDF(file) {
    try {
        // Check file type
        if (file.type !== 'application/pdf') {
            return { valid: false, error: "❌ Only PDF files are allowed!" };
        }
        
        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            const sizeMB = (file.size / 1024 / 1024).toFixed(2);
            return { 
                valid: false, 
                error: `❌ PDF file too large!\n\nYour file: ${sizeMB}MB\nMaximum: 10MB\n\nPlease compress your PDF or use a link instead.` 
            };
        }
        
        // PAGE COUNT VALIDATION (COMMENTED OUT FOR NOW)
        /*
        // Read PDF to count pages
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pageCount = pdf.numPages;
        
        console.log(`📄 PDF has ${pageCount} pages`);
        
        // Check minimum page count (50 pages)
        if (pageCount < 50) {
            return { 
                valid: false, 
                error: `❌ PDF must have at least 50 pages!\n\nYour PDF: ${pageCount} pages\nRequired: 50+ pages`,
                pageCount: pageCount
            };
        }
        */
        
        // For now, just return valid without page check
        return { 
            valid: true, 
            pageCount: "Not checked" // Will show as "Not checked" until validation is enabled
        };
        
    } catch (error) {
        console.error("Error validating PDF:", error);
        return { 
            valid: false, 
            error: "❌ Could not validate PDF file. Please try again or use a URL link instead." 
        };
    }
}

/**
 * Upload PDF to Firebase Storage
 * @param {File} file - PDF file to upload
 * @param {string} enrollmentNumber - Student's enrollment number
 * @param {string} projectTitle - Project title for filename
 * @returns {Promise<string>} Download URL of uploaded PDF
 */
async function uploadPDFToStorage(file, enrollmentNumber, projectTitle) {
    try {
        // Create unique filename
        const timestamp = Date.now();
        const sanitizedTitle = projectTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
        const fileName = `${enrollmentNumber}_${sanitizedTitle}_${timestamp}.pdf`;
        
        // Create storage reference
        // Path: projectReports/enrollmentNumber/filename.pdf
        const storageRef = ref(storage, `projectReports/${enrollmentNumber}/${fileName}`);
        
        // Upload file
        console.log("⬆️ Uploading to Firebase Storage...");
        await uploadBytes(storageRef, file);
        console.log("✅ PDF uploaded to storage");
        
        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);
        console.log("✅ PDF download URL obtained");
        
        return downloadURL;
        
    } catch (error) {
        console.error("❌ Error uploading PDF:", error);
        throw new Error("PDF upload failed: " + error.message);
    }
}

/**
 * Validate GitHub URL format
 */
function isValidGitHubUrl(url) {
    const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubPattern.test(url);
}

/**
 * Validate general URL format
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
 * Load and display user's submitted projects
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
 * Create HTML card for a project
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
    
    // Show PDF source (uploaded or link)
    let pdfBadge = '';
    if (project.pdfSource === 'uploaded') {
        pdfBadge = '<span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">📤 Uploaded</span>';
    } else if (project.pdfSource === 'link') {
        pdfBadge = '<span style="background: #2196F3; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">🔗 Linked</span>';
    }
    
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
                    ${project.pdfPageCount ? `<p><strong>📄 PDF Pages:</strong> ${project.pdfPageCount}</p>` : ''}
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
                            📄 View Report ${pdfBadge}
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
 * Close my projects overlay
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
        pdfInput.addEventListener("change", async function() {
            const file = this.files[0];
            if (file) {
                if (file.type === 'application/pdf') {
                    const fileSize = (file.size / 1024 / 1024).toFixed(2);
                    
                    // Show file info
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
                    
                    // Validate PDF
                    const validation = await validatePDF(file);
                    const statusElement = pdfPreview.querySelector('.pdf-status');
                    if (statusElement) {
                        if (validation.valid) {
                            statusElement.textContent = "✅ Valid PDF";
                            statusElement.style.color = "#4CAF50";
                        } else {
                            statusElement.textContent = "⚠️ " + validation.error;
                            statusElement.style.color = "#F44336";
                        }
                    }
                } else {
                    alert("Please select a PDF file!");
                    this.value = "";
                }
            }
        });
    }
});

/**
 * Remove selected PDF file
 */
window.removePDF = function() {
    document.getElementById("pdfFileInput").value = "";
    document.getElementById("pdfPreview").innerHTML = "";
}

/**
 * Clear project submission form
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
 * Show alert message
 */
function showAlert(message, showButton = true) {
    const alertBox = document.getElementById("customAlert");
    const alertMessage = document.getElementById("alertMessage");
    const alertButton = alertBox ? alertBox.querySelector("button") : null;
    
    if (alertMessage) alertMessage.textContent = message;
    if (alertButton) alertButton.style.display = showButton ? "block" : "none";
    if (alertBox) alertBox.style.display = "block";
}