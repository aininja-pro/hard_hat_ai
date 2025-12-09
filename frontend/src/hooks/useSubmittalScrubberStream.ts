/**
 * Hook for streaming Submittal Scrubber API responses
 * Handles Server-Sent Events (SSE) streaming with FormData for dual file uploads
 */

import { useState, useCallback } from 'react'
import { ComplianceItem } from '../components/ComplianceTable'

interface UseSubmittalScrubberStreamReturn {
  summary: string
  complianceItems: ComplianceItem[]
  confidence: 'High' | 'Med' | 'Low' | null
  isLoading: boolean
  error: string | null
  streamFormDataResponse: (url: string, formData: FormData) => Promise<void>
  reset: () => void
}

export function useSubmittalScrubberStream(): UseSubmittalScrubberStreamReturn {
  const [summary, setSummary] = useState('')
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([])
  const [confidence, setConfidence] = useState<'High' | 'Med' | 'Low' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamFormDataResponse = useCallback(async (url: string, formData: FormData) => {
    setIsLoading(true)
    setError(null)
    setSummary('')
    setComplianceItems([])
    setConfidence(null)

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      // Read the stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let buffer = ''
      let accumulatedSummary = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'text' && data.chunk) {
                // Accumulate summary text as it streams
                accumulatedSummary += data.chunk
                setSummary(accumulatedSummary)
              } else if (data.type === 'complete') {
                if (data.confidence) {
                  setConfidence(data.confidence)
                }
                if (data.compliance_items && Array.isArray(data.compliance_items)) {
                  setComplianceItems(data.compliance_items)
                }
                if (data.summary) {
                  setSummary(data.summary)
                }
                setIsLoading(false)
              } else if (data.type === 'error') {
                throw new Error(data.message || 'Unknown error')
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setSummary('')
    setComplianceItems([])
    setConfidence(null)
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    summary,
    complianceItems,
    confidence,
    isLoading,
    error,
    streamFormDataResponse,
    reset,
  }
}

