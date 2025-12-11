/**
 * API Configuration Utility
 * Automatically detects the correct API URL based on the current origin
 * Works for both localhost (development) and IP address (mobile access)
 */

/**
 * Get the backend API URL based on the current frontend URL
 * If accessing via localhost:3000, uses localhost:8000
 * If accessing via IP (e.g., 192.168.1.81:3000), uses same IP on port 8000
 */
export function getApiUrl(): string {
  // Check if VITE_API_URL is explicitly set in environment
  const envApiUrl = (import.meta.env as any).VITE_API_URL
  if (envApiUrl) {
    return envApiUrl
  }

  // Get current origin (e.g., http://localhost:3000 or http://192.168.1.81:3000)
  const origin = window.location.origin

  // If localhost, use localhost for backend
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return 'http://localhost:8000'
  }

  // Otherwise, extract the hostname and use port 8000
  // e.g., http://192.168.1.81:3000 -> http://192.168.1.81:8000
  try {
    const url = new URL(origin)
    return `http://${url.hostname}:8000`
  } catch {
    // Fallback to localhost if URL parsing fails
    return 'http://localhost:8000'
  }
}

// Export the API URL as a constant
export const API_URL = getApiUrl()

// Log for debugging
if (import.meta.env.DEV) {
  console.log('API URL configured:', API_URL)
  console.log('Current origin:', window.location.origin)
}

