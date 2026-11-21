import React from 'react'
import { useI18n } from '@/hooks/useI18n'

export default function LanguageSwitcher({ className = '' }) {
  const { locale, locales, setLocale } = useI18n()

  return (
    <div
      className={`inline-flex h-10 items-center rounded-full border border-line bg-white/80 p-0.5 text-xs shadow-xs dark:border-slate-700 dark:bg-slate-800 ${className}`}
      role="group"
      aria-label="Language selection"
    >
      {locales.map((item) => {
        const active = locale === item.code
        return (
          <button
            key={item.code}
            type="button"
            className={`flex h-full items-center justify-center rounded-full px-2.5 font-semibold transition ${
              active
                ? 'bg-brand text-white shadow-xs font-bold'
                : 'text-ink-muted hover:text-ink dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            onClick={() => setLocale(item.code)}
          >
            {item.code.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
