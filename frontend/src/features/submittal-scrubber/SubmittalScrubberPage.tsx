/**
 * Submittal Scrubber Page
 * Compare specification documents with product data for compliance
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubmittalScrubberStream } from '../../hooks/useSubmittalScrubberStream'
import { DualFileUpload } from '../../components/DualFileUpload'
import { StreamingResponse } from '../../components/StreamingResponse'
import { ConfidenceBadge } from '../../components/ConfidenceBadge'
import { ComplianceTable } from '../../components/ComplianceTable'
import { exportToExcel } from '../../utils/exportComplianceTable'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function SubmittalScrubberPage() {
  const navigate = useNavigate()
  const [specFile, setSpecFile] = useState<File | null>(null)
  const [productFile, setProductFile] = useState<File | null>(null)
  const [modelNumber, setModelNumber] = useState('')
  const {
    summary,
    complianceItems,
    confidence,
    isLoading,
    error,
    streamFormDataResponse,
    reset,
  } = useSubmittalScrubberStream()

  const handleSpecFileSelect = (file: File) => {
    setSpecFile(file)
    reset() // Reset previous analysis when new file is selected
  }

  const handleProductFileSelect = (file: File) => {
    setProductFile(file)
    reset() // Reset previous analysis when new file is selected
  }

  const handleCompare = async () => {
    if (!specFile) {
      alert('Please upload a specification document first')
      return
    }

    if (!productFile) {
      alert('Please upload a product data document first')
      return
    }

    // Create FormData with both files
    const formData = new FormData()
    formData.append('spec_file', specFile)
    formData.append('product_file', productFile)
    if (modelNumber.trim()) {
      formData.append('model_number', modelNumber.trim())
    }

    // Use the FormData streaming hook
    await streamFormDataResponse(`${API_URL}/api/submittal-scrubber/compare`, formData)
  }

  const handleExportExcel = () => {
    if (complianceItems.length === 0) {
      alert('No compliance data to export')
      return
    }
    const filename = specFile && productFile
      ? `${specFile.name.replace('.pdf', '')}-vs-${productFile.name.replace('.pdf', '')}-compliance.xlsx`
      : 'submittal-compliance.xlsx'
    exportToExcel(complianceItems, summary, filename)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Submittal Scrubber
              </h1>
            </div>
            {confidence && <ConfidenceBadge confidence={confidence} />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Upload Documents for Compliance Comparison
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upload a specification document and product data document to check compliance.
            </p>
            <DualFileUpload
              file1Label="Specification Document"
              file2Label="Product Data Document"
              file1Type="pdf"
              file2Type="pdf"
              onFile1Select={handleSpecFileSelect}
              onFile2Select={handleProductFileSelect}
              disabled={isLoading}
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model Number (Optional)
              </label>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g., Model XYZ-1234 (if product data has multiple models)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Specify a model number if the product data contains multiple models in tables
              </p>
            </div>
            <button
              onClick={handleCompare}
              disabled={isLoading || !specFile || !productFile}
              className="w-full mt-4 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Comparing Documents...' : 'Compare Documents'}
            </button>
          </div>

          {/* Output Section */}
          {(summary || complianceItems.length > 0 || isLoading || error) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Compliance Analysis Results
                </h2>
                {complianceItems.length > 0 && (
                  <button
                    onClick={handleExportExcel}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Export Excel
                  </button>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 mb-4">
                  {error}
                </div>
              )}

              {/* Summary */}
              {summary && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                    Summary
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <StreamingResponse text={summary} isLoading={isLoading} />
                  </div>
                </div>
              )}

              {/* Compliance Table */}
              {complianceItems.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    Compliance Items ({complianceItems.length})
                  </h3>
                  <ComplianceTable items={complianceItems} />
                </div>
              )}

              {!isLoading && summary && complianceItems.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No compliance items found. Review the summary above.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

