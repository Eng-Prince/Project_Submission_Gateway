/**
 * 04_DatabaseHandler/profileManager.js
 * FIXED: Data loads and displays immediately
 */

import {
    auth,
    db,
    onAuthStateChanged,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs
} from './firebaseConfig.js';

import { uploadProfilePicture } from './cloudinaryUploader.js';

// Store current user data globally
let currentUserData = {
    uid: null,
    enrollmentNumber: null,
    name: null,
    email: null,
    mobile: null,
    profilePicture: null,
    branch: null,
    department: null,
    semester: null,
    year: null
};

/**
 * Initialize profile manager on page load
 */
window.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Profile Manager initialized");
    
    // Listen for authentication state changes
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("✅ User logged in");
            console.log("UID:", user.uid);
            console.log("Email:", user.email);
            
            currentUserData.uid = user.uid;
            
            // CRITICAL: Check if user is a teacher FIRST
            console.log("🔍 Checking user role...");
            const isTeacher = await checkIfTeacher(user.uid);
            
            if (isTeacher) {
                console.log("👨‍🏫 User is a teacher - Redirecting to dashboard");
                
                const mainContainer = document.getElementById("mainContainer");
                if (mainContainer) {
                    mainContainer.innerHTML = `
                        <div style="text-align: center; padding: 50px; color: white;">
                            <h2>👨‍🏫 Teacher Account Detected</h2>
                            <p>Redirecting to Teacher Dashboard...</p>
                        </div>
                    `;
                }
                
                setTimeout(() => {
                    window.location.href = "teacherDashboard.html";
                }, 1500);
                return;
            }
            
            console.log("👨‍🎓 User is a student - Loading profile");
            
            // Load student profile
            await loadUserProfile(user.uid);
            
        } else {
            console.log("❌ No user logged in - Redirecting to login");
            
            const mainContainer = document.getElementById("mainContainer");
            if (mainContainer) {
                mainContainer.innerHTML = `
                    <div style="text-align: center; padding: 50px; color: white;">
                        <h2>🔒 Login Required</h2>
                        <p>Redirecting to login page...</p>
                    </div>
                `;
            }
            
            setTimeout(() => {
                window.location.href = "../Main_index.html";
            }, 2000);
        }
    });
});

/**
 * Check if user is a teacher
 */
async function checkIfTeacher(uid) {
    try {
        console.log("Checking TeacherEligibility for UID:", uid);
        
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
        
        console.log("Not a teacher");
        return false;
        
    } catch (error) {
        console.error("Error checking teacher status:", error);
        return false;
    }
}

/**
 * Load user profile - FIXED VERSION
 */
async function loadUserProfile(uid) {
    try {
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📥 Loading student profile for UID:", uid);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        let eligibilityData = null;
        let eligibilityDocId = null;
        let foundMethod = null;
        
        const studentEligibilityRef = collection(db, "StudentEligibility");
        
        // METHOD 1: Query by UID field
        console.log("🔍 Method 1: Searching by UID field...");
        try {
            const q = query(studentEligibilityRef, where("uid", "==", uid));
            const querySnapshot = await getDocs(q);
            
            console.log(`   Query returned ${querySnapshot.size} document(s)`);
            
            if (!querySnapshot.empty) {
                querySnapshot.forEach((docSnapshot) => {
                    eligibilityData = docSnapshot.data();
                    eligibilityDocId = docSnapshot.id;
                    foundMethod = "UID Query";
                    console.log(`   ✅ Found! Document ID: ${docSnapshot.id}`);
                });
            }
        } catch (err) {
            console.error("   Error in Method 1:", err.message);
        }
        
        // METHOD 2: Direct access (UID as document ID)
        if (!eligibilityData) {
            console.log("🔍 Method 2: Direct access (UID as Doc ID)...");
            try {
                const directDocRef = doc(db, "StudentEligibility", uid);
                const directDocSnap = await getDoc(directDocRef);
                
                if (directDocSnap.exists()) {
                    eligibilityData = directDocSnap.data();
                    eligibilityDocId = uid;
                    foundMethod = "Direct UID Access";
                    console.log("   ✅ Found via direct access!");
                } else {
                    console.log("   ❌ No document at StudentEligibility/" + uid);
                }
            } catch (err) {
                console.error("   Error in Method 2:", err.message);
            }
        }
        
        // METHOD 3: Search by email
        if (!eligibilityData) {
            const userEmail = auth.currentUser?.email;
            console.log(`🔍 Method 3: Searching by email: ${userEmail}...`);
            
            if (userEmail) {
                try {
                    const emailQuery = query(studentEligibilityRef, where("email", "==", userEmail));
                    const emailSnapshot = await getDocs(emailQuery);
                    
                    console.log(`   Email query returned ${emailSnapshot.size} document(s)`);
                    
                    if (!emailSnapshot.empty) {
                        emailSnapshot.forEach((docSnapshot) => {
                            eligibilityData = docSnapshot.data();
                            eligibilityDocId = docSnapshot.id;
                            foundMethod = "Email Query";
                            console.log(`   ✅ Found! Document ID: ${docSnapshot.id}`);
                        });
                    }
                } catch (err) {
                    console.error("   Error in Method 3:", err.message);
                }
            }
        }
        
        // METHOD 4: Get all documents and search manually
        if (!eligibilityData) {
            console.log("🔍 Method 4: Manual search through all documents...");
            
            try {
                const allDocsSnapshot = await getDocs(studentEligibilityRef);
                console.log(`   Total documents in collection: ${allDocsSnapshot.size}`);
                
                if (allDocsSnapshot.size === 0) {
                    console.error("   ⚠️ StudentEligibility collection is EMPTY!");
                } else {
                    allDocsSnapshot.forEach((docSnapshot) => {
                        const data = docSnapshot.data();
                        
                        if (data.uid === uid || data.email === auth.currentUser?.email) {
                            eligibilityData = data;
                            eligibilityDocId = docSnapshot.id;
                            foundMethod = "Manual Search";
                            console.log(`   ✅ Found! Document ID: ${docSnapshot.id}`);
                        }
                    });
                }
            } catch (err) {
                console.error("   Error in Method 4:", err.message);
            }
        }
        
        // CHECK IF DATA WAS FOUND
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        if (!eligibilityData) {
            console.error("❌ STUDENT DATA NOT FOUND");
            console.error("Searched for:");
            console.error("  UID:", uid);
            console.error("  Email:", auth.currentUser?.email);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            
            alert(
                '⚠️ Profile Not Found!\n\n' +
                'Your account is not registered in the system.\n\n' +
                'Details:\n' +
                '━━━━━━━━━━━━━━━━━━━━━\n' +
                'UID: ' + uid + '\n' +
                'Email: ' + (auth.currentUser?.email || 'N/A') + '\n\n' +
                'ACTION REQUIRED:\n' +
                '1. Open Firebase Console\n' +
                '2. Go to Firestore Database\n' +
                '3. Open StudentEligibility collection\n' +
                '4. Add a document with:\n' +
                '   - uid: ' + uid + '\n' +
                '   - email: ' + auth.currentUser?.email + '\n' +
                '   - name: Your Name\n' +
                '   - mobile: Your Mobile\n' +
                '   - enrollmentNumber: Your Number\n\n' +
                'Or contact your administrator.'
            );
            return;
        }
        
        console.log(`✅ SUCCESS! Data found via: ${foundMethod}`);
        console.log("Data:", eligibilityData);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        // EXTRACT AND STORE USER DATA
        currentUserData.uid = uid;
        currentUserData.enrollmentNumber = eligibilityData.enrollmentNumber || eligibilityDocId;
        currentUserData.name = eligibilityData.name || "";
        currentUserData.email = eligibilityData.email || auth.currentUser?.email || "";
        currentUserData.mobile = eligibilityData.mobile || "";
        currentUserData.profilePicture = eligibilityData.profilePicture || null;
        
        console.log("📋 Extracted user data:");
        console.log("   Name:", currentUserData.name);
        console.log("   Email:", currentUserData.email);
        console.log("   Mobile:", currentUserData.mobile);
        console.log("   Enrollment:", currentUserData.enrollmentNumber);
        
        // CHECK IF USER PROFILE EXISTS
        console.log("🔍 Checking UserProfile collection...");
        const userProfileRef = doc(db, "UserProfile", currentUserData.enrollmentNumber);
        const userProfileSnap = await getDoc(userProfileRef);
        
        if (userProfileSnap.exists()) {
            const profileData = userProfileSnap.data();
            console.log("✅ UserProfile exists - Loading data");
            
            // Merge profile data
            currentUserData = { ...currentUserData, ...profileData };
            
            // CRITICAL FIX: Fill form fields IMMEDIATELY
            console.log("📝 Filling form fields with complete data...");
            fillFormFields(currentUserData);
            
            // Also fill popup fields (for when user clicks profile/edit)
            fillPopupFields(currentUserData);
            
            // Hide popup (profile is complete)
            hideProfilePopup();
            
            console.log("✅ Form fields should now be visible!");
            
        } else {
            console.log("⚠️ UserProfile not found - Creating new profile");
            await createInitialUserProfile();
            
            // Fill popup with existing data (name, email, mobile)
            fillPopupFields(currentUserData);
            
            // Show popup to complete profile
            showProfilePopup();
        }
        
        // STORE GLOBALLY
        window.currentUserData = currentUserData;
        localStorage.setItem("currentUserProfile", JSON.stringify(currentUserData));
        
        console.log("✅ Profile loading complete!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
    } catch (error) {
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("❌ FATAL ERROR loading profile:");
        console.error(error);
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        alert(
            'Failed to load profile!\n\n' +
            'Error: ' + error.message + '\n\n' +
            'Please check browser console (F12) for details.'
        );
    }
}

/**
 * Create initial UserProfile document
 */
async function createInitialUserProfile() {
    try {
        console.log("Creating initial UserProfile for:", currentUserData.enrollmentNumber);
        
        const userProfileRef = doc(db, "UserProfile", currentUserData.enrollmentNumber);
        
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
            profilePicture: currentUserData.profilePicture || "",
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        await setDoc(userProfileRef, initialProfile);
        console.log("✅ Initial UserProfile created successfully");
        
        currentUserData = { ...currentUserData, ...initialProfile };
        
    } catch (error) {
        console.error("❌ Error creating initial profile:", error);
        throw error;
    }
}

/**
 * Save/Update user profile
 */
window.saveUserProfile = async function() {
    try {
        console.log("💾 Saving user profile...");
        
        const branch = document.getElementById("popup-branch").value.trim();
        const department = document.getElementById("popup-department").value.trim();
        const semester = document.getElementById("popup-semester").value.trim();
        const year = document.getElementById("popup-year").value.trim();
        
        if (!branch || !department || !semester || !year) {
            alert("⚠️ Please fill all required fields:\n\n- Branch\n- Department\n- Semester\n- Year");
            return;
        }
        
        const saveButton = document.querySelector(".popbtn");
        const originalText = saveButton.textContent;
        saveButton.textContent = "Saving...";
        saveButton.disabled = true;
        
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
        
        // Handle profile picture upload
        const fileInput = document.getElementById("fileInput");
        if (fileInput.files[0]) {
            console.log("📸 Uploading profile picture to Cloudinary...");
            
            try {
                const uploadResult = await uploadProfilePicture(
                    fileInput.files[0],
                    currentUserData.enrollmentNumber
                );
                
                if (uploadResult.success) {
                    profileData.profilePicture = uploadResult.profilePictureUrl;
                    currentUserData.profilePicture = uploadResult.profilePictureUrl;
                    await updateStudentEligibilityPhoto(uploadResult.profilePictureUrl);
                    console.log("✅ Profile picture uploaded successfully");
                }
            } catch (uploadError) {
                console.error("⚠️ Profile picture upload failed:", uploadError);
                const continueAnyway = confirm(
                    "Profile picture upload failed:\n" + uploadError.message + 
                    "\n\nDo you want to save other profile data anyway?"
                );
                if (!continueAnyway) {
                    saveButton.textContent = originalText;
                    saveButton.disabled = false;
                    return;
                }
            }
        }
        
        const userProfileRef = doc(db, "UserProfile", currentUserData.enrollmentNumber);
        await setDoc(userProfileRef, profileData, { merge: true });
        
        console.log("✅ Profile saved to Firestore");
        
        currentUserData = { ...currentUserData, ...profileData };
        window.currentUserData = currentUserData;
        localStorage.setItem("currentUserProfile", JSON.stringify(currentUserData));
        
        // Fill form fields IMMEDIATELY after save
        fillFormFields(currentUserData);
        
        hideProfilePopup();
        
        saveButton.textContent = originalText;
        saveButton.disabled = false;
        
        alert("✅ Profile saved successfully!");
        
    } catch (error) {
        console.error("❌ Error saving profile:", error);
        alert("Failed to save profile:\n" + error.message);
        
        const saveButton = document.querySelector(".popbtn");
        if (saveButton) {
            saveButton.textContent = "Save Profile";
            saveButton.disabled = false;
        }
    }
}

/**
 * Update profile picture in StudentEligibility collection
 */
async function updateStudentEligibilityPhoto(photoUrl) {
    try {
        console.log("Updating profile picture in StudentEligibility...");
        
        const studentEligibilityRef = collection(db, "StudentEligibility");
        const q = query(studentEligibilityRef, where("uid", "==", currentUserData.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach(async (docSnapshot) => {
                const docRef = doc(db, "StudentEligibility", docSnapshot.id);
                await updateDoc(docRef, {
                    profilePicture: photoUrl,
                    lastUpdated: new Date().toISOString()
                });
                console.log("✅ Profile picture updated in StudentEligibility");
            });
        } else {
            const directDocRef = doc(db, "StudentEligibility", currentUserData.uid);
            await updateDoc(directDocRef, {
                profilePicture: photoUrl,
                lastUpdated: new Date().toISOString()
            });
            console.log("✅ Profile picture updated (direct method)");
        }
    } catch (error) {
        console.warn("⚠️ Could not update StudentEligibility photo:", error.message);
    }
}

/**
 * Fill popup form fields - ENHANCED
 */
function fillPopupFields(data) {
    console.log("📝 Filling popup fields with:", data);
    
    const fields = {
        'popup-name': data.name || "",
        'popup-email': data.email || "",
        'popup-mobile': data.mobile || "",
        'popup-enrollment': data.enrollmentNumber || "",
        'popup-branch': data.branch || "",
        'popup-department': data.department || "",
        'popup-semester': data.semester || "",
        'popup-year': data.year || ""
    };
    
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
            console.log(`   ✓ Set ${id} = "${value}"`);
        } else {
            console.warn(`   ⚠️ Element not found: ${id}`);
        }
    }
    
    // Set profile picture preview
    if (data.profilePicture) {
        const preview = document.getElementById("preview");
        if (preview) {
            preview.src = data.profilePicture;
            console.log("   ✓ Profile picture set");
        }
    }
}

/**
 * Fill main form fields - ENHANCED WITH LOGGING
 */
function fillFormFields(data) {
    console.log("📝 Filling main form fields with:", data);
    
    const fields = {
        'studentName': data.name || "",
        'enrollmentNumber': data.enrollmentNumber || "",
        'mobileNumber': data.mobile || "",
        'branch': data.branch || "",
        'department': data.department || "",
        'semester': data.semester || ""
    };
    
    let filledCount = 0;
    
    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
            console.log(`   ✓ Filled ${id} = "${value}"`);
            filledCount++;
        } else {
            console.error(`   ❌ ELEMENT NOT FOUND: ${id}`);
        }
    }
    
    console.log(`✅ Filled ${filledCount}/${Object.keys(fields).length} form fields`);
    
    // Verify the fields are actually filled
    setTimeout(() => {
        console.log("🔍 Verifying form fields after 100ms:");
        for (const [id, expectedValue] of Object.entries(fields)) {
            const element = document.getElementById(id);
            if (element) {
                const actualValue = element.value;
                if (actualValue === expectedValue) {
                    console.log(`   ✅ ${id}: "${actualValue}"`);
                } else {
                    console.error(`   ❌ ${id}: Expected "${expectedValue}", got "${actualValue}"`);
                }
            }
        }
    }, 100);
}

/**
 * Show profile popup
 */
function showProfilePopup() {
    console.log("📋 Showing profile popup");
    
    const popup = document.getElementById("popupOverlay");
    const blurBg = document.getElementById("blur_bg");
    
    if (popup) {
        popup.style.display = "flex";
        popup.classList.remove("hidden");
    }
    
    if (blurBg) {
        blurBg.style.filter = "blur(8px)";
    }
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
                if (!file.type.startsWith('image/')) {
                    alert("⚠️ Please select an image file!\n\nAllowed: JPG, PNG, GIF");
                    this.value = "";
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    alert("⚠️ Image file is too large!\n\nMaximum size: 5MB\nYour file: " + (file.size / 1024 / 1024).toFixed(2) + "MB");
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
 * Open edit profile popup
 */
window.editProfile = function() {
    console.log("✏️ Opening edit profile popup");
    fillPopupFields(currentUserData);
    showProfilePopup();
}

/**
 * Get current user data (for use in other modules)
 */
export function getCurrentUserData() {
    return currentUserData;
}

// Export functions
export { loadUserProfile, showProfilePopup, hideProfilePopup };

console.log("✅ Profile Manager module loaded");