/**
 * Site Scribe Page - Premium Industrial Design
 * Main workspace for transforming rough field notes into professional emails
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClaudeStream } from '../../hooks/useClaudeStream'
import { ToneSelector } from './components/ToneSelector'
import { StreamingResponse } from '../../components/StreamingResponse'
import { ConfidenceBadge } from '../../components/ConfidenceBadge'
import { ProgressIndicator } from '../../components/ProgressIndicator'
import {
  copyToClipboard,
  extractSubject,
  extractEmailBody,
} from '../../utils/exports'
import { ChevronLeft, Copy, Mail } from 'lucide-react'

type Tone = 'neutral' | 'firm' | 'cya'

import { getApiUrl } from '../../utils/apiConfig'

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
    const apiUrl = getApiUrl()
    await streamResponse(`${apiUrl}/api/site-scribe/transform`, {
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
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide uppercase text-gradient-white truncate">
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
          <div className="card-premium p-6">
            <h2 className="text-lg font-semibold mb-4 text-white uppercase tracking-wide">
              Email Details
            </h2>

            {/* Email Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider mb-2">
                  To Name <span className="text-[#666666] normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="John Smith"
                  className="input-premium"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider mb-2">
                  To Email <span className="text-[#666666] normal-case">(optional)</span>
                </label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="input-premium"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider mb-2">
                  From Name <span className="text-[#666666] normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Your Name"
                  className="input-premium"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider mb-2">
                  From Email <span className="text-[#666666] normal-case">(optional)</span>
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-premium"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider mb-2">
                Subject <span className="text-[#666666] normal-case">(optional - AI will generate if empty)</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line"
                className="input-premium"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider mb-2">
                  CC <span className="text-[#666666] normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="cc@example.com"
                  className="input-premium"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider mb-2">
                  BCC <span className="text-[#666666] normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="bcc@example.com"
                  className="input-premium"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider mb-2">
                Field Notes
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste your rough field notes here... (Voice input coming soon)"
                className="textarea-premium h-32"
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <ToneSelector selectedTone={tone} onToneChange={setTone} />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !inputText.trim()}
              className="btn-primary btn-shine"
            >
              {isLoading ? 'Generating...' : 'Generate Professional Email'}
            </button>
          </div>

          {/* Output Section */}
          {(response || isLoading || error) && (
            <div className="card-premium p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white uppercase tracking-wide">
                    Generated Email
                  </h2>
                  <ProgressIndicator
                    isLoading={isLoading}
                    message={isLoading ? 'Generating professional email...' : undefined}
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
                      <span className="hidden sm:inline">Copy</span>
                    </button>
                    <button
                      onClick={handleMailto}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] rounded-lg text-black text-sm font-medium shadow-lg shadow-[#FF6B00]/20 hover:shadow-xl hover:shadow-[#FF6B00]/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 touch-manipulation"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="hidden sm:inline">Open in Email</span>
                    </button>
                  </div>
                )}
              </div>
              {error && (
                <div className="alert-error mb-4">
                  <p className="text-red-400">{error}</p>
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
