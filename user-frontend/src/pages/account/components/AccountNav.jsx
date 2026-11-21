import React, { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  Package,
  MapPin,
  ShieldCheck,
  LogOut,
} from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useAuth } from '@/hooks/useAuth'
import { initials } from '@/utils/format'

export default function AccountNav() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const route = useLocation()
  const auth = useAuth()
  const navigate = useNavigate()

  const items = useMemo(() => [
    {
      to: localePath('/account'),
      label: t('account.nav.overview'),
      exact: true,
      Icon: LayoutDashboard,
    },
    {
      to: localePath('/account/profile'),
      label: t('account.nav.profile'),
      exact: false,
      Icon: User,
    },
    {
      to: localePath('/account/orders'),
      label: t('account.nav.orders'),
      exact: false,
      Icon: Package,
    },
    {
      to: localePath('/account/addresses'),
      label: t('account.nav.addresses'),
      exact: false,
      Icon: MapPin,
    },
    {
      to: localePath('/account/security'),
      label: t('account.nav.security'),
      exact: false,
      Icon: ShieldCheck,
    },
  ], [localePath, t])

  function isActive(item) {
    return item.exact ? route.pathname === item.to : route.pathname.startsWith(item.to)
  }

  const handleLogout = () => {
    auth.logout()
    navigate(localePath('/'))
  }

  const user = auth.user
  const avatarUrl = user?.avatarUrl

  return (
    <nav aria-label={t('nav.account')}>
      {/* Desktop Sidebar (Theme consistent with Vimean Baby) */}
      <div className="hidden rounded-[1.5rem] border border-line bg-white p-5 shadow-soft lg:block">
        {/* User Mini Profile Header */}
        <div className="flex items-center gap-3 border-b border-line pb-5">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-brand text-base font-bold text-white shadow-soft flex items-center justify-center border-2 border-white">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.fullName || 'Profile'}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{initials(user?.fullName)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">
              {user?.fullName}
            </p>
            <p className="truncate text-xs text-muted">
              {user?.email || user?.phone}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <ul className="mt-4 space-y-1">
          {items.map((item) => {
            const active = isActive(item)
            const Icon = item.Icon
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={(e) => {
                    if (active) e.preventDefault()
                  }}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-brand-tint text-ink'
                      : 'text-muted hover:bg-cream hover:text-ink'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      active ? 'text-brand' : ''
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Logout */}
        <button
          type="button"
          className="mt-4 flex w-full items-center gap-3 rounded-2xl border-t border-line px-3 pb-1 pt-4 text-sm font-semibold text-muted transition hover:text-danger"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>{t('account.logout')}</span>
        </button>
      </div>

      {/* Mobile Horizontal Tabs */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        {items.map((item) => {
          const active = isActive(item)
          const Icon = item.Icon
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={(e) => {
                if (active) e.preventDefault()
              }}
              className={`shrink-0 flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? 'border-brand bg-brand text-white'
                  : 'border-line bg-white text-ink'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
