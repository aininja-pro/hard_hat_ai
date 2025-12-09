/**
 * File Upload Component
 * Handles file selection, validation, and upload with progress tracking
 */

import { useState, useRef, useCallback } from 'react'
import { validatePDF, validateImage, formatFileSize, validateFileName, ValidationResult } from '../utils/fileValidation'

export interface FileUploadProps {
  accept?: string
  maxSize?: number
  onFileSelect: (file: File) => void
  onValidationError?: (error: string) => void
  label?: string
  multiple?: boolean
  fileType?: 'pdf' | 'image'
  disabled?: boolean
}

export function FileUpload({
  accept,
  maxSize,
  onFileSelect,
  onValidationError,
  label = 'Select File',
  multiple = false,
  fileType = 'pdf',
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleFileValidation = useCallback(
    async (file: File) => {
      // Validate file name
      if (!validateFileName(file.name)) {
        const error = 'Invalid file name. File name contains invalid characters.'
        setValidationResult({ valid: false, error })
        onValidationError?.(error)
        return false
      }

      // Validate based on file type
      let result: ValidationResult
      if (fileType === 'pdf') {
        result = await validatePDF(file)
      } else {
        result = validateImage(file)
      }

      setValidationResult(result)

      if (!result.valid) {
        onValidationError?.(result.error || 'File validation failed')
        return false
      }

      return true
    },
    [fileType, onValidationError]
  )

  const handleFileChange = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0] // Handle single file for now
      setSelectedFile(file)

      // Validate file
      const isValid = await handleFileValidation(file)
      if (!isValid) {
        setSelectedFile(null)
        return
      }

      // File is valid, call callback
      onFileSelect(file)
    },
    [handleFileValidation, onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const files = e.dataTransfer.files
      await handleFileChange(files)
    },
    [disabled, handleFileChange]
  )

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await handleFileChange(e.target.files)
    },
    [handleFileChange]
  )

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  const handleRemove = useCallback(() => {
    setSelectedFile(null)
    setValidationResult(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    abortControllerRef.current?.abort()
  }, [])

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
        accept={accept || (fileType === 'pdf' ? 'application/pdf' : 'image/*')}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {selectedFile ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📄</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(selectedFile.size)}
                    {validationResult?.pageCount && ` • ${validationResult.pageCount} pages`}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
            {validationResult?.valid && (
              <div className="text-xs text-green-600 dark:text-green-400">✓ File validated</div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              {isDragging ? 'Drop file here' : 'Click to select or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {fileType === 'pdf'
                ? 'PDF up to 25 MB, max 100 pages'
                : 'Image up to 10 MB (JPEG, PNG, GIF, WebP)'}
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

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

