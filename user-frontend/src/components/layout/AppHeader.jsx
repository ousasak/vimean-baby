import React, { useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import LanguageSwitcher from './LanguageSwitcher'
import AccountMenu from './AccountMenu'
import MobileNav from './MobileNav'
import ThemeToggle from '../common/ThemeToggle'

export default function AppHeader() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const cart = useCart()
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navLinks = useMemo(() => [
    { to: localePath('/'), label: t('nav.home') },
    { to: localePath('/products'), label: t('nav.shop') },
    { to: localePath('/categories'), label: t('nav.categories') },
    { to: localePath('/contact'), label: t('nav.contact') },
  ], [localePath, t])

  const onSearch = (e) => {
    e.preventDefault()
    navigate({
      pathname: localePath('/products'),
      search: searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '',
    })
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-40">
      {/* Utility bar */}
      <div className="bg-ink text-white dark:bg-slate-950">
        <div className="container-store flex items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <p className="truncate italic opacity-90">
            {t('app.utilityTagline')}
          </p>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <a href="tel:+85512345678" className="hidden items-center gap-1.5 sm:inline-flex">
              <span>Tel: +855 12 345 678</span>
            </a>
            {auth.isLoggedIn ? (
              <Link
                to={localePath('/account')}
                onClick={(e) => {
                  if (location.pathname === '/account') e.preventDefault()
                }}
                className="hidden max-w-40 truncate sm:inline"
              >
                {t('account.hi', { name: auth.user?.fullName?.split(' ')[0] })}
              </Link>
            ) : (
              <span className="hidden sm:inline">
                <Link to={localePath('/login')} className="hover:underline">{t('auth.signIn')}</Link>
                <span className="px-1 opacity-60">/</span>
                <Link to={localePath('/register')} className="hover:underline">{t('auth.register')}</Link>
              </span>
            )}
            <span className="rounded-full bg-white/10 px-2.5 py-1">
              {t('locale.cambodia')}
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-line bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="container-store flex items-center gap-3 px-4 py-3 sm:px-6 lg:gap-6 lg:px-8 lg:py-4">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
            aria-label={t('nav.shop')}
            onClick={() => setMobileOpen(true)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link to={localePath('/')} className="shrink-0" aria-label={t('app.name')}>
            <img
              src="/logo.svg"
              alt={t('app.name')}
              className="h-10 w-auto sm:h-12 dark:hidden"
              width="199"
              height="48"
            />
            <img
              src="/logo-dark.svg"
              alt={t('app.name')}
              className="hidden h-10 w-auto sm:h-12 dark:block"
              width="199"
              height="48"
            />
          </Link>

          <form className="mx-auto hidden min-w-0 flex-1 md:flex" onSubmit={onSearch}>
            <div className="flex w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-cream dark:border-slate-700 dark:bg-slate-800">
              <span className="hidden items-center border-r border-line px-3 text-xs text-muted dark:border-slate-700 dark:text-slate-400 lg:inline-flex">
                {t('search.all')}
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="search"
                className="min-h-12 w-full bg-transparent px-4 text-sm text-ink outline-none placeholder:text-muted dark:text-slate-100 dark:placeholder:text-slate-400"
                placeholder={t('search.placeholder')}
              />
              <button
                type="submit"
                className="inline-flex min-h-12 min-w-12 items-center justify-center bg-brand text-white"
                aria-label={t('nav.search')}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.3-4.3m1.8-5.2a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                </svg>
              </button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right xl:block">
              <p className="text-xs font-semibold text-ink dark:text-slate-100">{t('nav.support')}</p>
              <p className="text-xs text-muted dark:text-slate-400">+855 12 345 678</p>
            </div>
            <ThemeToggle />
            <LanguageSwitcher />
            <AccountMenu />
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label={t('nav.cart')}
              onClick={() => cart.toggle(true)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25h9.75l2.055-7.72H5.106M7.5 14.25 5.106 5.272M7.5 14.25l-1.28 4.16A1.125 1.125 0 0 0 7.29 20.25h9.96" />
              </svg>
              {cart.count > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {cart.count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Secondary nav bar */}
        <div className="hidden border-t border-line dark:border-slate-800 lg:block">
          <div className="container-store flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 py-1 text-sm font-semibold text-ink dark:text-slate-200">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-xl px-4 py-2.5 transition hover:bg-cream hover:text-brand dark:hover:bg-slate-800 dark:hover:text-brand"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-4 text-xs font-medium text-muted dark:text-slate-400">
              <span>{t('home.trustCod')}</span>
              <span className="h-1 w-1 rounded-full bg-muted/40 dark:bg-slate-600" />
              <span>{t('home.trustAuth')}</span>
            </div>
          </div>
        </div>
      </div>

      <MobileNav
        open={mobileOpen}
        links={navLinks}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  )
}
