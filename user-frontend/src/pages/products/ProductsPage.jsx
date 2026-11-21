import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import catalogService from '@/services/catalogService'
import ProductGrid from '@/components/shared/ProductGrid'

export default function ProductsPage() {
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') || 0)
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'featured'

  const [categories, setCategories] = useState([])
  const [data, setData] = useState(null)
  const [pending, setPending] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = `${t('shop.title')} | ${t('app.name')}`
  }, [t])

  useEffect(() => {
    catalogService.getCategories()
      .then((cats) => setCategories(cats || []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setPending(true)
    catalogService.getProducts({
      page,
      size: 20,
      q: q || undefined,
      category: category || undefined,
      sort,
    })
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch((err) => {
        setError(err)
      })
      .finally(() => {
        setPending(false)
      })
  }, [page, q, category, sort])

  const updateQuery = (patch) => {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === null || v === '' || (k === 'page' && v === 0)) {
        next.delete(k)
      } else {
        next.set(k, String(v))
      }
    }
    setSearchParams(next)
  }

  return (
    <div className="container-store section-pad">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-muted">{t('nav.home')} / {t('shop.title')}</p>
          <h1 className="text-3xl font-bold">{t('shop.allProducts')}</h1>
          <p className="mt-1 text-sm text-muted">
            {t('shop.count', { count: data?.totalElements ?? 0 })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="min-h-11 rounded-2xl border border-line bg-white px-3 text-sm outline-none"
            value={category}
            onChange={(e) => updateQuery({ category: e.target.value, page: 0 })}
          >
            <option value="">{t('nav.categories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.nameEn}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 rounded-2xl border border-line bg-white px-3 text-sm outline-none"
            value={sort}
            onChange={(e) => updateQuery({ sort: e.target.value, page: 0 })}
          >
            <option value="featured">{t('shop.sortFeatured')}</option>
            <option value="newest">{t('shop.sortNewest')}</option>
            <option value="nameAsc">{t('shop.sortName')}</option>
          </select>
        </div>
      </div>

      {pending ? (
        <p className="py-16 text-center text-sm text-muted">{t('shop.loading')}</p>
      ) : error ? (
        <p className="py-16 text-center text-sm text-muted">{t('shop.error')}</p>
      ) : (
        <>
          {data?.content?.length ? (
            <ProductGrid products={data.content} />
          ) : (
            <p className="rounded-2xl bg-white px-4 py-16 text-center text-sm text-muted">
              {t('shop.empty')}
            </p>
          )}

          {(data?.totalPages || 0) > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                className="btn-ghost"
                disabled={page <= 0}
                onClick={() => updateQuery({ page: page - 1 })}
              >
                {t('common.previous')}
              </button>
              <span className="text-sm text-muted">
                {page + 1} / {data?.totalPages}
              </span>
              <button
                type="button"
                className="btn-ghost"
                disabled={page + 1 >= (data?.totalPages || 1)}
                onClick={() => updateQuery({ page: page + 1 })}
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
