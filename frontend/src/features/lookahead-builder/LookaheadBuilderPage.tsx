/**
 * Lookahead Builder Page - Premium Industrial Design
 * Generate 2-week construction schedules from photos or text input
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLookaheadBuilderStream } from '../../hooks/useLookaheadBuilderStream'
import { MultiImageUpload } from '../../components/MultiImageUpload'
import { StreamingResponse } from '../../components/StreamingResponse'
import { ConfidenceBadge } from '../../components/ConfidenceBadge'
import { ScheduleTable } from '../../components/ScheduleTable'
import { ProgressIndicator } from '../../components/ProgressIndicator'
import { exportToExcel, exportToClipboard } from '../../utils/exportSchedule'
import { API_URL } from '../../utils/apiConfig'
import { ChevronLeft, Copy, FileSpreadsheet } from 'lucide-react'

export default function LookaheadBuilderPage() {
  const navigate = useNavigate()
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [userGoal, setUserGoal] = useState('')
  const [tradeScope, setTradeScope] = useState('')
  const [constraints, setConstraints] = useState('')
  const {
    summary,
    scheduleData,
    confidence,
    isLoading,
    error,
    streamFormDataResponse,
    reset,
  } = useLookaheadBuilderStream()

  const handleImagesSelect = (files: File[]) => {
    setSelectedImages(files)
    reset() // Reset previous schedule when new images are selected
  }

  const handleGenerate = async () => {
    if (selectedImages.length === 0) {
      alert('Please upload at least one photo')
      return
    }

    if (!userGoal.trim()) {
      alert('Please describe what you are trying to accomplish')
      return
    }

    // Create FormData
    const formData = new FormData()

    // Append all images
    selectedImages.forEach((image) => {
      formData.append('image_files', image)
    })

    // Append required user goal
    formData.append('user_goal', userGoal.trim())

    if (tradeScope.trim()) {
      formData.append('trade_scope', tradeScope.trim())
    }

    if (constraints.trim()) {
      formData.append('constraints', constraints.trim())
    }

    // Use the FormData streaming hook
    await streamFormDataResponse(`${API_URL}/api/lookahead-builder/generate`, formData)
  }

  const handleExportExcel = () => {
    if (!scheduleData || scheduleData.schedule.length === 0) {
      alert('No schedule to export')
      return
    }
    const filename = selectedImages.length > 0
      ? `${selectedImages[0].name.replace(/\.[^/.]+$/, '')}-schedule.xlsx`
      : 'lookahead-schedule.xlsx'
    exportToExcel(scheduleData, filename)
  }

  const handleExportClipboard = async () => {
    if (!scheduleData || scheduleData.schedule.length === 0) {
      alert('No schedule to export')
      return
    }
    const success = await exportToClipboard(scheduleData)
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
                Lookahead Builder
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
              Upload Photos & Describe Your Goal
            </h2>
            <p className="text-sm text-[#999999] mb-4">
              Upload construction site photos and describe what you're trying to accomplish to generate a 2-week lookahead schedule.
            </p>

            {/* User Goal - Required */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider mb-2">
                What are you trying to accomplish? <span className="text-[#FF6B00]">*</span>
              </label>
              <textarea
                value={userGoal}
                onChange={(e) => setUserGoal(e.target.value)}
                placeholder="Describe your goal... (e.g., 'Complete rough-in for this bathroom and get it ready for drywall', 'Finish all electrical work in this office suite', 'Get this space ready for final inspection')"
                className="textarea-premium h-24"
                disabled={isLoading}
                required
              />
              <p className="mt-1 text-xs text-[#666666]">
                This helps the AI understand your specific goal and generate a more accurate schedule
              </p>
            </div>

            {/* Multi Image Upload */}
            <div className="mb-4">
              <MultiImageUpload
                onImagesSelect={handleImagesSelect}
                label="Upload Construction Site Photos (Required)"
                disabled={isLoading}
                maxImages={5}
              />
              <p className="mt-1 text-xs text-[#666666]">
                Upload multiple photos from different angles for better analysis
              </p>
            </div>

            {/* Additional Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider mb-2">
                  Trade/Scope <span className="text-[#666666] normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={tradeScope}
                  onChange={(e) => setTradeScope(e.target.value)}
                  placeholder="e.g., 'all trades', 'electrical only'"
                  className="input-premium"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider mb-2">
                  Constraints <span className="text-[#666666] normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g., 'Inspection Thursday', 'Materials arrive Monday'"
                  className="input-premium"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || selectedImages.length === 0 || !userGoal.trim()}
              className="btn-primary btn-shine"
            >
              {isLoading ? 'Generating Schedule...' : 'Generate Schedule'}
            </button>
          </div>

          {/* Output Section */}
          {(summary || scheduleData || isLoading || error) && (
            <div className="card-premium p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white uppercase tracking-wide">
                    Schedule Results
                  </h2>
                  <ProgressIndicator
                    isLoading={isLoading}
                    message={isLoading ? 'Analyzing images and generating schedule...' : undefined}
                    size="sm"
                  />
                </div>
                {scheduleData && scheduleData.schedule.length > 0 && (
                  <div className="flex gap-2">
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
                  </div>
                )}
              </div>

              {error && (
                <div className="alert-error mb-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Image Analysis */}
              {scheduleData?.image_analysis && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl">
                  <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
                    Image Analysis
                  </h3>
                  <div className="text-sm text-[#E5E5E5] space-y-1">
                    <p><span className="text-[#999999]">Space Type:</span> {scheduleData.image_analysis.space_type}</p>
                    <p><span className="text-[#999999]">Dimensions:</span> {scheduleData.image_analysis.estimated_dimensions}</p>
                    <p><span className="text-[#999999]">Current Phase:</span> {scheduleData.image_analysis.current_phase}</p>
                    <p><span className="text-[#999999]">Trades:</span> {scheduleData.image_analysis.trades_identified.join(', ')}</p>
                  </div>
                </div>
              )}

              {/* Summary/Streaming - Only show if we don't have structured data yet */}
              {summary && !scheduleData && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#999999] uppercase tracking-wider mb-3">
                    Analysis
                  </h3>
                  <StreamingResponse text={summary} isLoading={isLoading} />
                </div>
              )}

              {/* Schedule Table */}
              {scheduleData && scheduleData.schedule.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#999999] uppercase tracking-wider mb-4">
                    2-Week Schedule ({scheduleData.schedule.length} items)
                  </h3>
                  <ScheduleTable items={scheduleData.schedule} />
                </div>
              )}

              {/* Assumptions & Warnings */}
              {scheduleData && (
                <div className="space-y-4">
                  {scheduleData.assumptions.length > 0 && (
                    <div className="alert-warning">
                      <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-2">
                        Assumptions Made
                      </h3>
                      <ul className="text-sm text-yellow-300/80 list-disc list-inside space-y-1">
                        {scheduleData.assumptions.map((assumption, index) => (
                          <li key={index}>{assumption}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {scheduleData.verify_with_foreman.length > 0 && (
                    <div className="alert-info">
                      <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">
                        Questions to Verify
                      </h3>
                      <ul className="text-sm text-blue-300/80 list-disc list-inside space-y-1">
                        {scheduleData.verify_with_foreman.map((question, index) => (
                          <li key={index}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {scheduleData.warnings.length > 0 && (
                    <div className="alert-error">
                      <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">
                        Warnings
                      </h3>
                      <ul className="text-sm text-red-300/80 list-disc list-inside space-y-1">
                        {scheduleData.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {scheduleData.confidence_explanation && (
                    <div className="p-4 bg-[#1A1A1A] border border-[#333333] rounded-xl">
                      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                        Confidence: {scheduleData.confidence_level}
                      </h3>
                      <p className="text-sm text-[#B3B3B3]">
                        {scheduleData.confidence_explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
