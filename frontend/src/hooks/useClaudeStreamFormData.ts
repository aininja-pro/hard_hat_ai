/**
 * Hook for streaming Claude API responses with FormData (for file uploads)
 * Handles Server-Sent Events (SSE) streaming with multipart/form-data
 */

import { useState, useCallback } from 'react'

export interface Citation {
  page: number
  section?: string
  text?: string
}

interface UseClaudeStreamFormDataReturn {
  response: string
  confidence: 'High' | 'Med' | 'Low' | null
  citations: Citation[]
  foundInDocument: boolean | null
  isLoading: boolean
  error: string | null
  streamFormDataResponse: (url: string, formData: FormData) => Promise<void>
  reset: () => void
}

export function useClaudeStreamFormData(): UseClaudeStreamFormDataReturn {
  const [response, setResponse] = useState('')
  const [confidence, setConfidence] = useState<'High' | 'Med' | 'Low' | null>(null)
  const [citations, setCitations] = useState<Citation[]>([])
  const [foundInDocument, setFoundInDocument] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamFormDataResponse = useCallback(async (url: string, formData: FormData) => {
    setIsLoading(true)
    setError(null)
    setResponse('')
    setConfidence(null)
    setCitations([])
    setFoundInDocument(null)

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
                setResponse((prev) => prev + data.chunk)
              } else if (data.type === 'complete') {
                if (data.confidence) {
                  setConfidence(data.confidence)
                }
                if (data.citations) {
                  setCitations(data.citations)
                }
                if (data.found_in_document !== undefined) {
                  setFoundInDocument(data.found_in_document)
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
    setResponse('')
    setConfidence(null)
    setCitations([])
    setFoundInDocument(null)
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    response,
    confidence,
    citations,
    foundInDocument,
    isLoading,
    error,
    streamFormDataResponse,
    reset,
  }
}

