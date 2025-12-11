/**
 * Submittal Scrubber Page - Premium Industrial Design
 * Compare specification documents with product data for compliance
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubmittalScrubberStream } from '../../hooks/useSubmittalScrubberStream'
import { DualFileUpload } from '../../components/DualFileUpload'
import { StreamingResponse } from '../../components/StreamingResponse'
import { ConfidenceBadge } from '../../components/ConfidenceBadge'
import { ComplianceTable } from '../../components/ComplianceTable'
import { ProgressIndicator } from '../../components/ProgressIndicator'
import { exportToExcel } from '../../utils/exportComplianceTable'
import { API_URL } from '../../utils/apiConfig'
import { ChevronLeft, FileSpreadsheet } from 'lucide-react'

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
    <div className="min-h-screen bg-[#111111]">
      {/* Header - Premium Industrial */}
      <header className="page-header">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#FF6B0008,transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {/* Premium back button */}
              <button
                onClick={() => navigate('/dashboard')}
                className="group btn-back"
                aria-label="Back to dashboard"
              >
                <ChevronLeft className="w-4 h-4 text-[#666666] group-hover:text-[#FF6B00] group-hover:-translate-x-1 transition-all" />
                <span className="text-[#999999] text-sm font-medium group-hover:text-white hidden sm:inline">
                  Back
                </span>
              </button>

              {/* Page title with gradient */}
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide uppercase text-gradient-white truncate">
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
          <div className="card-premium p-6">
            <h2 className="text-lg font-semibold mb-4 text-white uppercase tracking-wide">
              Upload Documents for Compliance Comparison
            </h2>
            <p className="text-sm text-[#999999] mb-4">
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
              <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider mb-2">
                Model Number <span className="text-[#666666] normal-case">(optional)</span>
              </label>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g., Model XYZ-1234 (if product data has multiple models)"
                className="input-premium"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-[#666666]">
                Specify a model number if the product data contains multiple models in tables
              </p>
            </div>
            <button
              onClick={handleCompare}
              disabled={isLoading || !specFile || !productFile}
              className="btn-primary btn-shine mt-4"
            >
              {isLoading ? 'Comparing Documents...' : 'Compare Documents'}
            </button>
          </div>

          {/* Output Section */}
          {(summary || complianceItems.length > 0 || isLoading || error) && (
            <div className="card-premium p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white uppercase tracking-wide">
                    Compliance Analysis Results
                  </h2>
                  <ProgressIndicator
                    isLoading={isLoading}
                    message={isLoading ? 'Comparing documents...' : undefined}
                    size="sm"
                  />
                </div>
                {complianceItems.length > 0 && (
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white text-sm font-medium shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-600/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 touch-manipulation"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="hidden sm:inline">Export Excel</span>
                  </button>
                )}
              </div>

              {error && (
                <div className="alert-error mb-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Summary */}
              {summary && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#999999] uppercase tracking-wider mb-3">
                    Summary
                  </h3>
                  <StreamingResponse text={summary} isLoading={isLoading} />
                </div>
              )}

              {/* Compliance Table */}
              {complianceItems.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#999999] uppercase tracking-wider mb-4">
                    Compliance Items ({complianceItems.length})
                  </h3>
                  <ComplianceTable items={complianceItems} />
                </div>
              )}

              {!isLoading && summary && complianceItems.length === 0 && (
                <div className="text-center py-8 text-[#666666]">
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
