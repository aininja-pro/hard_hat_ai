/**
 * White-label Theme Configuration
 * Reads theme values from environment variables
 */

export interface ThemeConfig {
  logoUrl: string
  productName: string
  primaryColor: string
  accentColor: string
  faviconUrl: string
}

/**
 * Get theme configuration from environment variables
 * Falls back to defaults if not set
 */
export function getThemeConfig(): ThemeConfig {
  return {
    logoUrl: import.meta.env.VITE_LOGO_URL || '',
    productName: import.meta.env.VITE_PRODUCT_NAME || 'Hard Hat AI Pack',
    primaryColor: import.meta.env.VITE_PRIMARY_COLOR || '#1F2937',
    accentColor: import.meta.env.VITE_ACCENT_COLOR || '#3B82F6',
    faviconUrl: import.meta.env.VITE_FAVICON_URL || '/favicon.ico',
  }
}

/**
 * Apply theme colors to CSS custom properties
 */
export function applyThemeColors(config: ThemeConfig) {
  const root = document.documentElement
  root.style.setProperty('--color-primary', config.primaryColor)
  root.style.setProperty('--color-accent', config.accentColor)
}

