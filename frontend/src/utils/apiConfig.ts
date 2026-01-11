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

  // Get current hostname directly - more reliable than origin
  const hostname = window.location.hostname

  // Debug log
  console.log('[getApiUrl] hostname:', hostname, 'origin:', window.location.origin)

  // If localhost, use localhost for backend
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000'
  }

  // Otherwise, use the same hostname with port 8000
  return `http://${hostname}:8000`
}

// Export as a getter to ensure it's always computed fresh
// This fixes issues where the module is cached before navigation
export const API_URL = (() => {
  // Compute dynamically each time it's accessed
  const url = getApiUrl()
  if (import.meta.env.DEV) {
    console.log('API URL configured:', url)
    console.log('Current origin:', window.location.origin)
  }
  return url
})()

