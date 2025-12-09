/**
 * Contract Hawk Page
 * Analyze contract PDFs for risks and liability issues
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContractHawkStream } from '../../hooks/useContractHawkStream'
import { FileUpload } from '../../components/FileUpload'
import { StreamingResponse } from '../../components/StreamingResponse'
import { ConfidenceBadge } from '../../components/ConfidenceBadge'
import { RiskTable } from '../../components/RiskTable'
import { exportToExcel, exportToPDF, exportToClipboard } from '../../utils/exportRiskTable'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Upload Contract for Risk Analysis
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Analyzing Contract...' : 'Analyze Contract'}
            </button>
          </div>

          {/* Output Section */}
          {(summary || risks.length > 0 || isLoading || error) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Risk Analysis Results
                  </h2>
                  {overallRiskLevel && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Overall Risk Level: <span className="font-semibold">{overallRiskLevel}</span>
                    </p>
                  )}
                </div>
                {risks.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportClipboard}
                      className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Export Excel
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Export PDF
                    </button>
                  </div>
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

              {/* Risk Table */}
              {risks.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    Identified Risks ({risks.length})
                  </h3>
                  <RiskTable risks={risks} />
                </div>
              )}

              {!isLoading && summary && risks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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

