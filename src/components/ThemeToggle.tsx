import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

export function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return { dark, setDark, toggle: () => setDark(d => !d) }
}

export default function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <div className="theme-toggle">
      <button
        onClick={() => { if (dark) return; onToggle() }}
        className={`theme-toggle-btn ${dark ? 'active' : ''}`}
        title="Тёмная тема"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => { if (!dark) return; onToggle() }}
        className={`theme-toggle-btn ${!dark ? 'active' : ''}`}
        title="Светлая тема"
      >
        <Sun className="w-4 h-4" />
      </button>
    </div>
  )
}
