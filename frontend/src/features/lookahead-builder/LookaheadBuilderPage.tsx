/**
 * Lookahead Builder Page
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Upload Photos & Describe Your Goal
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upload construction site photos and describe what you're trying to accomplish to generate a 2-week lookahead schedule.
            </p>

            {/* User Goal - Required */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What are you trying to accomplish? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={userGoal}
                onChange={(e) => setUserGoal(e.target.value)}
                placeholder="Describe your goal... (e.g., 'Complete rough-in for this bathroom and get it ready for drywall', 'Finish all electrical work in this office suite', 'Get this space ready for final inspection')"
                className="w-full h-24 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Upload multiple photos from different angles for better analysis
              </p>
            </div>

            {/* Additional Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trade/Scope (Optional)
                </label>
                <input
                  type="text"
                  value={tradeScope}
                  onChange={(e) => setTradeScope(e.target.value)}
                  placeholder="e.g., 'all trades', 'electrical only'"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Constraints (Optional)
                </label>
                <input
                  type="text"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g., 'Inspection Thursday', 'Materials arrive Monday'"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || selectedImages.length === 0 || !userGoal.trim()}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Generating Schedule...' : 'Generate Schedule'}
            </button>
          </div>

          {/* Output Section */}
          {(summary || scheduleData || isLoading || error) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 mb-4">
                  {error}
                </div>
              )}

              {/* Image Analysis */}
              {scheduleData?.image_analysis && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="text-md font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Image Analysis
                  </h3>
                  <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <p><strong>Space Type:</strong> {scheduleData.image_analysis.space_type}</p>
                    <p><strong>Dimensions:</strong> {scheduleData.image_analysis.estimated_dimensions}</p>
                    <p><strong>Current Phase:</strong> {scheduleData.image_analysis.current_phase}</p>
                    <p><strong>Trades:</strong> {scheduleData.image_analysis.trades_identified.join(', ')}</p>
                  </div>
                </div>
              )}

              {/* Summary/Streaming - Only show if we don't have structured data yet */}
              {summary && !scheduleData && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                    Analysis
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <StreamingResponse text={summary} isLoading={isLoading} />
                  </div>
                </div>
              )}

              {/* Schedule Table */}
              {scheduleData && scheduleData.schedule.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    2-Week Schedule ({scheduleData.schedule.length} items)
                  </h3>
                  <ScheduleTable items={scheduleData.schedule} />
                </div>
              )}

              {/* Assumptions & Warnings */}
              {scheduleData && (
                <div className="space-y-4">
                  {scheduleData.assumptions.length > 0 && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                        Assumptions Made
                      </h3>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-300 list-disc list-inside space-y-1">
                        {scheduleData.assumptions.map((assumption, index) => (
                          <li key={index}>{assumption}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {scheduleData.verify_with_foreman.length > 0 && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                        Questions to Verify
                      </h3>
                      <ul className="text-sm text-blue-800 dark:text-blue-300 list-disc list-inside space-y-1">
                        {scheduleData.verify_with_foreman.map((question, index) => (
                          <li key={index}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {scheduleData.warnings.length > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <h3 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
                        Warnings
                      </h3>
                      <ul className="text-sm text-red-800 dark:text-red-300 list-disc list-inside space-y-1">
                        {scheduleData.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {scheduleData.confidence_explanation && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Confidence: {scheduleData.confidence_level}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
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

