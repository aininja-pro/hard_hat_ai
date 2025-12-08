/**
 * Auth Callback Page
 * Handles the redirect after clicking magic-link in email
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Handle the auth callback
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error: authError } = await supabase.auth.getSession()

        if (authError) {
          throw authError
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          navigate('/dashboard', { replace: true })
        } else {
          setError('No session found. Please try signing in again.')
          setLoading(false)
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Authentication failed. Please try again.')
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Completing sign in...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/signin')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    )
  }

  return null
}

