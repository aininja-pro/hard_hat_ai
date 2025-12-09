/**
 * Site Scribe Page
 * Main workspace for transforming rough field notes into professional emails
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClaudeStream } from '../../hooks/useClaudeStream'
import { ToneSelector } from './components/ToneSelector'
import { StreamingResponse } from '../../components/StreamingResponse'
import { ConfidenceBadge } from '../../components/ConfidenceBadge'
import {
  copyToClipboard,
  openMailtoLink,
  extractSubject,
  extractEmailBody,
} from '../../utils/exports'

type Tone = 'neutral' | 'firm' | 'cya'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function SiteScribePage() {
  const navigate = useNavigate()
  const [inputText, setInputText] = useState('')
  const [tone, setTone] = useState<Tone>('neutral')
  const [toEmail, setToEmail] = useState('')
  const [toName, setToName] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('')
  const [subject, setSubject] = useState('')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const { response, confidence, isLoading, error, streamResponse, reset } =
    useClaudeStream()

  const handleGenerate = async () => {
    if (!inputText.trim() || inputText.trim().length < 5) {
      alert('Please enter at least 5 characters of text')
      return
    }

    reset()
    await streamResponse(`${API_URL}/api/site-scribe/transform`, {
      text: inputText,
      tone,
      to_email: toEmail.trim() || undefined,
      to_name: toName.trim() || undefined,
      from_email: fromEmail.trim() || undefined,
      from_name: fromName.trim() || undefined,
      subject: subject.trim() || undefined,
      cc: cc.trim() || undefined,
      bcc: bcc.trim() || undefined,
    })
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

  const handleMailto = () => {
    if (!response) return
    const extractedSubject = extractSubject(response) || subject || 'Construction Update'
    const body = extractEmailBody(response)
    
    // Build mailto with all recipients
    let mailtoParams = []
    if (toEmail) mailtoParams.push(`to=${encodeURIComponent(toEmail)}`)
    if (cc) mailtoParams.push(`cc=${encodeURIComponent(cc)}`)
    if (bcc) mailtoParams.push(`bcc=${encodeURIComponent(bcc)}`)
    mailtoParams.push(`subject=${encodeURIComponent(extractedSubject)}`)
    mailtoParams.push(`body=${encodeURIComponent(body)}`)
    
    window.location.href = `mailto:?${mailtoParams.join('&')}`
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
                aria-label="Back to dashboard"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Site Scribe
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
              Email Details
            </h2>
            
            {/* Email Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Name <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Email <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Name <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Email <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject <span className="text-gray-500">(optional - AI will generate if empty)</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CC <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="cc@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  BCC <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="bcc@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Field Notes
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste your rough field notes here... (Voice input coming soon)"
                className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-4">
              <ToneSelector selectedTone={tone} onToneChange={setTone} />
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isLoading || !inputText.trim()}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate Professional Email'}
            </button>
          </div>

          {/* Output Section */}
          {(response || isLoading || error) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generated Email
                </h2>
                {response && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={handleMailto}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Open in Email
                    </button>
                  </div>
                )}
              </div>
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                  {error}
                </div>
              )}
              <StreamingResponse text={response} isLoading={isLoading} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

