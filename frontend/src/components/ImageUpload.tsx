/**
 * Image Upload Component
 * Handles image selection, validation, and preview
 */

import { useState, useRef, useCallback } from 'react'
import { validateImage, formatFileSize, validateFileName, ValidationResult } from '../utils/fileValidation'

export interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onValidationError?: (error: string) => void
  label?: string
  disabled?: boolean
  showPreview?: boolean
}

export function ImageUpload({
  onImageSelect,
  onValidationError,
  label = 'Upload Image',
  disabled = false,
  showPreview = true,
}: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileValidation = useCallback(
    (file: File) => {
      // Validate file name
      if (!validateFileName(file.name)) {
        const error = 'Invalid file name. File name contains invalid characters.'
        setValidationResult({ valid: false, error })
        onValidationError?.(error)
        return false
      }

      // Validate image
      const result = validateImage(file)
      setValidationResult(result)

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

      const file = files[0]
      
      // Validate file
      const isValid = handleFileValidation(file)
      if (!isValid) {
        setSelectedImage(null)
        setPreviewUrl(null)
        return
      }

      setSelectedImage(file)

      // Create preview URL
      if (showPreview) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      }

      // File is valid, call callback
      onImageSelect(file)
    },
    [handleFileValidation, onImageSelect, showPreview]
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

  const handleRemove = useCallback(() => {
    setSelectedImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setValidationResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrl])

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      <div
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {selectedImage && previewUrl ? (
          <div className="space-y-2">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedImage.name} • {formatFileSize(selectedImage.size)}
            </div>
            {validationResult?.valid && (
              <div className="text-xs text-green-600 dark:text-green-400">✓ Image validated</div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-400">Click to select or drag and drop</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Image up to 10 MB (JPEG, PNG, GIF, WebP)
            </p>
          </div>
        )}
      </div>

      {/* Validation Error */}
      {validationResult && !validationResult.valid && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
          {validationResult.error}
        </div>
      )}
    </div>
  )
}

