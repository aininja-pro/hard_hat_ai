/**
 * Dual File Upload Component
 * Handles uploading two files side-by-side (for Submittal Scrubber)
 */

import { useState, useRef, useCallback } from 'react'
import { FileUpload, FileUploadProps } from './FileUpload'

export interface DualFileUploadProps {
  file1Label: string
  file2Label: string
  file1Type?: 'pdf' | 'image'
  file2Type?: 'pdf' | 'image'
  onFile1Select: (file: File) => void
  onFile2Select: (file: File) => void
  onFile1ValidationError?: (error: string) => void
  onFile2ValidationError?: (error: string) => void
  disabled?: boolean
}

export function DualFileUpload({
  file1Label,
  file2Label,
  file1Type = 'pdf',
  file2Type = 'pdf',
  onFile1Select,
  onFile2Select,
  onFile1ValidationError,
  onFile2ValidationError,
  disabled = false,
}: DualFileUploadProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <FileUpload
          fileType={file1Type}
          onFileSelect={onFile1Select}
          onValidationError={onFile1ValidationError}
          label={file1Label}
          disabled={disabled}
        />
      </div>
      <div>
        <FileUpload
          fileType={file2Type}
          onFileSelect={onFile2Select}
          onValidationError={onFile2ValidationError}
          label={file2Label}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

