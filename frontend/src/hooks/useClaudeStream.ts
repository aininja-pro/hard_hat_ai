/**
 * Hook for streaming Claude API responses
 * Handles Server-Sent Events (SSE) streaming
 */

import { useState, useCallback } from 'react'

interface StreamChunk {
  chunk?: string
  type: 'text' | 'complete' | 'error'
  confidence?: 'High' | 'Med' | 'Low'
  message?: string
}

interface UseClaudeStreamReturn {
  response: string
  confidence: 'High' | 'Med' | 'Low' | null
  isLoading: boolean
  error: string | null
  streamResponse: (url: string, body: any) => Promise<void>
  reset: () => void
}

export function useClaudeStream(): UseClaudeStreamReturn {
  const [response, setResponse] = useState('')
  const [confidence, setConfidence] = useState<'High' | 'Med' | 'Low' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamResponse = useCallback(async (url: string, body: any) => {
    setIsLoading(true)
    setError(null)
    setResponse('')
    setConfidence(null)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
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
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    response,
    confidence,
    isLoading,
    error,
    streamResponse,
    reset,
  }
}

