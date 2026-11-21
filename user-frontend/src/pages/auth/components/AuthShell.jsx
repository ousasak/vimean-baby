import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'

export default function AuthShell({ title, subtitle, children, footer }) {
  const { t } = useI18n()
  const localePath = useLocalePath()

  const perks = useMemo(() => [
    { icon: 'M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.38a1.13 1.13 0 0 1-1.13-1.13V6.38a1.13 1.13 0 0 1 1.13-1.13h11.25c.62 0 1.12.5 1.12 1.13v1.87m0 0a3.75 3.75 0 0 1 7.5 0v3.75a3.75 3.75 0 0 1-7.5 0m0-3.75h7.5', label: t('auth.perks.tracking') },
    { icon: 'M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.36-1.99 1.26 12c.07.67-.45 1.24-1.12 1.24H4.25a1.13 1.13 0 0 1-1.12-1.24l1.26-12A1.13 1.13 0 0 1 5.51 7.5h12.98c.58 0 1.06.43 1.12 1.01Z', label: t('auth.perks.checkout') },
    { icon: 'M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.88A2.63 2.63 0 1 0 9.38 7.5H12m0-2.63V7.5m0-2.63A2.63 2.63 0 1 1 14.63 7.5H12m0 0V21m-8.63-9.75h18c.62 0 1.13-.5 1.13-1.13v-1.5c0-.62-.5-1.12-1.13-1.12h-18c-.62 0-1.12.5-1.12 1.12v1.5c0 .63.5 1.13 1.12 1.13Z', label: t('auth.perks.offers') },
  ], [t])

  return (
    <div className="container-store px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-soft lg:grid-cols-[1fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-brand p-10 text-white lg:flex lg:flex-col">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10" aria-hidden="true" />
          <Link to={localePath('/')} className="relative inline-flex" aria-label={t('app.name')}>
            <img src="/logo-white.svg" alt={t('app.name')} className="h-11 w-auto" width="183" height="44" />
          </Link>
          <div className="relative mt-auto">
            <h2 className="text-3xl font-bold leading-tight">{t('auth.panelTitle')}</h2>
            <p className="mt-3 text-sm text-white/85">{t('auth.panelBody')}</p>
            <ul className="mt-8 space-y-4">
              {perks.map((perk) => (
                <li key={perk.label} className="flex items-center gap-3 text-sm font-medium">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d={perk.icon} />
                    </svg>
                  </span>
                  {perk.label}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="p-6 sm:p-10 lg:p-12">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">
            {children}
          </div>
          {footer && (
            <div className="mt-8 border-t border-line pt-6 text-center text-sm text-muted">
              {footer}
            </div>
          )}
        </section>
      </div>

      <p className="mx-auto mt-6 flex max-w-5xl items-center justify-center gap-2 text-center text-xs text-muted">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        {t('auth.secureNote')}
      </p>
    </div>
  )
}
