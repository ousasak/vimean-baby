import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import catalogService from '@/services/catalogService'
import ProductGrid from '@/components/shared/ProductGrid'

export default function CategoryProductsPage() {
  const { slug } = useParams()
  const { t, locale } = useI18n()
  const localePath = useLocalePath()

  const [categories, setCategories] = useState([])
  const [data, setData] = useState(null)
  const [pending, setPending] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    catalogService.getCategories()
      .then((cats) => setCategories(cats || []))
      .catch(() => setCategories([]))
  }, [])

  const category = useMemo(() => {
    return categories.find((c) => c.slug === slug)
  }, [categories, slug])

  const title = useMemo(() => {
    if (!category) return t('nav.categories')
    return locale === 'km' ? category.nameKm : category.nameEn
  }, [category, locale, t])

  useEffect(() => {
    document.title = `${title} | ${t('app.name')}`
  }, [title, t])

  useEffect(() => {
    setPending(true)
    catalogService.getProducts({
      category: slug,
      page: 0,
      size: 24,
      sort: 'featured',
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
  }, [slug])

  return (
    <div className="container-store section-pad">
      <p className="mb-2 text-xs text-muted">
        <Link to={localePath('/')}>{t('nav.home')}</Link>
        {' / '}
        <Link to={localePath('/categories')}>{t('nav.categories')}</Link>
        {' / '}
        {title}
      </p>

      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted">
        {t('shop.count', { count: data?.totalElements ?? 0 })}
      </p>

      {pending ? (
        <p className="py-16 text-center text-sm text-muted">{t('shop.loading')}</p>
      ) : error ? (
        <p className="py-16 text-center text-sm text-muted">{t('shop.error')}</p>
      ) : data?.content?.length ? (
        <div className="mt-8">
          <ProductGrid products={data.content} />
        </div>
      ) : (
        <p className="mt-8 rounded-2xl bg-white px-4 py-16 text-center text-sm text-muted">
          {t('shop.empty')}
        </p>
      )}
    </div>
  )
}
