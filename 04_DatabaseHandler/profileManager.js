/**
 * profileManager.js
 * 
 * Handles all profile-related operations:
 * - Loading user data from StudentEligibility collection
 * - Creating/updating UserProfile collection
 * - Uploading and managing profile pictures
 * - Auto-filling form fields
 */

import { 
    auth, 
    db, 
    storage,
    onAuthStateChanged,
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    ref,
    uploadBytes,
    getDownloadURL
} from './firebaseConfig.js';

// Store current user data globally for easy access
let currentUserData = {
    uid: null,
    enrollmentNumber: null,
    name: null,
    email: null,
    mobile: null,
    profilePicture: null
};

/**
 * Initialize profile manager on page load
 * Checks if user is logged in and loads their profile
 */
window.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Profile Manager initialized");
    
    // Listen for authentication state changes
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("✅ User logged in with UID:", user.uid);
            currentUserData.uid = user.uid;
            
            // Check if user is a teacher or student
            const isTeacher = await checkIfTeacher(user.uid);
            
            if (isTeacher) {
                console.log("👨‍🏫 User is a teacher, redirecting to teacher dashboard...");
                window.location.href = "teacherDashboard.html";
                return;
            }
            
            // User is a student, load profile
            await loadUserProfile(user.uid);
        } else {
            console.log("❌ No user logged in, redirecting to login...");
            // Uncomment to redirect to login page
            // window.location.href = "login.html";
        }
    });
});

/**
 * Check if user is a teacher
 * @param {string} uid - User's UID
 * @returns {Promise<boolean>} True if user is teacher
 */
async function checkIfTeacher(uid) {
    try {
        // Check TeacherEligibility collection
        const teacherRef = collection(db, "TeacherEligibility");
        const q = query(teacherRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return true;
        }
        
        // Also check direct document access
        const directDocRef = doc(db, "TeacherEligibility", uid);
        const docSnap = await getDoc(directDocRef);
        
        return docSnap.exists();
    } catch (error) {
        console.error("Error checking teacher status:", error);
        return false;
    }
}

/**
 * Load user profile from both StudentEligibility and UserProfile collections
 * @param {string} uid - User's Firebase UID
 */
async function loadUserProfile(uid) {
    try {
        console.log("📥 Loading user profile for UID:", uid);
        
        // Step 1: Find the StudentEligibility document using UID
        // Since your document ID might be different, we'll query by uid field
        const studentEligibilityRef = collection(db, "StudentEligibility");
        const q = query(studentEligibilityRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        
        let eligibilityData = null;
        let eligibilityDocId = null;
        
        if (!querySnapshot.empty) {
            // Found the document
            querySnapshot.forEach((doc) => {
                eligibilityData = doc.data();
                eligibilityDocId = doc.id;
            });
            console.log("✅ StudentEligibility data loaded:", eligibilityData);
        } else {
            // Try direct document access with UID as document ID
            const directDocRef = doc(db, "StudentEligibility", uid);
            const directDocSnap = await getDoc(directDocRef);
            
            if (directDocSnap.exists()) {
                eligibilityData = directDocSnap.data();
                eligibilityDocId = uid;
                console.log("✅ StudentEligibility data loaded (direct):", eligibilityData);
            }
        }
        
        if (!eligibilityData) {
            console.error("❌ Student eligibility data not found for UID:", uid);
            alert("Your account data is incomplete. Please contact administrator.");
            return;
        }
        
        // Store basic user data
        currentUserData.enrollmentNumber = eligibilityData.enrollmentNumber || eligibilityDocId;
        currentUserData.name = eligibilityData.name || "";
        currentUserData.email = eligibilityData.email || "";
        currentUserData.mobile = eligibilityData.mobile || "";
        currentUserData.profilePicture = eligibilityData.profilePicture || null;
        
        console.log("📋 Current User Data:", currentUserData);
        
        // Step 2: Check if UserProfile exists with enrollment number as document ID
        const userProfileRef = doc(db, "UserProfile", currentUserData.enrollmentNumber);
        const userProfileSnap = await getDoc(userProfileRef);
        
        if (userProfileSnap.exists()) {
            // User profile exists - load and display it
            const profileData = userProfileSnap.data();
            console.log("✅ UserProfile data loaded:", profileData);
            
            // Merge profile data with eligibility data
            currentUserData = { ...currentUserData, ...profileData };
            
            // Fill all form fields
            fillFormFields(currentUserData);
            
            // Hide popup since profile is complete
            hideProfilePopup();
            
        } else {
            // User profile doesn't exist - create it and show popup
            console.log("⚠️ UserProfile not found, creating initial profile...");
            await createInitialUserProfile();
            showProfilePopup();
        }
        
        // Store in window for uiController access
        window.currentUserData = currentUserData;
        
        // Also store in localStorage as backup
        localStorage.setItem("currentUserProfile", JSON.stringify(currentUserData));
        
    } catch (error) {
        console.error("❌ Error loading user profile:", error);
        alert("Failed to load profile: " + error.message);
    }
}

/**
 * Create initial UserProfile document with basic info from StudentEligibility
 * This happens automatically when user logs in for the first time
 */
async function createInitialUserProfile() {
    try {
        console.log("🆕 Creating initial UserProfile for:", currentUserData.enrollmentNumber);
        
        const userProfileRef = doc(db, "UserProfile", currentUserData.enrollmentNumber);
        
        // Create basic profile with user info from StudentEligibility
        const initialProfile = {
            uid: currentUserData.uid,
            enrollmentNumber: currentUserData.enrollmentNumber,
            name: currentUserData.name,
            email: currentUserData.email,
            mobile: currentUserData.mobile,
            branch: "",
            department: "",
            semester: "",
            year: "",
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        // Save to Firestore
        await setDoc(userProfileRef, initialProfile);
        console.log("✅ Initial UserProfile created successfully!");
        
        // Update current user data
        currentUserData = { ...currentUserData, ...initialProfile };
        
        // Fill popup fields with existing data (name, email, mobile readonly)
        fillPopupFields(currentUserData);
        
    } catch (error) {
        console.error("❌ Error creating initial profile:", error);
        throw error;
    }
}

/**
 * Save/Update user profile with additional information
 * Called when user clicks "Save Profile" button in popup
 */
window.saveUserProfile = async function() {
    try {
        console.log("💾 Saving user profile...");
        
        // Get values from popup form
        const branch = document.getElementById("popup-branch").value.trim();
        const department = document.getElementById("popup-department").value.trim();
        const semester = document.getElementById("popup-semester").value.trim();
        const year = document.getElementById("popup-year").value.trim();
        
        // Validate required fields
        if (!branch || !department || !semester || !year) {
            alert("Please fill all required fields (Branch, Department, Semester, Year)!");
            return;
        }
        
        // Show loading state
        const saveButton = document.querySelector(".popbtn");
        const originalText = saveButton.textContent;
        saveButton.textContent = "Saving...";
        saveButton.disabled = true;
        
        // Prepare profile data
        const profileData = {
            uid: currentUserData.uid,
            enrollmentNumber: currentUserData.enrollmentNumber,
            name: currentUserData.name,
            email: currentUserData.email,
            mobile: currentUserData.mobile,
            branch: branch,
            department: department,
            semester: semester,
            year: year,
            lastUpdated: new Date().toISOString()
        };
        
        // Handle profile picture upload if selected
        const fileInput = document.getElementById("fileInput");
        if (fileInput.files[0]) {
            console.log("📸 Uploading profile picture...");
            try {
                const profilePictureUrl = await uploadProfilePicture(fileInput.files[0]);
                profileData.profilePicture = profilePictureUrl;
                currentUserData.profilePicture = profilePictureUrl;
                
                // Also update profile picture in StudentEligibility
                await updateStudentEligibilityPhoto(profilePictureUrl);
                console.log("✅ Profile picture uploaded and saved!");
            } catch (uploadError) {
                console.error("⚠️ Error uploading picture:", uploadError);
                alert("Profile picture upload failed, but other data will be saved.");
            }
        }
        
        // Save to UserProfile collection
        const userProfileRef = doc(db, "UserProfile", currentUserData.enrollmentNumber);
        await setDoc(userProfileRef, profileData, { merge: true });
        
        console.log("✅ Profile saved successfully to UserProfile collection");
        
        // Update current user data
        currentUserData = { ...currentUserData, ...profileData };
        
        // Store in window and localStorage
        window.currentUserData = currentUserData;
        localStorage.setItem("currentUserProfile", JSON.stringify(currentUserData));
        
        // Fill form fields with updated data
        fillFormFields(currentUserData);
        
        // Hide popup
        hideProfilePopup();
        
        // Reset button
        saveButton.textContent = originalText;
        saveButton.disabled = false;
        
        alert("✅ Profile saved successfully!");
        
    } catch (error) {
        console.error("❌ Error saving profile:", error);
        alert("Failed to save profile: " + error.message);
        
        // Reset button
        const saveButton = document.querySelector(".popbtn");
        saveButton.textContent = "Save Profile";
        saveButton.disabled = false;
    }
}

/**
 * Upload profile picture to Firebase Storage
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Download URL of uploaded image
 */
async function uploadProfilePicture(file) {
    try {
        // Validate file is an image
        if (!file.type.startsWith('image/')) {
            throw new Error("Only image files are allowed!");
        }
        
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error("Image file size must be less than 5MB!");
        }
        
        const timestamp = Date.now();
        const fileName = `${currentUserData.enrollmentNumber}_${timestamp}.jpg`;
        const storageRef = ref(storage, `profilePictures/${fileName}`);
        
        // Upload file
        await uploadBytes(storageRef, file);
        console.log("✅ File uploaded to storage");
        
        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);
        console.log("✅ Download URL obtained:", downloadURL);
        
        return downloadURL;
        
    } catch (error) {
        console.error("❌ Error uploading profile picture:", error);
        throw error;
    }
}

/**
 * Update profile picture in StudentEligibility collection
 * @param {string} photoUrl - URL of the profile picture
 */
async function updateStudentEligibilityPhoto(photoUrl) {
    try {
        // First try to find the document by querying uid
        const studentEligibilityRef = collection(db, "StudentEligibility");
        const q = query(studentEligibilityRef, where("uid", "==", currentUserData.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            // Update the found document
            querySnapshot.forEach(async (docSnapshot) => {
                const docRef = doc(db, "StudentEligibility", docSnapshot.id);
                await updateDoc(docRef, {
                    profilePicture: photoUrl,
                    lastUpdated: new Date().toISOString()
                });
                console.log("✅ Profile picture updated in StudentEligibility (query method)");
            });
        } else {
            // Try direct update with UID as document ID
            const directDocRef = doc(db, "StudentEligibility", currentUserData.uid);
            await updateDoc(directDocRef, {
                profilePicture: photoUrl,
                lastUpdated: new Date().toISOString()
            });
            console.log("✅ Profile picture updated in StudentEligibility (direct method)");
        }
    } catch (error) {
        console.error("❌ Error updating StudentEligibility photo:", error);
        // Don't throw error - this is not critical
    }
}

/**
 * Fill popup form fields with existing user data
 * @param {Object} data - User data object
 */
function fillPopupFields(data) {
    console.log("📝 Filling popup fields with:", data);
    
    const nameField = document.getElementById("popup-name");
    const emailField = document.getElementById("popup-email");
    const mobileField = document.getElementById("popup-mobile");
    const enrollmentField = document.getElementById("popup-enrollment");
    const branchField = document.getElementById("popup-branch");
    const departmentField = document.getElementById("popup-department");
    const semesterField = document.getElementById("popup-semester");
    const yearField = document.getElementById("popup-year");
    
    if (nameField) nameField.value = data.name || "";
    if (emailField) emailField.value = data.email || "";
    if (mobileField) mobileField.value = data.mobile || "";
    if (enrollmentField) enrollmentField.value = data.enrollmentNumber || "";
    
    // Fill editable fields if they exist
    if (branchField && data.branch) branchField.value = data.branch;
    if (departmentField && data.department) departmentField.value = data.department;
    if (semesterField && data.semester) semesterField.value = data.semester;
    if (yearField && data.year) yearField.value = data.year;
    
    // Set profile picture preview if exists
    if (data.profilePicture) {
        const preview = document.getElementById("preview");
        if (preview) preview.src = data.profilePicture;
    }
}

/**
 * Fill main form fields with user data
 * @param {Object} data - User data object
 */
function fillFormFields(data) {
    console.log("📝 Filling form fields with:", data);
    
    // Auto-fill student information
    const studentNameField = document.getElementById("studentName");
    const enrollmentField = document.getElementById("enrollmentNumber");
    const mobileField = document.getElementById("mobileNumber");
    const branchField = document.getElementById("branch");
    const departmentField = document.getElementById("department");
    const semesterField = document.getElementById("semester");
    
    if (studentNameField) studentNameField.value = data.name || "";
    if (enrollmentField) enrollmentField.value = data.enrollmentNumber || "";
    if (mobileField) mobileField.value = data.mobile || "";
    if (branchField) branchField.value = data.branch || "";
    if (departmentField) departmentField.value = data.department || "";
    if (semesterField) semesterField.value = data.semester || "";
    
    console.log("✅ Form fields filled successfully");
}

/**
 * Show profile creation/edit popup
 */
function showProfilePopup() {
    console.log("🔔 Showing profile popup");
    
    const popup = document.getElementById("popupOverlay");
    const blurBg = document.getElementById("blur_bg");
    
    if (popup) {
        popup.style.display = "flex";
        popup.classList.remove("hidden");
    }
    
    if (blurBg) {
        blurBg.style.filter = "blur(8px)";
    }
    
    // Fill popup with existing data
    fillPopupFields(currentUserData);
}

/**
 * Hide profile popup
 */
function hideProfilePopup() {
    console.log("👋 Hiding profile popup");
    
    const popup = document.getElementById("popupOverlay");
    const blurBg = document.getElementById("blur_bg");
    
    if (popup) {
        popup.style.display = "none";
        popup.classList.add("hidden");
    }
    
    if (blurBg) {
        blurBg.style.filter = "none";
    }
}

/**
 * Handle profile picture preview when user selects an image
 */
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById("fileInput");
    const preview = document.getElementById("preview");
    
    if (fileInput && preview) {
        fileInput.addEventListener("change", function() {
            const file = this.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert("Please select an image file!");
                    this.value = "";
                    return;
                }
                
                // Validate file size
                if (file.size > 5 * 1024 * 1024) {
                    alert("Image size must be less than 5MB!");
                    this.value = "";
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

/**
 * Get current user data (for use in other modules)
 * @returns {Object} Current user data
 */
export function getCurrentUserData() {
    return currentUserData;
}

/**
 * Open edit profile popup
 */
window.editProfile = function() {
    console.log("✏️ Opening edit profile popup");
    fillPopupFields(currentUserData);
    showProfilePopup();
}

// Export for use in other modules
export { loadUserProfile, showProfilePopup, hideProfilePopup };