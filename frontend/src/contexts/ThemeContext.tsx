/**
 * Theme Context
 * Manages Field Mode (dark) vs Office Mode (light) theme switching
 */

import React, { createContext, useContext, useEffect, useState } from 'react'

type ThemeMode = 'field' | 'office'

interface ThemeContextType {
  mode: ThemeMode
  toggleMode: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Load saved preference from localStorage, default to 'office'
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode')
    return (saved === 'field' || saved === 'office' ? saved : 'office') as ThemeMode
  })

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement
    if (mode === 'field') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    // Save preference to localStorage
    localStorage.setItem('theme-mode', mode)
  }, [mode])

  const toggleMode = () => {
    setMode((prev) => (prev === 'field' ? 'office' : 'field'))
  }

  const value: ThemeContextType = {
    mode,
    toggleMode,
    isDark: mode === 'field',
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Hook to use theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

