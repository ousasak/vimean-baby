import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useThemeStore } from '@/stores/themeStore'
import { initials } from '@/utils/formatters'
import AppIcon from '../ui/AppIcon'
import LocaleSwitcher from '../ui/LocaleSwitcher'
import ThemeToggle from '../ui/ThemeToggle'

export default function AppHeader() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toggleSidebar = useThemeStore((state) => state.toggleSidebar)

  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    function onDocumentClick(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', onDocumentClick)
    return () => document.removeEventListener('click', onDocumentClick)
  }, [])

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900 sm:px-6">
      <button
        type="button"
        className="btn-icon lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label={t('nav.openMenu')}
        onClick={toggleSidebar}
      >
        <AppIcon name="menu" />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
        <ThemeToggle />
        <LocaleSwitcher />
        <div className="hidden h-5 w-px bg-line dark:bg-slate-700 sm:block" />
        <div ref={rootRef} className="relative">
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-xl px-1.5 transition hover:bg-cream dark:hover:bg-slate-800"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white shadow-xs">
              {initials(user?.fullName)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-40 truncate text-xs font-semibold text-ink dark:text-slate-100">
                {user?.fullName}
              </span>
              <span className="block text-[11px] leading-tight text-ink-muted dark:text-slate-400">{t('app.roleAdmin')}</span>
            </span>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
              role="menu"
            >
              <div className="border-b border-line px-4 py-3 dark:border-slate-700">
                <p className="truncate text-sm font-semibold text-ink dark:text-slate-100">{user?.fullName}</p>
                <p className="truncate text-xs text-ink-muted dark:text-slate-400">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-surface dark:text-slate-200 dark:hover:bg-slate-700/60"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <AppIcon name="settings" size={18} /> {t('nav.settings')}
              </Link>
              <button
                type="button"
                className="flex w-full items-center gap-2 border-t border-line/70 px-4 py-2.5 text-left text-sm text-ink-muted hover:bg-surface hover:text-danger dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-rose-400"
                role="menuitem"
                onClick={handleLogout}
              >
                <AppIcon name="logout" size={18} /> {t('auth.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
