import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import LanguageSwitcher from './LanguageSwitcher'

export default function AppFooter() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const year = new Date().getFullYear()

  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const menuLinks = useMemo(() => [
    { to: localePath('/'), label: t('nav.home') },
    { to: localePath('/products'), label: t('nav.shop') },
    { to: localePath('/categories'), label: t('nav.categories') },
    { to: localePath('/contact'), label: t('nav.contact') },
  ], [localePath, t])

  const aboutLinks = useMemo(() => [
    { to: localePath('/contact'), label: t('footer.shipping') },
    { to: localePath('/contact'), label: t('footer.returns') },
    { to: localePath('/contact'), label: t('footer.privacy') },
    { to: localePath('/contact'), label: t('footer.terms') },
  ], [localePath, t])

  const onSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="mt-auto border-t border-line bg-white">
      {/* Newsletter */}
      <div className="border-b border-line bg-cream">
        <div className="container-store section-pad py-10">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">
                {t('footer.newsletterTitle')}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {t('footer.newsletterBody')}
              </p>
            </div>
            <div>
              {subscribed ? (
                <div className="rounded-2xl bg-mint-tint p-4 text-center text-sm font-semibold text-ink">
                  {t('footer.newsletterThanks')}
                </div>
              ) : (
                <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSubscribe}>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder={t('footer.newsletterPlaceholder')}
                    className="min-h-12 flex-1 rounded-2xl border border-line bg-white px-4 text-sm outline-none transition focus:border-brand"
                  />
                  <button type="submit" className="btn-primary shrink-0">
                    {t('footer.subscribe')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="container-store section-pad">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to={localePath('/')} className="inline-block" aria-label={t('app.name')}>
              <img src="/logo.svg" alt={t('app.name')} className="h-10 w-auto" width="166" height="40" />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {t('app.tagline')}
            </p>
            <div className="mt-6 space-y-1 text-sm text-ink-muted">
              <p>{t('contact.address')}</p>
              <p>{t('contact.phone')}</p>
              <p>{t('contact.hours')}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink">{t('footer.menu')}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {menuLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-muted transition hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink">{t('footer.help')}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-muted transition hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink">{t('footer.about')}</h3>
            <p className="mt-3 text-xs text-muted leading-relaxed">
              {t('footer.brandBlurb')}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="flex h-10 items-center rounded-xl border border-line bg-white px-3 text-xs font-semibold">
                Cash on Delivery
              </span>
              <span className="flex h-10 items-center rounded-xl border border-line bg-white px-3 text-xs font-semibold text-brand">
                KHQR / Bakong
              </span>
              <span className="flex h-10 items-center rounded-xl border border-line bg-white px-3 text-xs font-semibold">
                Bank Transfer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom utility bar */}
      <div className="border-t border-line bg-ink py-6 text-white">
        <div className="container-store flex flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-white/70 text-center sm:text-left">
            © {year} {t('app.name')}. {t('footer.rights')}
          </p>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10 hover:text-brand-light"
              aria-label={t('footer.backToTop')}
              onClick={scrollTop}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
