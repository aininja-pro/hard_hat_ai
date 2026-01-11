/**
 * File Processing Test Page
 * For testing Phase 3 file processing infrastructure
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from '../components/FileUpload'
import { API_URL } from '../utils/apiConfig'

export default function FileTestPage() {
  const navigate = useNavigate()
  const [pdfResult, setPdfResult] = useState<any>(null)
  const [imageResult, setImageResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePDFSelect = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    setPdfResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/api/test/file/upload-pdf`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const result = await response.json()
      setPdfResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImageSelect = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    setImageResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/api/test/file/upload-image`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const result = await response.json()
      setImageResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                File Processing Test (Phase 3)
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* PDF Test */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              PDF Upload Test
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Test PDF validation, text extraction, and processing. Max 25 MB, 100 pages.
            </p>
            <FileUpload
              fileType="pdf"
              onFileSelect={handlePDFSelect}
              onValidationError={(err) => setError(err)}
              disabled={isProcessing}
            />
            {pdfResult && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  ✓ PDF Processed Successfully
                </h3>
                <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <p>Pages: {pdfResult.extraction?.total_pages}</p>
                  <p>File Size: {pdfResult.pdf_validation?.file_size} bytes</p>
                  {pdfResult.extraction?.text_preview && (
                    <div className="mt-2">
                      <p className="font-medium">Text Preview (first 500 chars):</p>
                      <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded mt-1 overflow-auto">
                        {pdfResult.extraction.text_preview}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Image Test */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Image Upload Test
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Test image validation. Max 10 MB. Formats: JPEG, PNG, GIF, WebP.
            </p>
            <FileUpload
              fileType="image"
              onFileSelect={handleImageSelect}
              onValidationError={(err) => setError(err)}
              disabled={isProcessing}
            />
            {imageResult && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  ✓ Image Validated Successfully
                </h3>
                <div className="text-sm text-green-700 dark:text-green-300">
                  <p>File Size: {imageResult.file_size_mb} MB</p>
                  <p>Filename: {imageResult.validation?.filename}</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              What's Being Tested:
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Client-side file validation (size, type, page count)</li>
              <li>Server-side file validation</li>
              <li>PDF text extraction</li>
              <li>PDF metadata extraction</li>
              <li>Automatic file cleanup (zero data retention)</li>
              <li>Error handling</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

