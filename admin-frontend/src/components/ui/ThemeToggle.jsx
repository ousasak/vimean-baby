import React from 'react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import AppIcon from './AppIcon'

export default function ThemeToggle({ className = '' }) {
  const { t } = useTranslation()
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line/80 bg-white text-ink-muted shadow-xs transition hover:border-brand/40 hover:bg-surface hover:text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-amber-400 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-amber-300 ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AppIcon
        name={isDark ? 'sun' : 'moon'}
        size={18}
        className={isDark ? 'text-amber-400' : 'text-slate-600'}
      />
    </button>
  )
}
