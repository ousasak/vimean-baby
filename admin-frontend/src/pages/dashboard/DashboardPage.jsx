import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiClient from '@/api/client'
import { useAuth } from '@/hooks/useAuth'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { formatUsd, formatNumber, formatDate, daysUntil, initials, thumb } from '@/utils/formatters'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import EmptyState from '@/components/shared/EmptyState'
import AppIcon from '@/components/ui/AppIcon'

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language || 'km'
  const { user } = useAuth()
  const errorMessage = useApiErrorMessage()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = `${t('nav.dashboard')} | Vimean Baby Admin`
  }, [t])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return t('dashboard.greeting.morning')
    if (hour < 18) return t('dashboard.greeting.afternoon')
    return t('dashboard.greeting.evening')
  }, [t])

  const today = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date())
    } catch {
      return new Date().toLocaleDateString()
    }
  }, [locale])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/admin/dashboard')
      setData(res)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const signupMax = useMemo(() => {
    const list = data?.signups || []
    return Math.max(1, ...(list.map((d) => d.count || 0) || [0]))
  }, [data])

  const signupTotal = useMemo(() => {
    return (data?.signups || []).reduce((sum, d) => sum + (d.count || 0), 0)
  }, [data])

  const categoryMax = useMemo(() => {
    const list = data?.productsByCategory || []
    return Math.max(1, ...(list.map((c) => c.count || 0) || [0]))
  }, [data])

  function barHeight(count) {
    return Math.max(3, ((count || 0) / signupMax) * 96)
  }

  function dayLabel(iso) {
    if (!iso) return ''
    try {
      return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-GB', {
        day: 'numeric',
        month: 'short',
      }).format(new Date(`${iso}T00:00:00`))
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${user?.fullName?.split(' ')[0] ?? ''}`}
        description={today}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary"
              disabled={loading}
              onClick={loadDashboard}
            >
              <AppIcon name="refresh" size={16} className={loading ? 'animate-spin' : ''} />
              {t('common.refresh')}
            </button>
            <Link to="/products/new" className="btn-primary">
              <AppIcon name="plus" size={16} /> {t('products.add')}
            </Link>
          </div>
        }
      />

      {error ? (
        <div className="card p-6">
          <EmptyState icon="alert" title={t('errors.loadTitle')} description={errorMessage(error)}>
            <button type="button" className="btn-primary" onClick={loadDashboard}>
              {t('common.retry')}
            </button>
          </EmptyState>
        </div>
      ) : loading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="card h-28 animate-pulse bg-white" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Orders notice banner */}
          <div className="flex items-start gap-3 rounded-2xl border border-line/70 bg-white px-4 py-3 text-sm text-ink-muted">
            <AppIcon name="orders" size={18} className="mt-0.5 text-brand shrink-0" />
            <p>{t('dashboard.ordersNotice')}</p>
          </div>

          {/* 4 Top Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title={t('dashboard.stats.inventoryValue')}
              value={formatUsd(data.inventory?.inventoryValue ?? 0)}
              hint={t('dashboard.stats.units', { count: formatNumber(data.inventory?.stockUnits ?? 0) })}
              icon="money"
              to="/inventory"
            />
            <StatCard
              title={t('dashboard.stats.products')}
              value={formatNumber(data.catalog?.products ?? 0)}
              hint={t('dashboard.stats.publishedDrafts', {
                published: formatNumber(data.catalog?.published ?? 0),
                drafts: formatNumber(data.catalog?.drafts ?? 0),
              })}
              icon="products"
              to="/products"
            />
            <StatCard
              title={t('dashboard.stats.customers')}
              value={formatNumber(data.customers?.total ?? 0)}
              hint={t('dashboard.stats.newCustomers', {
                count: formatNumber(data.customers?.newLast30Days ?? 0),
              })}
              icon="customers"
              to="/customers"
            />
            <StatCard
              title={t('dashboard.stats.attention')}
              value={formatNumber(
                (data.inventory?.lowStock ?? 0) +
                (data.inventory?.outOfStock ?? 0) +
                (data.inventory?.expiringSoon ?? 0)
              )}
              hint={t('dashboard.stats.attentionHint', {
                low: data.inventory?.lowStock ?? 0,
                out: data.inventory?.outOfStock ?? 0,
                expiring: data.inventory?.expiringSoon ?? 0,
              })}
              icon="alert"
              to="/inventory?filter=low"
            />
          </div>

          {/* Signups Chart & Catalog Health */}
          <div className="grid gap-6 xl:grid-cols-3">
            <section className="card p-5 xl:col-span-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="font-bold text-ink">{t('dashboard.signups.title')}</h2>
                  <p className="text-xs text-ink-muted">{t('dashboard.signups.subtitle')}</p>
                </div>
                <p className="text-2xl font-bold text-ink">{formatNumber(signupTotal)}</p>
              </div>
              <svg
                className="mt-6 h-44 w-full"
                viewBox={`0 0 ${(data.signups?.length || 14) * 10} 100`}
                preserveAspectRatio="none"
                role="img"
                aria-label={t('dashboard.signups.title')}
              >
                {(data.signups || []).map((day, index) => (
                  <rect
                    key={day.date}
                    x={index * 10 + 1.5}
                    y={100 - barHeight(day.count)}
                    width="7"
                    height={barHeight(day.count)}
                    rx="1"
                    className={day.count ? 'fill-brand hover:fill-brand-light' : 'fill-line'}
                  >
                    <title>{dayLabel(day.date)}: {day.count}</title>
                  </rect>
                ))}
              </svg>
              <div className="mt-2 flex text-[10px] text-ink-muted">
                {(data.signups || []).map((day, index) => (
                  <span key={day.date} className="flex-1 truncate text-center">
                    {index % 2 === 0 ? dayLabel(day.date) : ''}
                  </span>
                ))}
              </div>
            </section>

            <section className="card p-5">
              <h2 className="font-bold text-ink">{t('dashboard.catalogHealth')}</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">{t('nav.categories')}</dt>
                  <dd className="font-semibold">{formatNumber(data.catalog?.categories ?? 0)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">{t('nav.brands')}</dt>
                  <dd className="font-semibold">{formatNumber(data.catalog?.brands ?? 0)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">{t('dashboard.sellableVariants')}</dt>
                  <dd className="font-semibold">{formatNumber(data.inventory?.sellableVariants ?? 0)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">{t('inventory.filters.low')}</dt>
                  <dd>
                    <span className={data.inventory?.lowStock ? 'badge-pending' : 'badge-success'}>
                      {data.inventory?.lowStock ?? 0}
                    </span>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">{t('inventory.filters.out')}</dt>
                  <dd>
                    <span className={data.inventory?.outOfStock ? 'badge-danger' : 'badge-success'}>
                      {data.inventory?.outOfStock ?? 0}
                    </span>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">{t('inventory.filters.expiring')}</dt>
                  <dd>
                    <span className={data.inventory?.expiringSoon ? 'badge-pending' : 'badge-success'}>
                      {data.inventory?.expiringSoon ?? 0}
                    </span>
                  </dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-line/70 pt-3 text-xs text-ink-muted">
                {t('dashboard.thresholds', {
                  threshold: data.inventory?.lowStockThreshold ?? 5,
                  days: data.inventory?.expiryWarningDays ?? 60,
                })}
              </p>
            </section>
          </div>

          {/* Low stock & Expiring alerts */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Low stock items */}
            <section className="card overflow-hidden">
              <header className="flex items-center justify-between border-b border-line/70 px-5 py-4">
                <h2 className="font-bold text-ink">{t('dashboard.lowStock')}</h2>
                <Link to="/inventory?filter=low" className="text-sm font-semibold text-brand-light hover:text-brand">
                  {t('common.viewAll')}
                </Link>
              </header>
              {!(data.lowStockItems?.length) ? (
                <EmptyState icon="check" title={t('dashboard.allStocked')} />
              ) : (
                <ul>
                  {data.lowStockItems.map((item) => (
                    <li key={item.variantId} className="flex items-center gap-3 border-t border-line/50 px-5 py-3 first:border-t-0">
                      {item.imageUrl ? (
                        <img src={thumb(item.imageUrl, 80)} alt="" className="h-10 w-10 rounded-lg border border-line object-contain" loading="lazy" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-white">
                          <AppIcon name="photo" size={18} className="text-ink-muted" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <Link to={`/products/${item.productId}`} className="block truncate text-sm font-semibold text-ink hover:text-brand">
                          {locale === 'km' ? item.productNameKm || item.productNameEn : item.productNameEn}
                        </Link>
                        <p className="truncate text-xs text-ink-muted">{item.sku} · {item.optionName}</p>
                      </div>
                      <span className={item.stockQty <= 0 ? 'badge-danger' : 'badge-pending'}>
                        {t('inventory.left', { count: item.stockQty })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Expiring soon items */}
            <section className="card overflow-hidden">
              <header className="flex items-center justify-between border-b border-line/70 px-5 py-4">
                <h2 className="font-bold text-ink">{t('dashboard.expiring')}</h2>
                <Link to="/inventory?filter=expiring" className="text-sm font-semibold text-brand-light hover:text-brand">
                  {t('common.viewAll')}
                </Link>
              </header>
              {!(data.expiringItems?.length) ? (
                <EmptyState
                  icon="check"
                  title={t('dashboard.noExpiring')}
                  description={t('dashboard.noExpiringHint', { days: data.inventory?.expiryWarningDays ?? 60 })}
                />
              ) : (
                <ul>
                  {data.expiringItems.map((item) => {
                    const days = daysUntil(item.expiryDate)
                    return (
                      <li key={item.variantId} className="flex items-center gap-3 border-t border-line/50 px-5 py-3 first:border-t-0">
                        {item.imageUrl ? (
                          <img src={thumb(item.imageUrl, 80)} alt="" className="h-10 w-10 rounded-lg border border-line object-contain" loading="lazy" />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-white">
                            <AppIcon name="photo" size={18} className="text-ink-muted" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <Link to={`/products/${item.productId}`} className="block truncate text-sm font-semibold text-ink hover:text-brand">
                            {locale === 'km' ? item.productNameKm || item.productNameEn : item.productNameEn}
                          </Link>
                          <p className="truncate text-xs text-ink-muted">{item.sku} · {formatDate(item.expiryDate, locale)}</p>
                        </div>
                        <span className={(days ?? 0) < 0 ? 'badge-danger' : 'badge-pending'}>
                          {t('inventory.daysLeft', { count: days ?? 0 })}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* 3-column lower grid: Products by Category, Recent Products, Recent Customers */}
          <div className="grid gap-6 xl:grid-cols-3">
            {/* Products by Category */}
            <section className="card p-5">
              <h2 className="font-bold text-ink">{t('dashboard.byCategory')}</h2>
              <ul className="mt-4 space-y-3">
                {(data.productsByCategory || []).map((row) => (
                  <li key={row.name}>
                    <div className="flex justify-between text-sm">
                      <span className="truncate text-ink">{row.name}</span>
                      <span className="font-semibold text-ink">{formatNumber(row.count)}</span>
                    </div>
                    <svg className="mt-1 h-1.5 w-full rounded-full" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true">
                      <rect width="100" height="2" className="fill-surface" />
                      <rect
                        width={Math.min(100, (row.count / categoryMax) * 100)}
                        height="2"
                        className="fill-brand-light"
                      />
                    </svg>
                  </li>
                ))}
              </ul>
            </section>

            {/* Recent Products */}
            <section className="card overflow-hidden">
              <header className="flex items-center justify-between border-b border-line/70 px-5 py-4">
                <h2 className="font-bold text-ink">{t('dashboard.recentProducts')}</h2>
                <Link to="/products" className="text-sm font-semibold text-brand-light hover:text-brand">
                  {t('common.viewAll')}
                </Link>
              </header>
              {!(data.recentProducts?.length) ? (
                <EmptyState icon="products" title={t('products.empty')} />
              ) : (
                <ul>
                  {data.recentProducts.map((product) => (
                    <li key={product.id} className="border-t border-line/50 px-5 py-3 first:border-t-0">
                      <Link to={`/products/${product.id}`} className="block truncate text-sm font-semibold text-ink hover:text-brand">
                        {locale === 'km' ? product.nameKm || product.nameEn : product.nameEn}
                      </Link>
                      <p className="text-xs text-ink-muted">{product.categoryName} · {formatDate(product.createdAt, locale)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Recent Customers */}
            <section className="card overflow-hidden">
              <header className="flex items-center justify-between border-b border-line/70 px-5 py-4">
                <h2 className="font-bold text-ink">{t('dashboard.recentCustomers')}</h2>
                <Link to="/customers" className="text-sm font-semibold text-brand-light hover:text-brand">
                  {t('common.viewAll')}
                </Link>
              </header>
              {!(data.recentCustomers?.length) ? (
                <EmptyState icon="customers" title={t('customers.empty')} />
              ) : (
                <ul>
                  {data.recentCustomers.map((customer) => (
                    <li key={customer.id} className="flex items-center gap-3 border-t border-line/50 px-5 py-3 first:border-t-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-ink">
                        {initials(customer.fullName)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link to={`/customers/${customer.id}`} className="block truncate text-sm font-semibold text-ink hover:text-brand">
                          {customer.fullName}
                        </Link>
                        <p className="truncate text-xs text-ink-muted">{formatDate(customer.createdAt, locale)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
