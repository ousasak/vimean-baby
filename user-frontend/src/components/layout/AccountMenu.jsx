import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useAuth } from '@/hooks/useAuth'
import { initials } from '@/utils/format'

export default function AccountMenu() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.search])

  const links = useMemo(() => [
    { to: localePath('/account'), label: t('account.nav.overview') },
    { to: localePath('/account/profile'), label: t('account.nav.profile') },
    { to: localePath('/account/orders'), label: t('account.nav.orders') },
    { to: localePath('/account/addresses'), label: t('account.nav.addresses') },
    { to: localePath('/account/security'), label: t('account.nav.security') },
  ], [localePath, t])

  const handleLogout = () => {
    setOpen(false)
    auth.logout()
    navigate(localePath('/'))
  }

  return (
    <div ref={rootRef} className="relative hidden sm:block">
      {!auth.isLoggedIn ? (
        <Link
          to={localePath('/login')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label={t('auth.signIn')}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
          </svg>
        </Link>
      ) : (
        <>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-xs font-bold text-white transition hover:bg-brand/90 overflow-hidden shadow-2xs border border-white/20"
            aria-label={t('nav.account')}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            {auth.user?.avatarUrl ? (
              <img
                src={auth.user.avatarUrl}
                alt={auth.user.fullName || 'User'}
                className="h-full w-full object-cover"
              />
            ) : (
              initials(auth.user?.fullName)
            )}
          </button>
          {open && (
            <div
              className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white shadow-soft dark:border-slate-700 dark:bg-slate-800"
              role="menu"
            >
              <div className="flex items-center gap-3 border-b border-line p-4 dark:border-slate-700">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand text-white border border-white flex items-center justify-center">
                  {auth.user?.avatarUrl ? (
                    <img
                      src={auth.user.avatarUrl}
                      alt={auth.user.fullName || 'User'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold">
                      {initials(auth.user?.fullName)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink dark:text-slate-100">{auth.user?.fullName}</p>
                  <p className="truncate text-xs text-muted dark:text-slate-400">{auth.user?.email || auth.user?.phone}</p>
                </div>
              </div>
              <div className="p-1.5 space-y-0.5">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block rounded-xl px-3.5 py-2 text-sm text-ink hover:bg-cream hover:text-brand dark:text-slate-200 dark:hover:bg-slate-700/60 transition-colors"
                    role="menuitem"
                    onClick={(e) => {
                      setOpen(false)
                      if (location.pathname === link.to) {
                        e.preventDefault()
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-line p-1.5 dark:border-slate-700">
                <button
                  type="button"
                  className="block w-full rounded-xl px-3.5 py-2 text-left text-sm font-semibold text-muted hover:bg-cream hover:text-danger dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-rose-400 transition-colors"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  {t('account.logout')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
