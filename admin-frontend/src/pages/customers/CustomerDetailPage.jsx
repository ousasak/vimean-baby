import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { customerService } from '@/services/customerService'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { formatDate, formatDateTime, initials } from '@/utils/formatters'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import AppIcon from '@/components/ui/AppIcon'

export default function CustomerDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language || 'km'
  const { id } = useParams()
  const toast = useToast()
  const { confirm } = useConfirm()
  const errorMessage = useApiErrorMessage()

  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  const loadCustomer = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await customerService.getCustomer(id)
      setCustomer(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadCustomer()
  }, [loadCustomer])

  useEffect(() => {
    document.title = `${customer?.fullName ?? t('nav.customers')} | Vimean Baby Admin`
  }, [customer, t])

  async function toggleStatus() {
    if (!customer) return
    const disabling = customer.active
    const ok = await confirm({
      title: disabling ? t('customers.disableTitle') : t('customers.enableTitle'),
      message: disabling
        ? t('customers.disableMessage', { name: customer.fullName })
        : t('customers.enableMessage', { name: customer.fullName }),
      confirmLabel: disabling ? t('customers.disable') : t('customers.enable'),
      danger: disabling,
    })
    if (!ok) return
    setUpdating(true)
    try {
      const updated = await customerService.updateCustomerStatus(id, !disabling)
      setCustomer(updated)
      toast.success(disabling ? t('customers.disabledToast') : t('customers.enabledToast'))
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={customer?.fullName ?? t('nav.customers')}
        breadcrumb={
          <Link to="/customers" className="mb-1 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
            <AppIcon name="chevronLeft" size={16} /> {t('nav.customers')}
          </Link>
        }
        actions={
          customer ? (
            <button
              type="button"
              className={customer.active ? 'btn-danger' : 'btn-primary'}
              disabled={updating}
              onClick={toggleStatus}
            >
              {customer.active ? t('customers.disable') : t('customers.enable')}
            </button>
          ) : null
        }
      />

      {error ? (
        <div className="card p-6">
          <EmptyState icon="alert" title={t('errors.loadTitle')} description={errorMessage(error)}>
            <Link to="/customers" className="btn-secondary">
              {t('nav.customers')}
            </Link>
          </EmptyState>
        </div>
      ) : loading || !customer ? (
        <div className="grid gap-6 lg:grid-cols-3" aria-busy="true">
          <div className="card h-64 animate-pulse" />
          <div className="card h-64 animate-pulse lg:col-span-2" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card p-6">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
                {initials(customer.fullName)}
              </span>
              <h2 className="mt-4 text-lg font-bold text-ink">{customer.fullName}</h2>
              <span className={`mt-2 ${customer.active ? 'badge-success' : 'badge-danger'}`}>
                {customer.active ? t('common.active') : t('customers.disabled')}
              </span>
            </div>
            <dl className="mt-6 space-y-4 border-t border-line/70 pt-5 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{t('customers.email')}</dt>
                <dd className="mt-0.5 break-all">
                  <a href={`mailto:${customer.email}`} className="text-ink hover:text-brand">
                    {customer.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{t('customers.phone')}</dt>
                <dd className="mt-0.5">
                  <a href={`tel:${customer.phone}`} className="text-ink hover:text-brand">
                    {customer.phone}
                  </a>
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{t('customers.dateOfBirth')}</dt>
                  <dd className="mt-0.5">{formatDate(customer.dateOfBirth, locale)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{t('customers.gender')}</dt>
                  <dd className="mt-0.5">{customer.gender ? t(`customers.genders.${customer.gender}`) : '—'}</dd>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{t('customers.joined')}</dt>
                  <dd className="mt-0.5">{formatDate(customer.createdAt, locale)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{t('customers.lastLogin')}</dt>
                  <dd className="mt-0.5">{formatDateTime(customer.lastLoginAt, locale)}</dd>
                </div>
              </div>
            </dl>
          </section>

          <div className="space-y-6 lg:col-span-2">
            <section className="card overflow-hidden">
              <header className="border-b border-line/70 px-5 py-4">
                <h2 className="font-bold text-ink">{t('customers.addresses', { count: customer.addresses?.length ?? 0 })}</h2>
              </header>
              {!customer.addresses?.length ? (
                <EmptyState icon="customers" title={t('customers.noAddresses')} />
              ) : (
                <ul className="grid gap-3 p-4 sm:grid-cols-2">
                  {customer.addresses.map((address) => (
                    <li
                      key={address.id}
                      className={`rounded-xl border p-4 text-sm ${
                        address.defaultAddress ? 'border-brand-light bg-brand-tint/30' : 'border-line/80'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="font-semibold text-ink">{address.receiverName}</p>
                        {address.defaultAddress && <span className="badge-brand">{t('customers.default')}</span>}
                      </div>
                      <p className="text-ink-muted">{address.phone}</p>
                      <p className="text-ink-muted">{address.streetDetail}</p>
                      <p className="text-ink-muted">{address.commune}, {address.district}, {address.province}</p>
                      {address.note && <p className="mt-2 text-xs text-ink-muted">{t('customers.note')}: {address.note}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card overflow-hidden">
              <header className="border-b border-line/70 px-5 py-4">
                <h2 className="font-bold text-ink">{t('customers.orderHistory')}</h2>
              </header>
              <EmptyState icon="orders" title={t('orders.comingTitle')} description={t('customers.ordersComing')} />
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
