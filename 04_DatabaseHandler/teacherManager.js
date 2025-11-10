/**
 * 04_DatabaseHandler/teacherManager.js
 * Shows teacher NAME instead of UID
 */

import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    getDoc
} from './firebaseConfig.js';

let teacherData = null;
let allProjects = [];
let currentUser = null;

/**
 * Check if user is teacher
 */
async function isTeacher(uid) {
    try {
        console.log("🔍 Checking if user is teacher (UID:", uid + ")");
        
        // METHOD 1: Query by UID field
        const teacherRef = collection(db, "TeacherEligibility");
        const q = query(teacherRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            console.log("✅ Teacher found (query method)");
            return true;
        }
        
        // METHOD 2: Direct document access
        const directDocRef = doc(db, "TeacherEligibility", uid);
        const docSnap = await getDoc(directDocRef);
        
        if (docSnap.exists()) {
            console.log("✅ Teacher found (direct method)");
            return true;
        }
        
        // METHOD 3: Check by email
        const userEmail = auth.currentUser?.email;
        if (userEmail) {
            const emailQuery = query(teacherRef, where("email", "==", userEmail));
            const emailSnapshot = await getDocs(emailQuery);
            
            if (!emailSnapshot.empty) {
                console.log("✅ Teacher found (email method)");
                return true;
            }
        }
        
        console.log("❌ Not found in TeacherEligibility collection");
        return false;
        
    } catch (error) {
        console.error("Error checking teacher status:", error);
        return false;
    }
}

/**
 * Check authentication and verify teacher access
 */
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        
        console.log("✅ User authenticated:", user.email);
        console.log("UID:", user.uid);
        
        // Clear debug info
        const debugInfo = document.getElementById('debugInfo');
        if (debugInfo) {
            debugInfo.innerHTML = '<div class="debug-item success">✅ User authenticated: ' + user.email + '</div>';
        }
        
        // CRITICAL: Verify user is a teacher
        console.log("🔍 Verifying teacher access...");
        const isTeacherUser = await isTeacher(user.uid);
        
        if (!isTeacherUser) {
            console.error("❌ ACCESS DENIED - User is not a teacher");
            
            // Set name as "Access Denied"
            document.getElementById('teacherName').textContent = 'Access Denied';
            document.getElementById('userEmail').textContent = user.email || 'Unknown';
            
            if (debugInfo) {
                debugInfo.innerHTML += '<div class="debug-item error">❌ Access Denied - Not a teacher</div>';
            }
            
            // Show access denied message
            document.getElementById('projectsList').innerHTML = `
                <div class="error-box">
                    <h3>❌ Access Denied</h3>
                    <p><strong>You are not registered as a teacher.</strong></p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Account Details:</strong></p>
                        <p>📧 Email: ${user.email}</p>
                        <p>🆔 UID: ${user.uid}</p>
                    </div>
                    
                    <div class="fix-steps">
                        <strong>To Access Teacher Dashboard:</strong>
                        <ol>
                            <li>Open <strong>Firebase Console</strong></li>
                            <li>Go to <strong>Firestore Database</strong></li>
                            <li>Open <strong>TeacherEligibility</strong> collection</li>
                            <li>Add a new document with:
                                <ul>
                                    <li><code>uid</code>: ${user.uid}</li>
                                    <li><code>email</code>: ${user.email}</li>
                                    <li><code>name</code>: Your Full Name</li>
                                </ul>
                            </li>
                            <li>Refresh this page</li>
                        </ol>
                        <p style="margin-top: 15px;"><strong>Or contact your administrator for access.</strong></p>
                    </div>
                    
                    <p style="margin-top: 30px; color: #666; font-weight: bold;">
                        ⏱️ Redirecting to student page in 5 seconds...
                    </p>
                </div>
            `;
            
            // Redirect after 5 seconds
            setTimeout(() => {
                window.location.href = '../01_html/submitPage.html';
            }, 5000);
            return;
        }
        
        console.log("✅ Teacher access verified");
        
        if (debugInfo) {
            debugInfo.innerHTML += '<div class="debug-item success">✅ Teacher access verified</div>';
        }
        
        // Load teacher data FIRST
        await tryLoadTeacherData(user.uid);
        
        // Display teacher name (priority: teacherData.name > email username > "Teacher")
        let displayName = 'Teacher';
        
        if (teacherData?.name) {
            displayName = teacherData.name;
        } else if (user.displayName) {
            displayName = user.displayName;
        } else if (user.email) {
            displayName = user.email.split('@')[0]; // Use email prefix as fallback
        }
        
        document.getElementById('teacherName').textContent = displayName;
        document.getElementById('userEmail').textContent = user.email || 'Unknown';
        
        console.log("👨‍🏫 Teacher name displayed:", displayName);
        
        // Load projects
        await loadAllProjects();
        
    } else {
        console.log("❌ No user logged in");
        
        document.getElementById('teacherName').textContent = 'Not logged in';
        document.getElementById('userEmail').textContent = 'N/A';
        
        const debugInfo = document.getElementById('debugInfo');
        if (debugInfo) {
            debugInfo.innerHTML = '<div class="debug-item error">❌ No user logged in</div>';
        }
        
        document.getElementById('projectsList').innerHTML = `
            <div class="error-box">
                <h3>🔒 Authentication Required</h3>
                <p>You need to login first to access the teacher dashboard.</p>
                <div class="fix-steps">
                    <strong>Options:</strong>
                    <ol>
                        <li><strong>Login:</strong> Go back and login with teacher credentials</li>
                        <li><strong>Testing:</strong> Click "⚡ Skip Auth" button to view without login</li>
                    </ol>
                </div>
            </div>
        `;
    }
});

/**
 * Try to load teacher data
 */
async function tryLoadTeacherData(uid) {
    try {
        console.log("📥 Loading teacher data...");
        
        const teacherRef = collection(db, "TeacherEligibility");
        
        // METHOD 1: Query by UID
        const q = query(teacherRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                teacherData = { id: doc.id, ...doc.data() };
            });
            console.log("✅ Teacher data loaded (query):", teacherData);
            return;
        }
        
        // METHOD 2: Direct access
        const directDocRef = doc(db, "TeacherEligibility", uid);
        const docSnap = await getDoc(directDocRef);
        
        if (docSnap.exists()) {
            teacherData = { id: uid, ...docSnap.data() };
            console.log("✅ Teacher data loaded (direct):", teacherData);
            return;
        }
        
        // METHOD 3: Search by email
        const userEmail = auth.currentUser?.email;
        if (userEmail) {
            const emailQuery = query(teacherRef, where("email", "==", userEmail));
            const emailSnapshot = await getDocs(emailQuery);
            
            if (!emailSnapshot.empty) {
                emailSnapshot.forEach((doc) => {
                    teacherData = { id: doc.id, ...doc.data() };
                });
                console.log("✅ Teacher data loaded (email):", teacherData);
                return;
            }
        }
        
        console.log("⚠️ Teacher data not found - will use email as display name");
        
    } catch (error) {
        console.error("Error loading teacher data:", error);
    }
}

/**
 * Load all projects
 */
window.loadAllProjects = async function() {
    try {
        console.log("📥 Loading all projects...");
        
        const projectsRef = collection(db, "Projects");
        const querySnapshot = await getDocs(projectsRef);
        
        console.log(`Found ${querySnapshot.size} projects`);
        
        const debugInfo = document.getElementById('debugInfo');
        if (debugInfo) {
            debugInfo.innerHTML += `<div class="debug-item success">📊 Found ${querySnapshot.size} projects</div>`;
        }
        
        allProjects = [];
        querySnapshot.forEach((doc) => {
            allProjects.push({ id: doc.id, ...doc.data() });
        });
        
        if (allProjects.length === 0) {
            showNoProjectsMessage();
            return;
        }
        
        // Sort by submission date (newest first)
        allProjects.sort((a, b) => {
            const dateA = new Date(a.submittedAt || 0);
            const dateB = new Date(b.submittedAt || 0);
            return dateB - dateA;
        });
        
        updateStatistics();
        displayProjects(allProjects);
        
        console.log("✅ Projects loaded and displayed successfully");
        
    } catch (error) {
        console.error("❌ Error loading projects:", error);
        
        const debugInfo = document.getElementById('debugInfo');
        if (debugInfo) {
            debugInfo.innerHTML += `<div class="debug-item error">❌ Error: ${error.message}</div>`;
        }
        
        showErrorMessage(error);
    }
}

/**
 * Skip authentication (for testing only)
 */
window.skipAuth = async function() {
    console.log("⚡ Skipping authentication (TESTING MODE)");
    
    document.getElementById('teacherName').textContent = 'Test Mode (No Auth)';
    document.getElementById('userEmail').textContent = 'testing@example.com';
    
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        debugInfo.innerHTML += '<div class="debug-item" style="background: #FF9800;">⚡ TESTING MODE - Auth skipped</div>';
    }
    
    try {
        await loadAllProjects();
    } catch (error) {
        console.error("Error loading projects:", error);
        alert("Failed to load projects: " + error.message);
    }
}

/**
 * Update statistics
 */
function updateStatistics() {
    const stats = {
        total: allProjects.length,
        submitted: allProjects.filter(p => p.status === "submitted" || !p.status).length,
        approved: allProjects.filter(p => p.status === "approved").length,
        rejected: allProjects.filter(p => p.status === "rejected").length
    };
    
    document.getElementById("totalProjects").textContent = stats.total;
    document.getElementById("submittedProjects").textContent = stats.submitted;
    document.getElementById("approvedProjects").textContent = stats.approved;
    document.getElementById("rejectedProjects").textContent = stats.rejected;
    
    console.log("📊 Statistics updated:", stats);
}

/**
 * Display projects
 */
function displayProjects(projects) {
    const projectsList = document.getElementById("projectsList");
    
    if (projects.length === 0) {
        projectsList.innerHTML = '<p class="no-projects">No projects to display</p>';
        return;
    }
    
    let html = '';
    projects.forEach((project, index) => {
        html += createProjectHTML(project, index + 1);
    });
    
    projectsList.innerHTML = html;
}

/**
 * Create project HTML card
 */
function createProjectHTML(project, number) {
    const submittedDate = project.submittedAt ?
        new Date(project.submittedAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Unknown date';
    
    const status = project.status || 'submitted';
    const statusColors = {
        'submitted': '#2196F3',
        'reviewed': '#FF9800',
        'approved': '#4CAF50',
        'rejected': '#F44336'
    };
    
    return `
        <div class="project-item">
            <div class="project-header">
                <div class="project-title">
                    <h3>${project.projectTitle || 'Untitled Project'}</h3>
                    <p>📅 Submitted: ${submittedDate}</p>
                </div>
                <span class="status-badge" style="background: ${statusColors[status]}">
                    ${status.toUpperCase()}
                </span>
            </div>
            
            <div class="student-info">
                <p><strong>👤 Student:</strong> ${project.studentName || 'N/A'}</p>
                <p><strong>🎓 Enrollment:</strong> ${project.enrollmentNumber || 'N/A'}</p>
                <p><strong>📧 Email:</strong> ${project.email || 'N/A'}</p>
                <p><strong>📱 Mobile:</strong> ${project.mobile || 'N/A'}</p>
                <p><strong>🏫 Branch:</strong> ${project.branch || 'N/A'}</p>
                <p><strong>📚 Semester:</strong> ${project.semester || 'N/A'}</p>
            </div>
            
            <div class="project-description">
                <strong>📝 Description:</strong>
                <p>${project.projectDescription || 'No description provided'}</p>
            </div>
            
            <div class="project-links">
                ${project.githubLink ? 
                    `<a href="${project.githubLink}" target="_blank" class="project-link link-github">
                        🔗 GitHub Repository
                    </a>` : ''}
                ${project.liveProjectLink ? 
                    `<a href="${project.liveProjectLink}" target="_blank" class="project-link link-live">
                        🚀 Live Demo
                    </a>` : ''}
                ${project.pdfUrl || project.pdfLink ? 
                    `<a href="${project.pdfUrl || project.pdfLink}" target="_blank" class="project-link link-pdf">
                        📄 PDF Report
                    </a>` : ''}
            </div>
            
            <div class="review-section">
                <h4>📝 Review & Grade This Project</h4>
                
                <textarea 
                    id="comment-${project.id}" 
                    placeholder="Enter your feedback for the student..."
                    rows="4"
                >${project.teacherComment || ''}</textarea>
                
                <div style="display: flex; gap: 10px; margin: 10px 0; flex-wrap: wrap;">
                    <select id="status-${project.id}" style="flex: 1; min-width: 150px;">
                        <option value="submitted" ${status === 'submitted' ? 'selected' : ''}>📤 Submitted</option>
                        <option value="reviewed" ${status === 'reviewed' ? 'selected' : ''}>👁️ Under Review</option>
                        <option value="approved" ${status === 'approved' ? 'selected' : ''}>✅ Approved</option>
                        <option value="rejected" ${status === 'rejected' ? 'selected' : ''}>❌ Rejected</option>
                    </select>
                    
                    <input 
                        type="text" 
                        id="grade-${project.id}" 
                        placeholder="Grade (e.g., A+, 95/100)" 
                        value="${project.grade || ''}"
                        style="flex: 1; min-width: 150px;"
                    >
                </div>
                
                <button class="review-btn" onclick="saveReview('${project.id}')">
                    💾 Save Review
                </button>
                
                ${project.reviewedBy ? `
                    <p style="margin-top: 10px; color: #666; font-size: 12px;">
                        Last reviewed by <strong>${project.reviewedBy}</strong> 
                        on ${new Date(project.reviewedAt).toLocaleDateString('en-IN')}
                    </p>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Save review
 */
window.saveReview = async function(projectId) {
    try {
        console.log("💾 Saving review for project:", projectId);
        
        const comment = document.getElementById(`comment-${projectId}`).value.trim();
        const status = document.getElementById(`status-${projectId}`).value;
        const grade = document.getElementById(`grade-${projectId}`).value.trim();
        
        if (!comment && status !== 'submitted') {
            alert("⚠️ Please provide feedback before changing status!");
            return;
        }
        
        // Get teacher name for "reviewedBy" field
        const reviewerName = teacherData?.name || currentUser?.email || "Teacher";
        
        const reviewData = {
            teacherComment: comment,
            status: status,
            grade: grade,
            reviewedBy: reviewerName,
            reviewedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        const projectRef = doc(db, "Projects", projectId);
        await updateDoc(projectRef, reviewData);
        
        console.log("✅ Review saved successfully by:", reviewerName);
        alert("✅ Review saved successfully!");
        
        // Reload projects to show updated data
        await loadAllProjects();
        
    } catch (error) {
        console.error("❌ Error saving review:", error);
        alert("Failed to save review:\n" + error.message);
    }
}

/**
 * Apply filters
 */
window.applyFilters = function() {
    console.log("🔍 Applying filters...");
    
    const statusFilter = document.getElementById("filterStatus").value;
    const branchFilter = document.getElementById("filterBranch").value;
    const semesterFilter = document.getElementById("filterSemester").value;
    const studentFilter = document.getElementById("filterStudent").value.toLowerCase();
    
    let filtered = allProjects.filter(project => {
        if (statusFilter && project.status !== statusFilter) return false;
        if (branchFilter && project.branch !== branchFilter) return false;
        if (semesterFilter && project.semester !== semesterFilter) return false;
        if (studentFilter &&
            !project.studentName?.toLowerCase().includes(studentFilter) &&
            !project.enrollmentNumber?.toLowerCase().includes(studentFilter)) return false;
        return true;
    });
    
    console.log(`Filtered to ${filtered.length} projects`);
    displayProjects(filtered);
}

/**
 * Show no projects message
 */
function showNoProjectsMessage() {
    document.getElementById('projectsList').innerHTML = `
        <div class="error-box">
            <h3>📭 No Projects Found</h3>
            <p>No student has submitted any projects yet.</p>
            <div class="fix-steps">
                <strong>To Test:</strong>
                <ol>
                    <li>Login as a <strong>student</strong></li>
                    <li>Go to <strong>submitPage.html</strong></li>
                    <li>Submit a test project</li>
                    <li>Come back here and click <strong>"🔄 Reload Projects"</strong></li>
                </ol>
            </div>
        </div>
    `;
}

/**
 * Show error message
 */
function showErrorMessage(error) {
    document.getElementById('projectsList').innerHTML = `
        <div class="error-box">
            <h3>❌ Error Loading Projects</h3>
            <p><strong>${error.message}</strong></p>
            <div class="fix-steps">
                <strong>Possible Solutions:</strong>
                <ol>
                    <li>Check your internet connection</li>
                    <li>Verify Firebase configuration in <code>firebaseConfig.js</code></li>
                    <li>Check Firestore security rules</li>
                    <li>Open browser console (F12) for detailed error logs</li>
                </ol>
            </div>
        </div>
    `;
}

/**
 * Logout
 */
window.logout = async function() {
    if (confirm("Are you sure you want to logout?")) {
        try {
            console.log("🚪 Logging out...");
            await signOut(auth);
            console.log("✅ Logged out successfully");
            window.location.href = "../Main_index.html";
        } catch (error) {
            console.error("❌ Logout failed:", error);
            alert("Logout failed: " + error.message);
        }
    }
}

console.log("✅ Teacher Manager loaded");