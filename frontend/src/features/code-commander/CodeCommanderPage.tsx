/**
 * Code & Spec Commander Page
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
import { formatAnswerWithCitations, formatAnswerWithCitationsMarkdown } from '../../utils/exportWithCitations'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about the document... (e.g., 'What are the safety requirements on page 5?')"
                className="w-full h-24 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
              onClick={handleQuery}
              disabled={isLoading || !selectedFile || !question.trim()}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Query Document'}
            </button>
          </div>

          {/* Output Section */}
          {(response || isLoading || error) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                      className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Copy Answer
                    </button>
                    {citations.length > 0 && (
                      <button
                        onClick={handleCopyWithCitations}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Copy with Citations
                      </button>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 mb-4">
                  {error}
                </div>
              )}

              {foundInDocument === false && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200 mb-4">
                  ⚠️ Answer not found in document
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
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Ask Follow-up Question
                  </h3>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a follow-up question about the same document..."
                    className="w-full h-20 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 mb-2"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleFollowUpQuery}
                    disabled={isLoading || !question.trim()}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {isLoading ? 'Processing...' : 'Ask Follow-up'}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
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

