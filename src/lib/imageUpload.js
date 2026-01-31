/**
 * Image Upload Utility for Supabase Storage
 * Handles image compression, upload, and URL generation
 */

import { supabase } from './supabase'

// Configuration
const BUCKET_NAME = 'asset-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const TARGET_MAX_SIZE = 500 * 1024 // 500KB target after compression

/**
 * Compress image before upload
 * @param {File} file - Original image file
 * @param {number} maxSizeKB - Target max size in KB
 * @returns {Promise<Blob>} Compressed image blob
 */
export async function compressImage(file, maxSizeKB = 500) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                // Calculate new dimensions (max 1200px width)
                const maxWidth = 1200
                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)

                // Start with quality 0.8 and reduce if needed
                let quality = 0.8

                canvas.toBlob(
                    (blob) => {
                        if (blob.size <= maxSizeKB * 1024 || quality <= 0.5) {
                            resolve(blob)
                        } else {
                            // Try again with lower quality
                            quality -= 0.1
                            canvas.toBlob((b) => resolve(b), 'image/webp', quality)
                        }
                    },
                    'image/webp',
                    quality
                )
            }

            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = e.target.result
        }

        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateImageFile(file) {
    if (!file) {
        return { valid: false, error: 'No file provided' }
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return { valid: false, error: 'Invalid file type. Only PNG, JPG, and WEBP are allowed.' }
    }

    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` }
    }

    return { valid: true }
}

/**
 * Upload image to Supabase Storage
 * @param {File} file - Image file
 * @param {string} assetId - Asset ID for file naming
 * @returns {Promise<Object>} { success: boolean, url: string, error: string }
 */
export async function uploadAssetImage(file, assetId) {
    try {
        // Validate file
        const validation = validateImageFile(file)
        if (!validation.valid) {
            return { success: false, error: validation.error }
        }

        // Compress image
        const compressedBlob = await compressImage(file, 500)

        // Generate file name
        const fileExt = 'webp'
        const fileName = `${assetId}.${fileExt}`
        const filePath = `assets/${fileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, compressedBlob, {
                cacheControl: '3600',
                upsert: true,
                contentType: 'image/webp'
            })

        if (error) {
            throw error
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath)

        return {
            success: true,
            url: urlData.publicUrl,
            path: filePath
        }
    } catch (error) {
        console.error('Error uploading image:', error)
        return {
            success: false,
            error: error.message || 'Failed to upload image'
        }
    }
}

/**
 * Delete image from Supabase Storage
 * @param {string} filePath - Path to file in storage (e.g., 'assets/uuid.webp')
 * @returns {Promise<boolean>} Success status
 */
export async function deleteAssetImage(filePath) {
    try {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath])

        if (error) throw error
        return true
    } catch (error) {
        console.error('Error deleting image:', error)
        return false
    }
}

/**
 * Create a preview URL for an image file (before upload)
 * @param {File} file - Image file
 * @returns {Promise<string>} Preview URL
 */
export function createImagePreview(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = () => reject(new Error('Failed to create preview'))
        reader.readAsDataURL(file)
    })
}

/**
 * Initialize Supabase Storage bucket (run once)
 * Creates the asset-images bucket if it doesn't exist
 */
export async function initializeStorageBucket() {
    try {
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets()

        if (listError) throw listError

        const bucketExists = buckets.some(b => b.name === BUCKET_NAME)

        if (!bucketExists) {
            // Create bucket
            const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
                public: true,
                fileSizeLimit: MAX_FILE_SIZE
            })

            if (createError) throw createError
            console.log('Storage bucket created successfully')
        }

        return true
    } catch (error) {
        console.error('Error initializing storage bucket:', error)
        return false
    }
}
