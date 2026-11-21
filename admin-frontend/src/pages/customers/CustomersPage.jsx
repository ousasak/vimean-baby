import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { customerService } from '@/services/customerService'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { formatNumber, formatDate, formatDateTime, initials } from '@/utils/formatters'
import PageHeader from '@/components/shared/PageHeader'
import Pagination from '@/components/shared/Pagination'
import EmptyState from '@/components/shared/EmptyState'
import AppIcon from '@/components/ui/AppIcon'

export default function CustomersPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language || 'km'
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const errorMessage = useApiErrorMessage()

  const activeQ = searchParams.get('q') || ''
  const activeStatus = searchParams.get('status') || ''
  const activePage = Number(searchParams.get('page') || 0) || 0

  useEffect(() => {
    document.title = `${t('nav.customers')} | Vimean Baby Admin`
  }, [t])

  const [searchInput, setSearchInput] = useState(activeQ)
  const debounceTimer = useRef(null)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const updateQuery = useCallback((patch) => {
    setSearchParams((prev) => {
      const current = Object.fromEntries(prev.entries())
      const merged = {
        q: activeQ,
        status: activeStatus,
        page: 0,
        ...current,
        ...patch,
      }
      const next = {}
      if (merged.q) next.q = merged.q
      if (merged.status) next.status = merged.status
      if (merged.page) next.page = String(merged.page)
      return next
    }, { replace: true })
  }, [activeQ, activeStatus, setSearchParams])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchInput(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      updateQuery({ q: val.trim() })
    }, 350)
  }

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await customerService.getCustomers({
        q: activeQ || undefined,
        status: activeStatus || undefined,
        page: activePage,
        size: 20,
      })
      setData(res)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [activeQ, activeStatus, activePage])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  return (
    <div>
      <PageHeader
        title={t('nav.customers')}
        description={t('customers.subtitle', { count: formatNumber(data?.totalElements ?? 0) })}
      />

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line/70 p-4 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">{t('common.search')}</span>
            <AppIcon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={searchInput}
              onChange={handleSearchChange}
              type="search"
              className="field-input pl-10"
              placeholder={t('customers.searchPlaceholder')}
            />
          </label>
          <select
            className="field-input sm:w-44"
            value={activeStatus}
            aria-label={t('common.status')}
            onChange={(e) => updateQuery({ status: e.target.value })}
          >
            <option value="">{t('common.allStatuses')}</option>
            <option value="active">{t('common.active')}</option>
            <option value="disabled">{t('customers.disabled')}</option>
          </select>
        </div>

        {error ? (
          <div className="p-6">
            <EmptyState icon="alert" title={t('errors.loadTitle')} description={errorMessage(error)}>
              <button type="button" className="btn-primary" onClick={loadCustomers}>
                {t('common.retry')}
              </button>
            </EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">{t('customers.customer')}</th>
                  <th className="px-4 py-3">{t('customers.phone')}</th>
                  <th className="px-4 py-3">{t('customers.joined')}</th>
                  <th className="px-4 py-3">{t('customers.lastLogin')}</th>
                  <th className="px-4 py-3">{t('common.status')}</th>
                </tr>
              </thead>
              {loading && !data ? (
                <tbody aria-busy="true">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <tr key={i}>
                      <td colSpan={5} className="table-cell">
                        <div className="h-10 animate-pulse rounded-lg bg-surface" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : data?.content?.length ? (
                <tbody className={loading ? 'opacity-60' : ''}>
                  {data.content.map((customer) => (
                    <tr
                      key={customer.id}
                      className="cursor-pointer hover:bg-surface/60"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-ink">
                            {initials(customer.fullName)}
                          </span>
                          <div className="min-w-0">
                            <Link
                              to={`/customers/${customer.id}`}
                              className="block truncate font-semibold text-ink hover:text-brand"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {customer.fullName}
                            </Link>
                            <p className="truncate text-xs text-ink-muted">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">{customer.phone}</td>
                      <td className="table-cell text-ink-muted">{formatDate(customer.createdAt, locale)}</td>
                      <td className="table-cell text-ink-muted">{formatDateTime(customer.lastLoginAt, locale)}</td>
                      <td className="table-cell">
                        <span className={customer.active ? 'badge-success' : 'badge-danger'}>
                          {customer.active ? t('common.active') : t('customers.disabled')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        icon="customers"
                        title={activeQ || activeStatus ? t('common.noResults') : t('customers.empty')}
                        description={activeQ || activeStatus ? t('common.tryOtherFilters') : t('customers.emptyHint')}
                      />
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        )}

        {data && (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            size={data.size}
            onChange={(page) => updateQuery({ page })}
          />
        )}
      </div>
    </div>
  )
}
