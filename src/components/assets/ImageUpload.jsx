'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Image Upload Component
 * Drag & drop + click to upload with preview
 * Dark theme compatible with animations
 */
export function ImageUpload({ value, onChange, onRemove, className }) {
    const [isDragging, setIsDragging] = useState(false)
    const [preview, setPreview] = useState(value || null)
    const fileInputRef = useRef(null)

    const handleFile = async (file) => {
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (PNG, JPG, WEBP)')
            return
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB')
            return
        }

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setPreview(e.target.result)
        }
        reader.readAsDataURL(file)

        // Pass file to parent
        if (onChange) {
            onChange(file)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files && files[0]) {
            handleFile(files[0])
        }
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileInput = (e) => {
        const files = e.target.files
        if (files && files[0]) {
            handleFile(files[0])
        }
    }

    const handleRemove = () => {
        setPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
        if (onRemove) {
            onRemove()
        }
    }

    return (
        <div className={cn('relative', className)}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileInput}
                className="hidden"
            />

            <AnimatePresence mode="wait">
                {preview ? (
                    // Preview Mode
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative group"
                    >
                        <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-border bg-card">
                            {/* Dark overlay for better contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20 z-10" />

                            {/* Image */}
                            <motion.img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5 }}
                            />

                            {/* Remove button */}
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleRemove}
                            >
                                <X className="w-4 h-4" />
                            </Button>

                            {/* Hover glow effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/20 animate-pulse" />
                            </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Click the X to change image</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClick}
                                className="h-6 text-xs"
                            >
                                Change
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    // Upload Mode
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleClick}
                        className={cn(
                            'relative aspect-video rounded-xl border-2 border-dashed cursor-pointer transition-all',
                            'hover:border-primary hover:bg-primary/5',
                            'flex flex-col items-center justify-center gap-3',
                            isDragging ? 'border-primary bg-primary/10 scale-105' : 'border-border'
                        )}
                    >
                        <motion.div
                            animate={{ y: isDragging ? -5 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                {isDragging ? (
                                    <Upload className="w-6 h-6 text-primary" />
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                )}
                            </div>

                            <div className="text-center">
                                <p className="text-sm font-medium">
                                    {isDragging ? 'Drop image here' : 'Upload image'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Drag & drop or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    PNG, JPG, WEBP (max 5MB)
                                </p>
                            </div>
                        </motion.div>

                        {/* Animated border glow on drag */}
                        <AnimatePresence>
                            {isDragging && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 rounded-xl pointer-events-none"
                                >
                                    <div className="absolute inset-0 rounded-xl border-2 border-primary animate-pulse" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
