/**
 * Supabase client configuration
 * Handles authentication and database connections
 */

import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file'
  )
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Magic-link email flow settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Session expires after 24 hours
    storage: window.localStorage,
  },
})

