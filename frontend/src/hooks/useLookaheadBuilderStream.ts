/**
 * Hook for streaming Lookahead Builder API responses
 * Handles Server-Sent Events (SSE) streaming with FormData for image/text uploads
 */

import { useState, useCallback } from 'react'
import { ScheduleItem } from '../components/ScheduleTable'

export interface ImageAnalysis {
  space_type: string
  estimated_dimensions: string
  current_phase: string
  visible_conditions: string[]
  trades_identified: string[]
}

export interface ScheduleData {
  image_analysis?: ImageAnalysis
  schedule: ScheduleItem[]
  assumptions: string[]
  verify_with_foreman: string[]
  confidence_level: string
  confidence_explanation: string
  warnings: string[]
}

interface UseLookaheadBuilderStreamReturn {
  summary: string
  scheduleData: ScheduleData | null
  confidence: 'High' | 'Med' | 'Low' | null
  isLoading: boolean
  error: string | null
  streamFormDataResponse: (url: string, formData: FormData) => Promise<void>
  reset: () => void
}

export function useLookaheadBuilderStream(): UseLookaheadBuilderStreamReturn {
  const [summary, setSummary] = useState('')
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null)
  const [confidence, setConfidence] = useState<'High' | 'Med' | 'Low' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamFormDataResponse = useCallback(async (url: string, formData: FormData) => {
    setIsLoading(true)
    setError(null)
    setSummary('')
    setScheduleData(null)
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
                // Only show summary if we don't have structured data yet
                // (to avoid showing raw JSON after parsing)
                setSummary(accumulatedSummary)
              } else if (data.type === 'complete') {
                if (data.confidence) {
                  setConfidence(data.confidence)
                }
                if (data.schedule_data) {
                  setScheduleData(data.schedule_data)
                  // Clear the raw summary text once we have structured data
                  setSummary('')
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
    setScheduleData(null)
    setConfidence(null)
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    summary,
    scheduleData,
    confidence,
    isLoading,
    error,
    streamFormDataResponse,
    reset,
  }
}

