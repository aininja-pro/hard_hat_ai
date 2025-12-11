/**
 * Mode Toggle Component - Industrial Design
 * Switches between Field Mode (outdoor) and Office Mode (indoor)
 */

import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export function ModeToggle() {
  const { mode, toggleMode } = useTheme()
  const isField = mode === 'field'

  return (
    <button
      onClick={toggleMode}
      className="
        flex items-center gap-2 px-3 py-2
        rounded-lg
        bg-[#252525]
        border border-[#333333]
        hover:border-[#FF6B00]
        transition-colors
        min-h-[44px]
        touch-manipulation
      "
      aria-label={`Switch to ${isField ? 'Office' : 'Field'} Mode`}
    >
      {isField ? (
        <Moon className="w-4 h-4 text-[#FF6B00]" strokeWidth={1.5} />
      ) : (
        <Sun className="w-4 h-4 text-[#FFB800]" strokeWidth={1.5} />
      )}
      <span className="text-xs font-medium text-white uppercase tracking-wide">
        {isField ? 'Field' : 'Office'}
      </span>
    </button>
  )
}
