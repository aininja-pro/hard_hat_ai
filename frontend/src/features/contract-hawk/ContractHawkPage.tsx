/**
 * Contract Hawk Page - Premium Industrial Design
 * Analyze contract PDFs for risks and liability issues
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContractHawkStream } from '../../hooks/useContractHawkStream'
import { FileUpload } from '../../components/FileUpload'
import { StreamingResponse } from '../../components/StreamingResponse'
import { ConfidenceBadge } from '../../components/ConfidenceBadge'
import { RiskTable } from '../../components/RiskTable'
import { ProgressIndicator } from '../../components/ProgressIndicator'
import { exportToExcel, exportToPDF, exportToClipboard } from '../../utils/exportRiskTable'
import { API_URL } from '../../utils/apiConfig'
import { ChevronLeft, Copy, FileSpreadsheet, FileText } from 'lucide-react'

export default function ContractHawkPage() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const {
    summary,
    risks,
    overallRiskLevel,
    confidence,
    isLoading,
    error,
    progressMessage,
    streamFormDataResponse,
    reset,
  } = useContractHawkStream()

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    reset() // Reset previous analysis when new file is selected
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert('Please upload a PDF document first')
      return
    }

    // Create FormData
    const formData = new FormData()
    formData.append('file', selectedFile)

    // Use the FormData streaming hook
    await streamFormDataResponse(`${API_URL}/api/contract-hawk/analyze`, formData)
  }

  const handleExportExcel = () => {
    if (risks.length === 0) {
      alert('No risks to export')
      return
    }
    const filename = selectedFile
      ? `${selectedFile.name.replace('.pdf', '')}-risks.xlsx`
      : 'contract-risks.xlsx'
    exportToExcel(risks, summary, filename)
  }

  const handleExportPDF = () => {
    if (risks.length === 0) {
      alert('No risks to export')
      return
    }
    const filename = selectedFile
      ? `${selectedFile.name.replace('.pdf', '')}-risks.pdf`
      : 'contract-risks.pdf'
    exportToPDF(risks, summary, filename)
  }

  const handleExportClipboard = async () => {
    if (risks.length === 0) {
      alert('No risks to export')
      return
    }
    const success = await exportToClipboard(risks, summary)
    if (success) {
      alert('Copied to clipboard!')
    } else {
      alert('Failed to copy. Please try again.')
    }
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
                Contract Hawk
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
              Upload Contract for Risk Analysis
            </h2>
            <p className="text-sm text-[#999999] mb-4">
              Upload a contract PDF to identify potential risks, liability issues, and problematic clauses.
            </p>
            <div className="mb-4">
              <FileUpload
                fileType="pdf"
                onFileSelect={handleFileSelect}
                label="Upload Contract PDF"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !selectedFile}
              className="btn-primary btn-shine"
            >
              {isLoading ? 'Analyzing Contract...' : 'Analyze Contract'}
            </button>
          </div>

          {/* Output Section */}
          {(summary || risks.length > 0 || isLoading || error) && (
            <div className="card-premium p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white uppercase tracking-wide">
                      Risk Analysis Results
                    </h2>
                    {overallRiskLevel && (
                      <p className="text-sm text-[#999999] mt-1">
                        Overall Risk Level: <span className="font-semibold text-[#FF6B00]">{overallRiskLevel}</span>
                      </p>
                    )}
                  </div>
                  <ProgressIndicator
                    isLoading={isLoading}
                    message={progressMessage || (isLoading ? 'Analyzing contract...' : undefined)}
                    size="sm"
                  />
                </div>
                {risks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleExportClipboard}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copy</span>
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white text-sm font-medium shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-600/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 touch-manipulation"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span className="hidden sm:inline">Export Excel</span>
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg text-white text-sm font-medium shadow-lg shadow-red-600/20 hover:shadow-xl hover:shadow-red-600/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 touch-manipulation"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Export PDF</span>
                    </button>
                  </div>
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

              {/* Risk Table */}
              {risks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#999999] uppercase tracking-wider mb-4">
                    Identified Risks ({risks.length})
                  </h3>
                  <RiskTable risks={risks} />
                </div>
              )}

              {!isLoading && summary && risks.length === 0 && (
                <div className="text-center py-8 text-[#666666]">
                  No specific risks identified. Review the summary above.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
