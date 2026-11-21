import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { inventoryService } from '@/services/inventoryService'
import { useToast } from '@/hooks/useToast'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { formatUsd, formatNumber, formatDate, daysUntil, thumb } from '@/utils/formatters'
import PageHeader from '@/components/shared/PageHeader'
import Pagination from '@/components/shared/Pagination'
import EmptyState from '@/components/shared/EmptyState'
import AppIcon from '@/components/ui/AppIcon'

const FILTERS = ['all', 'low', 'out', 'expiring']

export default function InventoryPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language || 'km'
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const errorMessage = useApiErrorMessage()

  const activeFilter = FILTERS.includes(searchParams.get('filter')) ? searchParams.get('filter') : 'all'
  const activeQ = searchParams.get('q') || ''
  const activePage = Number(searchParams.get('page') || 0) || 0

  useEffect(() => {
    document.title = `${t('nav.inventory')} | Vimean Baby Admin`
  }, [t])

  const [searchInput, setSearchInput] = useState(activeQ)
  const debounceTimer = useRef(null)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [drafts, setDrafts] = useState({})
  const [savingId, setSavingId] = useState(null)

  const updateQuery = useCallback((patch) => {
    setSearchParams((prev) => {
      const current = Object.fromEntries(prev.entries())
      const merged = {
        filter: activeFilter,
        q: activeQ,
        page: 0,
        ...current,
        ...patch,
      }
      const next = {}
      if (merged.filter && merged.filter !== 'all') next.filter = merged.filter
      if (merged.q) next.q = merged.q
      if (merged.page) next.page = String(merged.page)
      return next
    }, { replace: true })
  }, [activeFilter, activeQ, setSearchParams])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchInput(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      updateQuery({ q: val.trim() })
    }, 350)
  }

  const loadInventory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await inventoryService.getInventory({
        filter: activeFilter,
        q: activeQ || undefined,
        page: activePage,
        size: 25,
      })
      setData(res)
      setDrafts({})
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [activeFilter, activeQ, activePage])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  function draftValue(item) {
    return drafts[item.variantId] !== undefined ? drafts[item.variantId] : item.stockQty
  }

  function isDirty(item) {
    const value = drafts[item.variantId]
    return value !== undefined && value !== null && value !== item.stockQty
  }

  function setDraft(item, raw) {
    const val = raw === '' ? null : Math.max(0, Math.floor(Number(raw)))
    setDrafts((prev) => ({
      ...prev,
      [item.variantId]: val,
    }))
  }

  async function saveStock(e, item) {
    e.preventDefault()
    const value = drafts[item.variantId]
    if (value === undefined || value === null || Number.isNaN(value)) return
    setSavingId(item.variantId)
    try {
      const updated = await inventoryService.updateStock(item.variantId, value)
      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          content: prev.content.map((it) => (it.variantId === item.variantId ? { ...it, stockQty: updated.stockQty } : it)),
        }
      })
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[item.variantId]
        return next
      })
      toast.success(t('inventory.stockSaved', { sku: item.sku }))
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSavingId(null)
    }
  }

  function stockBadge(item) {
    if (item.stockQty <= 0) return 'badge-danger'
    if (item.stockQty <= 5) return 'badge-pending'
    return 'badge-success'
  }

  function expiryBadge(item) {
    const days = daysUntil(item.expiryDate)
    if (days === null) return ''
    if (days < 0) return 'badge-danger'
    if (days <= 60) return 'badge-pending'
    return 'badge-neutral'
  }

  return (
    <div>
      <PageHeader title={t('nav.inventory')} description={t('inventory.subtitle')} />

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line/70 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-surface p-1" role="tablist">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  activeFilter === filter
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
                onClick={() => updateQuery({ filter })}
              >
                {t(`inventory.filters.${filter}`)}
              </button>
            ))}
          </div>
          <label className="relative lg:w-80">
            <span className="sr-only">{t('common.search')}</span>
            <AppIcon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={searchInput}
              onChange={handleSearchChange}
              type="search"
              className="field-input pl-10"
              placeholder={t('inventory.searchPlaceholder')}
            />
          </label>
        </div>

        {error ? (
          <div className="p-6">
            <EmptyState icon="alert" title={t('errors.loadTitle')} description={errorMessage(error)}>
              <button type="button" className="btn-primary" onClick={loadInventory}>
                {t('common.retry')}
              </button>
            </EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">{t('products.product')}</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3 text-right">{t('products.price')}</th>
                  <th className="px-4 py-3">{t('products.expiryDate')}</th>
                  <th className="px-4 py-3">{t('inventory.onHand')}</th>
                  <th className="px-4 py-3">{t('inventory.adjust')}</th>
                </tr>
              </thead>
              {loading && !data ? (
                <tbody aria-busy="true">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <tr key={i}>
                      <td colSpan={6} className="table-cell">
                        <div className="h-10 animate-pulse rounded-lg bg-surface" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : data?.content?.length ? (
                <tbody className={loading ? 'opacity-60' : ''}>
                  {data.content.map((item) => (
                    <tr key={item.variantId} className="hover:bg-surface/60">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white">
                            {item.imageUrl ? (
                              <img src={thumb(item.imageUrl, 80)} alt="" className="h-full w-full object-contain" />
                            ) : (
                              <AppIcon name="photo" size={18} className="text-ink-muted" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/products/${item.productId}`}
                              className="block max-w-xs truncate font-semibold text-ink hover:text-brand"
                            >
                              {locale === 'km' ? item.productNameKm || item.productNameEn : item.productNameEn}
                            </Link>
                            <p className="text-xs text-ink-muted">
                              {item.optionName}
                              {!item.active && <span className="badge-neutral ml-1">{t('common.inactive')}</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell font-mono text-xs">{item.sku}</td>
                      <td className="table-cell text-right font-semibold">{formatUsd(item.price)}</td>
                      <td className="table-cell">
                        {item.expiryDate ? (
                          <span className={expiryBadge(item)}>{formatDate(item.expiryDate, locale)}</span>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className={stockBadge(item)}>{formatNumber(item.stockQty)}</span>
                      </td>
                      <td className="table-cell">
                        <form className="flex items-center gap-2" onSubmit={(e) => saveStock(e, item)}>
                          <input
                            value={draftValue(item) ?? ''}
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            className="field-input w-24"
                            aria-label={t('inventory.newStockFor', { sku: item.sku })}
                            onChange={(e) => setDraft(item, e.target.value)}
                          />
                          <button
                            type="submit"
                            className="btn-primary min-h-9 px-3"
                            disabled={!isDirty(item) || savingId === item.variantId}
                          >
                            {t('common.save')}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={activeFilter === 'all' ? 'inventory' : 'check'}
                        title={activeFilter === 'all' ? t('common.noResults') : t(`inventory.empty.${activeFilter}`)}
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
