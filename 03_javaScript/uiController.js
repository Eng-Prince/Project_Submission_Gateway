/**
 * 03_javaScript/uiController.js
 * 
 * Handles UI interactions (non-module script)
 * Profile display, alerts, navigation
 */

/**
 * Open profile view
 */
window.openProfile = async function() {
    console.log("👤 Opening profile view...");
    
    const profileData = getCurrentUserDataFromStorage();
    
    if (!profileData || !profileData.enrollmentNumber) {
        alert("Profile not loaded. Please refresh the page.");
        return;
    }
    
    // Fill profile display
    document.getElementById("profile-name").textContent = profileData.name || "N/A";
    document.getElementById("profile-email").textContent = "Email: " + (profileData.email || "N/A");
    document.getElementById("profile-mobile").textContent = "Mobile: " + (profileData.mobile || "N/A");
    document.getElementById("profile-enrollment").textContent = "Enrollment: " + (profileData.enrollmentNumber || "N/A");
    document.getElementById("profile-branch").textContent = "Branch: " + (profileData.branch || "Not set");
    document.getElementById("profile-department").textContent = "Department: " + (profileData.department || "Not set");
    document.getElementById("profile-semester").textContent = "Semester: " + (profileData.semester || "Not set");
    document.getElementById("profile-year").textContent = "Year: " + (profileData.year || "Not set");
    
    // Set profile picture
    if (profileData.profilePicture) {
        document.getElementById("profile-display").src = profileData.profilePicture;
    }
    
    // Show overlay
    const overlay = document.getElementById("overlay");
    const profileBox = document.getElementById("profileBox");
    
    overlay.style.display = "flex";
    setTimeout(() => {
        profileBox.classList.add("show");
    }, 50);
}

/**
 * Close profile view
 */
window.closeProfile = function() {
    const overlay = document.getElementById("overlay");
    const profileBox = document.getElementById("profileBox");
    
    profileBox.classList.remove("show");
    setTimeout(() => {
        overlay.style.display = "none";
    }, 400);
}

/**
 * Show alert
 */
window.showAlert = function(message) {
    const alertBox = document.getElementById("customAlert");
    const alertMessage = document.getElementById("alertMessage");
    
    if (alertMessage) {
        alertMessage.textContent = message;
    }
    
    if (alertBox) {
        alertBox.style.display = "block";
    }
}

/**
 * Close alert
 */
window.closeAlert = function() {
    const alertBox = document.getElementById("customAlert");
    if (alertBox) {
        alertBox.style.display = "none";
    }
}

/**
 * Logout
 */
window.logout = async function() {
    const confirmLogout = confirm("Are you sure you want to logout?");
    
    if (confirmLogout) {
        try {
            // Dynamically import auth
            const { auth } = await import('../04_DatabaseHandler/firebaseConfig.js');
            const { signOut } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js');
            
            await signOut(auth);
            localStorage.clear();
            
            console.log("✅ User logged out");
            window.location.href = "../Main_index.html";

            

            
        } catch (error) {
            console.error("❌ Error logging out:", error);
            alert("Failed to logout: " + error.message);
        }
    }

      DOM.loginEmail.value = "";
            DOM.loginPassword.value = "";
}

/**
 * Get user data from storage
 */
function getCurrentUserDataFromStorage() {
    try {
        if (window.currentUserData) {
            return window.currentUserData;
        }
        
        const stored = localStorage.getItem("currentUserProfile");
        if (stored) {
            return JSON.parse(stored);
        }
        
        return null;
    } catch (error) {
        console.error("Error getting user data:", error);
        return null;
    }
}

/**
 * Set submission date to today
 */
window.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById("submissionDate");
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.setAttribute('max', today);
    }
});

/**
 * Scroll to top on load
 */
window.addEventListener('load', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/**
 * Handle escape key
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const profileOverlay = document.getElementById("overlay");
        if (profileOverlay && profileOverlay.style.display === "flex") {
            closeProfile();
        }
        
        const projectsOverlay = document.getElementById("projectsOverlay");
        if (projectsOverlay && projectsOverlay.style.display === "flex") {
            closeMyProjects();
        }
        
        const alertBox = document.getElementById("customAlert");
        if (alertBox && alertBox.style.display === "block") {
            closeAlert();
        }
    }
});

/**
 * Prevent form submission on Enter
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("projectForm");
    if (form) {
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
    }
});

console.log("✅ UI Controller initialized");