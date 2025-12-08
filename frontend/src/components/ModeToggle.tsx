/**
 * Mode Toggle Component
 * Switches between Field Mode (dark) and Office Mode (light)
 */

import { useTheme } from '../contexts/ThemeContext'

export function ModeToggle() {
  const { mode, toggleMode } = useTheme()

  return (
    <button
      onClick={toggleMode}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label={`Switch to ${mode === 'field' ? 'Office' : 'Field'} Mode`}
    >
      <span className="text-sm font-medium">
        {mode === 'field' ? '🏗️ Field' : '💼 Office'}
      </span>
      <span className="text-xs text-gray-600 dark:text-gray-400">Mode</span>
    </button>
  )
}

