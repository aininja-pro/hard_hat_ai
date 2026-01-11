/**
 * Hook for streaming Claude API responses
 * Handles Server-Sent Events (SSE) streaming
 */

import { useState, useCallback } from 'react'

export interface Citation {
  page: number
  section?: string
  text?: string
}

interface StreamChunk {
  chunk?: string
  type: 'text' | 'complete' | 'error'
  confidence?: 'High' | 'Med' | 'Low'
  citations?: Citation[]
  found_in_document?: boolean
  message?: string
}

interface UseClaudeStreamReturn {
  response: string
  confidence: 'High' | 'Med' | 'Low' | null
  citations: Citation[]
  foundInDocument: boolean | null
  isLoading: boolean
  error: string | null
  streamResponse: (url: string, body: any) => Promise<void>
  reset: () => void
}

export function useClaudeStream(): UseClaudeStreamReturn {
  const [response, setResponse] = useState('')
  const [confidence, setConfidence] = useState<'High' | 'Med' | 'Low' | null>(null)
  const [citations, setCitations] = useState<Citation[]>([])
  const [foundInDocument, setFoundInDocument] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamResponse = useCallback(async (url: string, body: any) => {
    setIsLoading(true)
    setError(null)
    setResponse('')
    setConfidence(null)
    setCitations([])
    setFoundInDocument(null)

    try {
      // Fix URL for mobile - replace localhost with actual hostname
      let finalUrl = url
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        finalUrl = url.replace('localhost:8000', `${window.location.hostname}:8000`)
        finalUrl = finalUrl.replace('127.0.0.1:8000', `${window.location.hostname}:8000`)
      }

      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      console.log('[useClaudeStream] Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[useClaudeStream] Error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
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
              const data: StreamChunk = JSON.parse(line.slice(6))

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
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      console.error('[useClaudeStream] Error:', errorMessage)
      setError(errorMessage)
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
    streamResponse,
    reset,
  }
}

