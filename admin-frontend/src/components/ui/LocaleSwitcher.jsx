import React from 'react'
import { useTranslation } from 'react-i18next'

export default function LocaleSwitcher({ className = '' }) {
  const { i18n } = useTranslation()
  const current = (i18n.language || 'km').toLowerCase().startsWith('en') ? 'en' : 'km'

  const setLanguage = (lang) => {
    if (current !== lang) {
      i18n.changeLanguage(lang)
    }
  }

  return (
    <div
      className={`inline-flex h-9 items-center rounded-xl border border-line/80 bg-white p-0.5 text-xs font-semibold shadow-xs dark:border-slate-700 dark:bg-slate-800 ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLanguage('km')}
        className={`flex h-full items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
          current === 'km'
            ? 'bg-brand text-white shadow-xs font-bold'
            : 'text-ink-muted hover:text-ink dark:text-slate-400 dark:hover:text-slate-100'
        }`}
        aria-pressed={current === 'km'}
      >
        KH
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex h-full items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
          current === 'en'
            ? 'bg-brand text-white shadow-xs font-bold'
            : 'text-ink-muted hover:text-ink dark:text-slate-400 dark:hover:text-slate-100'
        }`}
        aria-pressed={current === 'en'}
      >
        EN
      </button>
    </div>
  )
}
