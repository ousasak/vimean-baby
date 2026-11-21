import React, { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Package,
  MapPin,
  ShieldCheck,
  Edit3,
  ChevronRight,
  Plus,
} from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useAuth } from '@/hooks/useAuth'
import accountService from '@/services/accountService'
import { formatDate } from '@/utils/format'
import AlertBanner from '@/components/common/AlertBanner'
import AccountSection from './components/AccountSection'
import AddressSummary from './components/AddressSummary'
import AvatarUpload from './components/AvatarUpload'

export default function AccountOverviewPage() {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const [searchParams] = useSearchParams()
  const auth = useAuth()

  const showWelcome = searchParams.get('welcome') === '1'

  useEffect(() => {
    document.title = `${t('account.nav.overview')} | ${t('app.name')}`
  }, [t])

  const {
    data: addresses = [],
    isLoading,
    isError,
    refetch: fetchAddresses,
  } = useQuery({
    queryKey: ['accountAddresses'],
    queryFn: async () => {
      const data = await accountService.getAddresses()
      return Array.isArray(data) ? data : []
    },
  })

  // Get orders count
  const orderCount = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('vb_orders') || '[]')
      return Array.isArray(stored) ? stored.length : 0
    } catch {
      return 0
    }
  }, [])

  const addressList = Array.isArray(addresses) ? addresses : []

  const defaultAddress = useMemo(() => {
    return addressList.find((a) => a.defaultAddress) ?? null
  }, [addressList])

  const user = auth.user

  const tiles = useMemo(() => [
    {
      to: localePath('/account/orders'),
      title: t('account.nav.orders'),
      body: t('account.tiles.orders'),
      count: orderCount,
      Icon: Package,
      badgeText: orderCount > 0 ? `${orderCount}` : '0',
    },
    {
      to: localePath('/account/addresses'),
      title: t('account.nav.addresses'),
      body: t('account.tiles.addresses', { count: addressList.length }),
      count: addressList.length,
      Icon: MapPin,
      badgeText: `${addressList.length}`,
    },
    {
      to: localePath('/account/security'),
      title: t('account.nav.security'),
      body: t('account.tiles.security'),
      Icon: ShieldCheck,
      badgeText: '✓',
    },
  ], [localePath, t, addressList.length, orderCount])

  return (
    <div className="space-y-6">
      {showWelcome && (
        <AlertBanner variant="success" message={t('account.welcomeNew')} />
      )}

      {/* Signature Brand Red Banner (Consistent with Vimean Baby theme) */}
      <section className="relative overflow-hidden rounded-[1.5rem] bg-brand p-6 text-white shadow-soft sm:p-8">
        {/* Background decorative circles */}
        <div
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-20 -bottom-10 h-28 w-28 rounded-full bg-white/5 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Single Avatar Upload with camera badge on red banner */}
            <AvatarUpload size="xl" variant="banner" showHint={false} />

            <div className="text-center sm:text-left">
              <p className="text-sm text-white/85">{t('account.hello')}</p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl text-white">
                {user?.fullName}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-white/85">
                {t('account.memberSince', {
                  date: formatDate(user?.createdAt, locale) || 'November 19, 2026',
                })}
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="flex justify-center sm:justify-end shrink-0">
            <Link
              to={localePath('/account/profile')}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/15 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-white/25 border border-white/20"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{t('account.edit')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Stat Cards (Consistent with Vimean Baby store design) */}
      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map((tile) => {
          const Icon = tile.Icon
          return (
            <Link
              key={tile.to}
              to={tile.to}
              className="group flex flex-col justify-between rounded-[1.5rem] border border-line bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-light"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blush-tint px-2.5 py-1 text-xs font-bold text-ink">
                    {tile.badgeText}
                  </span>
                </div>
                <p className="mt-4 font-semibold text-ink group-hover:text-brand transition">
                  {tile.title}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {tile.body}
                </p>
              </div>

              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-light group-hover:text-brand">
                {t('account.manage')} →
              </span>
            </Link>
          )
        })}
      </div>

      {/* Grid: Personal Info & Default Shipping Address */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Personal Info */}
        <AccountSection
          title={t('account.personalInfo')}
          actions={
            <Link
              to={localePath('/account/profile')}
              className="text-sm font-semibold text-brand-light hover:text-brand"
            >
              {t('account.edit')}
            </Link>
          }
        >
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t('auth.email')}</dt>
              <dd className="truncate font-medium text-ink">{user?.email || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t('auth.phone')}</dt>
              <dd className="font-medium text-ink">{user?.phone || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t('account.dateOfBirth')}</dt>
              <dd className="font-medium text-ink">
                {formatDate(user?.dateOfBirth, locale) || '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">ភេទ (Gender)</dt>
              <dd className="font-medium text-ink">
                {user?.gender ? t(`account.genders.${user.gender}`) : '—'}
              </dd>
            </div>
          </dl>
        </AccountSection>

        {/* Default Shipping Address */}
        <AccountSection
          title={t('account.defaultAddress')}
          actions={
            <Link
              to={localePath('/account/addresses')}
              className="text-sm font-semibold text-brand-light hover:text-brand"
            >
              {t('account.manage')}
            </Link>
          }
        >
          {isLoading ? (
            <div className="space-y-2" aria-busy="true">
              <div className="h-4 w-1/2 animate-pulse rounded bg-line" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-line" />
            </div>
          ) : isError ? (
            <div className="space-y-3">
              <AlertBanner variant="error" message={t('errors.GENERIC')} />
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() => fetchAddresses()}
              >
                {t('common.retry')}
              </button>
            </div>
          ) : defaultAddress ? (
            <AddressSummary address={defaultAddress} />
          ) : (
            <div className="text-sm text-muted">
              <p>{t('account.noAddress')}</p>
              <Link
                to={localePath('/account/addresses')}
                className="btn-ghost mt-4 inline-flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>{t('account.addAddress')}</span>
              </Link>
            </div>
          )}
        </AccountSection>
      </div>
    </div>
  )
}
