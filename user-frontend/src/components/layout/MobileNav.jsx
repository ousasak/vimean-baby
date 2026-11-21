import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useAuth } from '@/hooks/useAuth'
import { initials } from '@/utils/format'

export default function MobileNav({ open, links = [], onClose }) {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!open) return null

  const handleLogout = () => {
    onClose()
    auth.logout()
    navigate(localePath('/'))
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        className="absolute inset-0 bg-ink/40"
        type="button"
        aria-label={t('nav.home')}
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-soft dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 dark:border-slate-800">
          <Link to={localePath('/')} onClick={onClose}>
            <img src="/logo.svg" alt={t('app.name')} className="h-10 w-auto dark:hidden" width="166" height="40" />
            <img src="/logo-dark.svg" alt={t('app.name')} className="hidden h-10 w-auto dark:block" width="166" height="40" />
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-sm text-ink dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="block rounded-2xl px-4 py-3 text-sm font-semibold text-ink hover:bg-cream dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 border-t border-line px-5 py-4 dark:border-slate-800">
          {auth.isLoggedIn ? (
            <>
              <Link
                to={localePath('/account')}
                className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-800"
                onClick={(e) => {
                  onClose()
                  if (location.pathname === '/account') e.preventDefault()
                }}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-brand text-sm font-bold text-white dark:border-slate-700 flex items-center justify-center">
                  {auth.user?.avatarUrl ? (
                    <img
                      src={auth.user.avatarUrl}
                      alt={auth.user.fullName || 'User'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials(auth.user?.fullName)
                  )}
                </div>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{auth.user?.fullName}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{t('nav.account')}</span>
                </span>
              </Link>
              <button
                type="button"
                className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-muted hover:bg-cream hover:text-danger dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                onClick={handleLogout}
              >
                {t('account.logout')}
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to={localePath('/login')} className="btn-primary" onClick={onClose}>
                {t('auth.signIn')}
              </Link>
              <Link to={localePath('/register')} className="btn-ghost" onClick={onClose}>
                {t('auth.register')}
              </Link>
            </div>
          )}
        </div>

        <div className="border-t border-line px-5 py-4 dark:border-slate-800">
          <p className="rounded-full bg-cream px-3 py-2 text-center text-xs text-muted dark:bg-slate-800 dark:text-slate-400">
            {t('locale.cambodia')}
          </p>
        </div>
      </aside>
    </div>
  )
}
