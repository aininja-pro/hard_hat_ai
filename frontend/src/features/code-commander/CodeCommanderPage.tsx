/**
 * Code & Spec Commander Page - Premium Industrial Design
 * Query technical documents with questions and get answers with citations
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClaudeStreamFormData } from '../../hooks/useClaudeStreamFormData'
import { FileUpload } from '../../components/FileUpload'
import { StreamingResponse } from '../../components/StreamingResponse'
import { ConfidenceBadge } from '../../components/ConfidenceBadge'
import { CitationDisplay } from '../../components/CitationDisplay'
import { ProgressIndicator } from '../../components/ProgressIndicator'
import { QuestionSuggestions } from '../../components/QuestionSuggestions'
import { copyToClipboard } from '../../utils/exports'
import { formatAnswerWithCitations } from '../../utils/exportWithCitations'
import { API_URL } from '../../utils/apiConfig'
import { ChevronLeft, Copy, FileText } from 'lucide-react'

export default function CodeCommanderPage() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [question, setQuestion] = useState('')
  const [questionHistory, setQuestionHistory] = useState<string[]>([])
  const [previousResponse, setPreviousResponse] = useState<string>('')
  const {
    response,
    confidence,
    citations,
    foundInDocument,
    isLoading,
    error,
    streamFormDataResponse,
    reset,
  } = useClaudeStreamFormData()

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    reset() // Reset previous response when new file is selected
    setQuestionHistory([])
    setPreviousResponse('')
  }

  const handleSelectSuggestedQuestion = (suggestedQuestion: string) => {
    setQuestion(suggestedQuestion)
  }

  const handleFollowUpQuery = async () => {
    if (!question.trim() || question.trim().length < 3) {
      alert('Please enter a follow-up question')
      return
    }

    // Save current response and question before querying
    if (response) {
      setPreviousResponse(response)
      setQuestionHistory([...questionHistory, question])
    }

    await handleQuery(true) // Pass isFollowUp flag

    // Clear question after submitting (response will update via hook)
    // Note: We keep previousResponse and questionHistory for context
  }

  const handleQuery = async (isFollowUp = false) => {
    if (!selectedFile) {
      alert('Please upload a PDF document first')
      return
    }

    if (!question.trim() || question.trim().length < 3) {
      alert('Please enter a question (at least 3 characters)')
      return
    }

    // Create FormData
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('question', question.trim())

    // Add previous context for follow-up questions
    if (isFollowUp && questionHistory.length > 0 && previousResponse) {
      formData.append('previous_question', questionHistory[questionHistory.length - 1])
      formData.append('previous_answer', previousResponse)
    }

    // Use the FormData streaming hook
    await streamFormDataResponse(`${API_URL}/api/code-commander/query`, formData)
  }

  const handleCopy = async () => {
    if (!response) return
    const success = await copyToClipboard(response)
    if (success) {
      alert('Copied to clipboard!')
    } else {
      alert('Failed to copy. Please try again.')
    }
  }

  const handleCopyWithCitations = async () => {
    if (!response) return
    const formatted = formatAnswerWithCitations(response, citations)
    const success = await copyToClipboard(formatted)
    if (success) {
      alert('Copied answer with citations to clipboard!')
    } else {
      alert('Failed to copy. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Header - Premium Industrial */}
      <header className="page-header">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#FF6B0008,transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide uppercase text-gradient-white truncate">
                Code & Spec Commander
              </h1>
            </div>
            {confidence && <ConfidenceBadge confidence={confidence} />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Input Section */}
          <div className="card-premium p-6">
            <h2 className="text-lg font-semibold mb-4 text-white uppercase tracking-wide">
              Upload Document & Ask Question
            </h2>

            <div className="mb-4">
              <FileUpload
                fileType="pdf"
                onFileSelect={handleFileSelect}
                label="Upload PDF Document"
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider mb-2">
                Your Question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about the document... (e.g., 'What are the safety requirements on page 5?')"
                className="textarea-premium h-24"
                disabled={isLoading || !selectedFile}
              />
              {selectedFile && !isLoading && (
                <div className="mt-2">
                  <QuestionSuggestions
                    onSelectQuestion={handleSelectSuggestedQuestion}
                    documentType="general"
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => handleQuery()}
              disabled={isLoading || !selectedFile || !question.trim()}
              className="btn-primary btn-shine"
            >
              {isLoading ? 'Processing...' : 'Query Document'}
            </button>
          </div>

          {/* Output Section */}
          {(response || isLoading || error) && (
            <div className="card-premium p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white uppercase tracking-wide">
                    Answer
                  </h2>
                  <ProgressIndicator
                    isLoading={isLoading}
                    message={isLoading ? 'Analyzing document...' : undefined}
                    size="sm"
                  />
                </div>
                {response && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copy Answer</span>
                    </button>
                    {citations.length > 0 && (
                      <button
                        onClick={handleCopyWithCitations}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] rounded-lg text-black text-sm font-medium shadow-lg shadow-[#FF6B00]/20 hover:shadow-xl hover:shadow-[#FF6B00]/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 touch-manipulation"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Copy with Citations</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="alert-error mb-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {foundInDocument === false && (
                <div className="alert-warning mb-4">
                  <p className="text-yellow-400">⚠️ Answer not found in document</p>
                </div>
              )}

              <StreamingResponse text={response} isLoading={isLoading} />

              {citations.length > 0 && (
                <div className="mt-6">
                  <CitationDisplay citations={citations} />
                </div>
              )}

              {/* Follow-up Question Section */}
              {response && !isLoading && selectedFile && (
                <div className="mt-6 pt-6 border-t border-[#333333]">
                  <h3 className="text-sm font-semibold text-[#999999] uppercase tracking-wider mb-3">
                    Ask Follow-up Question
                  </h3>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a follow-up question about the same document..."
                    className="textarea-premium h-20 mb-2"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleFollowUpQuery}
                    disabled={isLoading || !question.trim()}
                    className="btn-primary btn-shine text-sm py-2"
                  >
                    {isLoading ? 'Processing...' : 'Ask Follow-up'}
                  </button>
                  <p className="text-xs text-[#666666] mt-2 text-center">
                    The AI will use context from the previous answer
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
