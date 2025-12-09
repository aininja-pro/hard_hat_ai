/**
 * File Validation Utilities
 * Client-side validation for PDFs and images before upload
 */

export interface ValidationResult {
  valid: boolean
  error?: string
  pageCount?: number
}

const MAX_PDF_SIZE = 25 * 1024 * 1024 // 25 MB
const MAX_PDF_PAGES = 100
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB

const ALLOWED_PDF_TYPES = ['application/pdf']
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

/**
 * Validate PDF file size and page count
 */
export async function validatePDF(file: File): Promise<ValidationResult> {
  // Check file type
  if (!ALLOWED_PDF_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File must be a PDF',
    }
  }

  // Check file size
  if (file.size > MAX_PDF_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `PDF is too large (${sizeMB} MB). Maximum size is 25 MB.`,
    }
  }

  // Count pages using PDF.js
  try {
    const pageCount = await countPDFPages(file)
    if (pageCount > MAX_PDF_PAGES) {
      return {
        valid: false,
        error: `PDF has too many pages (${pageCount}). Maximum is 100 pages.`,
        pageCount,
      }
    }

    return {
      valid: true,
      pageCount,
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Unable to read PDF. File may be corrupted.',
    }
  }
}

/**
 * Count pages in a PDF file using PDF.js
 */
async function countPDFPages(file: File): Promise<number> {
  // Dynamically import PDF.js to avoid loading it if not needed
  const pdfjsLib = await import('pdfjs-dist')
  
  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  
  return pdf.numPages
}

/**
 * Validate image file size
 */
export function validateImage(file: File): ValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Allowed types: JPEG, PNG, GIF, WebP`,
    }
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `Image is too large (${sizeMB} MB). Maximum size is 10 MB.`,
    }
  }

  return {
    valid: true,
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate file name for security (prevent path traversal)
 */
export function validateFileName(fileName: string): boolean {
  // Check for path traversal attempts
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return false
  }
  
  // Check for null bytes
  if (fileName.includes('\0')) {
    return false
  }
  
  return true
}

