import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loadTheme, saveTheme } from '../utils/storage.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => loadTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    saveTheme(theme)
  }, [theme])

  const value = useMemo(() => {
    function toggleTheme() {
      setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
    }
    return { theme, setTheme, toggleTheme }
  }, [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

