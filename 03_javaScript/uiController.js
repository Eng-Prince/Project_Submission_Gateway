/**
 * uiController.js
 * 
 * Handles all UI interactions and animations:
 * - Opening/closing overlays
 * - Navigation controls
 * - Alert messages
 * - Profile display
 * 
 * NOTE: This file does NOT use ES6 modules - it's loaded as a regular script
 */

/**
 * Open profile view overlay
 * Displays user's complete profile information
 */
window.openProfile = async function() {
    console.log("👤 Opening profile view...");
    
    // Get profile data from localStorage (set by profileManager.js)
    const profileData = getCurrentUserDataFromStorage();
    
    if (!profileData || !profileData.enrollmentNumber) {
        alert("Profile not loaded. Please refresh the page.");
        return;
    }
    
    // Fill profile display fields
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
    
    // Show overlay with animation
    const overlay = document.getElementById("overlay");
    const profileBox = document.getElementById("profileBox");
    
    overlay.style.display = "flex";
    setTimeout(() => {
        profileBox.classList.add("show");
    }, 50);
}

/**
 * Close profile view overlay
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
 * Show alert message
 * @param {string} message - Message to display
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
 * Close alert message
 */
window.closeAlert = function() {
    const alertBox = document.getElementById("customAlert");
    if (alertBox) {
        alertBox.style.display = "none";
    }
    console.log("Alert closed");
}

/**
 * Logout user and redirect to login page
 */
window.logout = async function() {
    const confirmLogout = confirm("Are you sure you want to logout?");
    
    if (confirmLogout) {
        try {
            // Import auth dynamically
            const { auth } = await import('./firebaseConfig.js');
            const { signOut } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js');
            
            // Sign out from Firebase
            await signOut(auth);
            
            // Clear local storage
            localStorage.clear();
            
            console.log("✅ User logged out successfully");
            
            // Redirect to login page
            window.location.href = "login.html";
            
        } catch (error) {
            console.error("❌ Error logging out:", error);
            alert("Failed to logout: " + error.message);
        }
    }
}

/**
 * Get current user data from localStorage
 * This is a fallback for non-module scripts
 * @returns {Object|null} User data or null
 */
function getCurrentUserDataFromStorage() {
    try {
        // First try to get from window object (set by profileManager)
        if (window.currentUserData) {
            return window.currentUserData;
        }
        
        // Fallback to localStorage
        const stored = localStorage.getItem("currentUserProfile");
        if (stored) {
            return JSON.parse(stored);
        }
        
        return null;
    } catch (error) {
        console.error("Error getting user data from storage:", error);
        return null;
    }
}

/**
 * Set submission date to today by default
 */
window.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById("submissionDate");
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.setAttribute('max', today); // Prevent future dates
    }
});

/**
 * Smooth scroll to top when page loads
 */
window.addEventListener('load', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/**
 * Handle escape key to close overlays
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close profile overlay
        const profileOverlay = document.getElementById("overlay");
        if (profileOverlay && profileOverlay.style.display === "flex") {
            closeProfile();
        }
        
        // Close projects overlay
        const projectsOverlay = document.getElementById("projectsOverlay");
        if (projectsOverlay && projectsOverlay.style.display === "flex") {
            closeMyProjects();
        }
        
        // Close alert
        const alertBox = document.getElementById("customAlert");
        if (alertBox && alertBox.style.display === "block") {
            closeAlert();
        }
    }
});

/**
 * Prevent form submission on Enter key (except in textarea)
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

/**
 * Add loading animation to buttons when clicked
 */
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('submit-btn') || e.target.classList.contains('popbtn')) {
        e.target.classList.add('loading');
        e.target.disabled = true;
        
        // Remove loading state after 5 seconds (in case of error)
        setTimeout(() => {
            e.target.classList.remove('loading');
            e.target.disabled = false;
        }, 5000);
    }
});

console.log("✅ UI Controller initialized");