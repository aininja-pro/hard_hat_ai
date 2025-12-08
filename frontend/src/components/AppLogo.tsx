/**
 * App Logo Component
 * Displays logo from white-label config or default text
 */

import { getThemeConfig } from '../utils/themeConfig'

export function AppLogo() {
  const config = getThemeConfig()

  if (config.logoUrl) {
    return (
      <img
        src={config.logoUrl}
        alt={config.productName}
        className="h-8 w-auto"
      />
    )
  }

  return (
    <span className="text-2xl font-bold text-gray-900 dark:text-white">
      {config.productName}
    </span>
  )
}

