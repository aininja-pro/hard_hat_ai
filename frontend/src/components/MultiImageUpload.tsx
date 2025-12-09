/**
 * Multi Image Upload Component
 * Handles uploading multiple images with previews
 */

import { useState, useRef, useCallback } from 'react'
import { validateImage, formatFileSize, validateFileName, ValidationResult } from '../utils/fileValidation'

export interface MultiImageUploadProps {
  onImagesSelect: (files: File[]) => void
  onValidationError?: (error: string) => void
  label?: string
  disabled?: boolean
  maxImages?: number
}

export function MultiImageUpload({
  onImagesSelect,
  onValidationError,
  label = 'Upload Images',
  disabled = false,
  maxImages = 5,
}: MultiImageUploadProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<Map<number, string>>(new Map())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileValidation = useCallback(
    (file: File) => {
      // Validate file name
      if (!validateFileName(file.name)) {
        const error = 'Invalid file name. File name contains invalid characters.'
        onValidationError?.(error)
        return false
      }

      // Validate image
      const result = validateImage(file)
      if (!result.valid) {
        onValidationError?.(result.error || 'Image validation failed')
        return false
      }

      return true
    },
    [onValidationError]
  )

  const handleFileChange = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const newFiles: File[] = []
      const newPreviews = new Map(previewUrls)

      for (let i = 0; i < files.length && selectedImages.length + newFiles.length < maxImages; i++) {
        const file = files[i]
        
        // Validate file
        const isValid = handleFileValidation(file)
        if (!isValid) {
          continue
        }

        newFiles.push(file)

        // Create preview URL
        const url = URL.createObjectURL(file)
        const index = selectedImages.length + newFiles.length - 1
        newPreviews.set(index, url)
      }

      const updatedFiles = [...selectedImages, ...newFiles]
      setSelectedImages(updatedFiles)
      setPreviewUrls(newPreviews)

      // Call callback with all files
      onImagesSelect(updatedFiles)
    },
    [selectedImages, previewUrls, maxImages, handleFileValidation, onImagesSelect]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileChange(e.target.files)
    },
    [handleFileChange]
  )

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  const handleRemove = useCallback(
    (index: number) => {
      const updatedFiles = selectedImages.filter((_, i) => i !== index)
      setSelectedImages(updatedFiles)

      // Revoke preview URL
      const previewUrl = previewUrls.get(index)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }

      // Rebuild preview map
      const newPreviews = new Map()
      updatedFiles.forEach((file, i) => {
        const url = URL.createObjectURL(file)
        newPreviews.set(i, url)
      })
      setPreviewUrls(newPreviews)

      // Update callback
      onImagesSelect(updatedFiles)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [selectedImages, previewUrls, onImagesSelect]
  )

  const handleRemoveAll = useCallback(() => {
    // Revoke all preview URLs
    previewUrls.forEach((url) => {
      URL.revokeObjectURL(url)
    })
    setSelectedImages([])
    setPreviewUrls(new Map())
    onImagesSelect([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrls, onImagesSelect])

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          {selectedImages.length > 0 && (
            <button
              onClick={handleRemoveAll}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              Remove All
            </button>
          )}
        </div>
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || selectedImages.length >= maxImages}
      />

      {/* Upload Area */}
      {selectedImages.length < maxImages && (
        <div
          onClick={handleClick}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <p className="text-gray-600 dark:text-gray-400">Click to select or drag and drop</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Up to {maxImages} images, {maxImages - selectedImages.length} remaining
          </p>
        </div>
      )}

      {/* Image Previews */}
      {selectedImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {selectedImages.map((image, index) => {
            const previewUrl = previewUrls.get(index)
            return (
              <div key={index} className="relative group">
                <img
                  src={previewUrl}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove image ${index + 1}`}
                >
                  ✕
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                  {image.name}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

