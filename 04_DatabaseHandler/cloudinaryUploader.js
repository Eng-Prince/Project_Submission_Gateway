/**
 * Cloudinary File Uploader
 * Handles: Profile Pictures + Project PDFs
 */

// ========================================
// CONFIGURATION - UPDATE THESE!
// ========================================
const CLOUDINARY_CONFIG = {
    cloudName: 'du0lppvgf',       // Get from cloudinary.com dashboard
    uploadPreset: 'student_pdfs'  // Create "Unsigned" preset
};

// Example:
// cloudName: 'dxyz123abc',
// uploadPreset: 'student_uploads'

class CloudinaryUploader {
    constructor(config) {
        this.cloudName = config.cloudName;
        this.uploadPreset = config.uploadPreset;
        this.uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;
        
        console.log('☁️ Cloudinary Uploader initialized');
        if (this.cloudName === 'YOUR_CLOUD_NAME') {
            console.warn('⚠️ Please update CLOUDINARY_CONFIG with your credentials!');
        }
    }

    /**
     * Upload file to Cloudinary
     */
    async uploadFile(file, options = {}) {
        try {
            console.log('📤 Uploading:', file.name);
            
            // Validate
            const validation = this.validateFile(file, options.type);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Prepare form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', this.uploadPreset);
            
            if (options.folder) {
                formData.append('folder', options.folder);
            }
            
            if (options.publicId) {
                formData.append('public_id', options.publicId);
            }
            
            if (options.tags) {
                formData.append('tags', options.tags.join(','));
            }

            // Upload
            const response = await fetch(this.uploadUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Upload failed');
            }

            const result = await response.json();
            console.log('✅ Upload successful!');
            
            return {
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                bytes: result.bytes,
                pages: result.pages || null,
                thumbnailUrl: this.getThumbnailUrl(result.public_id),
                downloadUrl: this.getDownloadUrl(result.secure_url)
            };

        } catch (error) {
            console.error('❌ Upload failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate file
     */
    validateFile(file, type = 'any') {
        if (!file) {
            return { valid: false, error: 'No file selected' };
        }

        if (type === 'image') {
            if (!file.type.startsWith('image/')) {
                return { valid: false, error: 'Only image files allowed' };
            }
            if (file.size > 5 * 1024 * 1024) {
                return { valid: false, error: 'Image too large (max 5MB)' };
            }
        } 
        else if (type === 'pdf') {
            if (file.type !== 'application/pdf') {
                return { valid: false, error: 'Only PDF files allowed' };
            }
            if (file.size > 10 * 1024 * 1024) {
                return { valid: false, error: 'PDF too large (max 10MB)' };
            }
        }
        else {
            if (file.size > 10 * 1024 * 1024) {
                return { valid: false, error: 'File too large (max 10MB)' };
            }
        }

        return { valid: true };
    }

    /**
     * Get thumbnail URL
     */
    getThumbnailUrl(publicId) {
        return `https://res.cloudinary.com/${this.cloudName}/image/upload/w_200,h_200,c_fill/${publicId}.jpg`;
    }

    /**
     * Get download URL
     */
    getDownloadUrl(url) {
        return url.replace('/upload/', '/upload/fl_attachment/');
    }
}

// Create instance
const cloudinaryUploader = new CloudinaryUploader(CLOUDINARY_CONFIG);

/**
 * Upload Profile Picture
 */
export async function uploadProfilePicture(imageFile, enrollmentNumber) {
    console.log('📸 Uploading profile picture...');
    
    const result = await cloudinaryUploader.uploadFile(imageFile, {
        type: 'image',
        folder: 'profile-pictures',
        publicId: `profile_${enrollmentNumber}_${Date.now()}`,
        tags: [enrollmentNumber, 'profile-picture']
    });
    
    if (result.success) {
        console.log('✅ Profile picture uploaded!');
        return {
            success: true,
            profilePictureUrl: result.url,
            thumbnailUrl: result.thumbnailUrl,
            uploadedAt: new Date().toISOString()
        };
    } else {
        throw new Error(result.error);
    }
}

/**
 * Upload Project PDF
 */
export async function uploadProjectPDF(pdfFile, enrollmentNumber, projectTitle) {
    console.log('📄 Uploading project PDF...');
    
    const sanitizedTitle = projectTitle
        .replace(/[^a-z0-9]/gi, '_')
        .substring(0, 50)
        .toLowerCase();
    
    const result = await cloudinaryUploader.uploadFile(pdfFile, {
        type: 'pdf',
        folder: `project-reports/${enrollmentNumber}`,
        publicId: `${sanitizedTitle}_${Date.now()}`,
        tags: [enrollmentNumber, 'project-report']
    });
    
    if (result.success) {
        console.log('✅ PDF uploaded!');
        console.log('📄 Pages:', result.pages || 'Unknown');
        return {
            success: true,
            pdfUrl: result.url,
            pdfDownloadUrl: result.downloadUrl,
            pdfThumbnailUrl: result.thumbnailUrl,
            pdfSize: result.bytes,
            pdfPages: result.pages,
            uploadedAt: new Date().toISOString()
        };
    } else {
        throw new Error(result.error);
    }
}

// Export default
export default cloudinaryUploader;

// Make available globally
window.cloudinaryUploader = cloudinaryUploader;
window.uploadProfilePicture = uploadProfilePicture;
window.uploadProjectPDF = uploadProjectPDF;