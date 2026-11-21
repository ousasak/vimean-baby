import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { brandService } from '@/services/brandService'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { formatUsd, formatNumber, thumb } from '@/utils/formatters'
import PageHeader from '@/components/shared/PageHeader'
import Pagination from '@/components/shared/Pagination'
import EmptyState from '@/components/shared/EmptyState'
import AppIcon from '@/components/ui/AppIcon'

export default function ProductsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language || 'km'
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const { confirm } = useConfirm()
  const errorMessage = useApiErrorMessage()

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  useEffect(() => {
    document.title = `${t('nav.products')} | Vimean Baby Admin`
    categoryService.getCategories().then((res) => setCategories(res || [])).catch(() => {})
    brandService.getBrands().then((res) => setBrands(res || [])).catch(() => {})
  }, [t])

  const activeQ = searchParams.get('q') || ''
  const activeCategory = searchParams.get('categoryId') || ''
  const activeBrand = searchParams.get('brandId') || ''
  const activePage = Number(searchParams.get('page') || 0) || 0

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
        categoryId: activeCategory,
        brandId: activeBrand,
        page: 0,
        ...current,
        ...patch,
      }
      const next = {}
      if (merged.q) next.q = merged.q
      if (merged.categoryId) next.categoryId = merged.categoryId
      if (merged.brandId) next.brandId = merged.brandId
      if (merged.page) next.page = String(merged.page)
      return next
    }, { replace: true })
  }, [activeQ, activeCategory, activeBrand, setSearchParams])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchInput(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      updateQuery({ q: val.trim() })
    }, 350)
  }

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await productService.getProducts({
        q: activeQ || undefined,
        categoryId: activeCategory ? Number(activeCategory) : undefined,
        brandId: activeBrand ? Number(activeBrand) : undefined,
        page: activePage,
        size: 20,
      })
      setData(res)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [activeQ, activeCategory, activeBrand, activePage])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  async function handleToggleDeactivate(product) {
    if (product.active) {
      const ok = await confirm({
        title: t('products.deactivateTitle'),
        message: t('products.deactivateMessage', { name: product.nameEn }),
        confirmLabel: t('products.deactivate'),
        danger: true,
      })
      if (!ok) return
      try {
        await productService.deleteProduct(product.id)
        toast.success(t('products.deactivated'))
        loadProducts()
      } catch (err) {
        toast.error(errorMessage(err))
      }
    }
  }

  return (
    <div>
      <PageHeader
        title={t('nav.products')}
        description={t('products.subtitle', { count: formatNumber(data?.totalElements ?? 0) })}
        actions={
          <Link to="/products/new" className="btn-primary">
            <AppIcon name="plus" size={16} /> {t('products.add')}
          </Link>
        }
      />

      <div className="card overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-line/70 p-4 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">{t('common.search')}</span>
            <AppIcon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={searchInput}
              onChange={handleSearchChange}
              type="search"
              className="field-input pl-10"
              placeholder={t('products.searchPlaceholder')}
            />
          </label>
          <select
            className="field-input sm:w-48"
            value={activeCategory}
            onChange={(e) => updateQuery({ categoryId: e.target.value })}
            aria-label={t('products.category')}
          >
            <option value="">{t('products.allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {locale === 'km' ? c.nameKm : c.nameEn}
              </option>
            ))}
          </select>
          <select
            className="field-input sm:w-48"
            value={activeBrand}
            onChange={(e) => updateQuery({ brandId: e.target.value })}
            aria-label={t('products.brand')}
          >
            <option value="">{t('products.allBrands')}</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="p-6">
            <EmptyState icon="alert" title={t('errors.loadTitle')} description={errorMessage(error)}>
              <button type="button" className="btn-primary" onClick={loadProducts}>
                {t('common.retry')}
              </button>
            </EmptyState>
          </div>
        ) : loading && !data ? (
          <div className="p-4 space-y-2" aria-busy="true">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-surface" />
            ))}
          </div>
        ) : !data?.content?.length ? (
          <EmptyState
            icon="products"
            title={activeQ || activeCategory || activeBrand ? t('products.noResults') : t('products.empty')}
            description={!activeQ && !activeCategory && !activeBrand ? t('products.emptyHint') : undefined}
          >
            {!activeQ && !activeCategory && !activeBrand && (
              <Link to="/products/new" className="btn-primary">
                {t('products.add')}
              </Link>
            )}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">{t('products.product')}</th>
                  <th className="px-4 py-3">{t('products.category')}</th>
                  <th className="px-4 py-3 text-right">{t('products.price')}</th>
                  <th className="px-4 py-3 text-right">{t('products.stock')}</th>
                  <th className="px-4 py-3">{t('common.status')}</th>
                  <th className="px-4 py-3"><span className="sr-only">{t('common.actions')}</span></th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((p) => {
                  const primaryImg = p.images?.find((img) => img.primaryImage)?.imageUrl || p.images?.[0]?.imageUrl
                  const minPrice = p.variants?.length ? Math.min(...p.variants.map((v) => v.price)) : 0
                  const maxPrice = p.variants?.length ? Math.max(...p.variants.map((v) => v.price)) : 0
                  const totalStock = p.variants?.reduce((sum, v) => sum + (v.stockQty || 0), 0) || 0

                  return (
                    <tr key={p.id} className="hover:bg-surface/60">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white">
                            {primaryImg ? (
                              <img src={thumb(primaryImg, 88)} alt="" className="h-full w-full object-contain" />
                            ) : (
                              <AppIcon name="photo" size={18} className="text-ink-muted" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link to={`/products/${p.id}`} className="block truncate font-semibold text-ink hover:text-brand">
                              {locale === 'km' ? p.nameKm : p.nameEn}
                            </Link>
                            <p className="text-xs text-ink-muted font-mono">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-ink">{p.categoryName || '—'}</span>
                        {p.brandName && <span className="block text-xs text-ink-muted">{p.brandName}</span>}
                      </td>
                      <td className="table-cell text-right font-semibold">
                        {minPrice === maxPrice ? formatUsd(minPrice) : `${formatUsd(minPrice)} - ${formatUsd(maxPrice)}`}
                      </td>
                      <td className="table-cell text-right">
                        <span className={totalStock <= 0 ? 'badge-danger' : totalStock <= 5 ? 'badge-pending' : 'badge-neutral'}>
                          {formatNumber(totalStock)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className={p.published ? 'badge-success' : 'badge-neutral'}>
                            {p.published ? t('products.published') : t('common.inactive')}
                          </span>
                          {p.featured && <span className="badge-brand">{t('products.featured')}</span>}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/products/${p.id}`} className="btn-icon" aria-label={t('common.edit')}>
                            <AppIcon name="edit" size={18} />
                          </Link>
                          {p.active && (
                            <button
                              type="button"
                              className="btn-icon hover:text-danger"
                              aria-label={t('products.deactivate')}
                              onClick={() => handleToggleDeactivate(p)}
                            >
                              <AppIcon name="trash" size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
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
