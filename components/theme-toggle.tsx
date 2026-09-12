'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme, type Theme } from '@/components/theme-provider'

const cycle: Theme[] = ['light', 'dark', 'system']

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  function next() {
    const idx = cycle.indexOf(theme)
    setTheme(cycle[(idx + 1) % cycle.length])
  }

  return (
    <button
      onClick={next}
      className={`grid size-8 place-items-center rounded-xl transition-colors hover:bg-v-hover ${className}`}
      aria-label={`Theme: ${theme}. Click to switch.`}
      title={`Current: ${theme}`}
    >
      {theme === 'light' && <Sun className="size-4 text-v-tertiary" />}
      {theme === 'dark' && <Moon className="size-4 text-v-tertiary" />}
      {theme === 'system' && <Monitor className="size-4 text-v-tertiary" />}
    </button>
  )
}
