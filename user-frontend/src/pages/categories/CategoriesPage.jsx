import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import catalogService from '@/services/catalogService'
import SafeImage from '@/components/shared/SafeImage'

export default function CategoriesPage() {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()

  const [categories, setCategories] = useState([])
  const [pending, setPending] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = `${t('nav.categories')} | ${t('app.name')}`
  }, [t])

  useEffect(() => {
    setPending(true)
    catalogService.getCategories()
      .then((data) => {
        setCategories(data || [])
        setError(null)
      })
      .catch((err) => {
        setError(err)
      })
      .finally(() => {
        setPending(false)
      })
  }, [])

  return (
    <div className="container-store section-pad">
      <p className="text-xs text-muted">
        <Link to={localePath('/')}>{t('nav.home')}</Link> / {t('nav.categories')}
      </p>
      <h1 className="mt-2 text-3xl font-bold">{t('nav.categories')}</h1>
      <p className="mt-2 text-sm text-muted">{t('home.categoriesSub')}</p>

      {pending ? (
        <p className="py-16 text-center text-sm text-muted">{t('shop.loading')}</p>
      ) : error ? (
        <p className="py-16 text-center text-sm text-muted">{t('shop.error')}</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={localePath(`/categories/${category.slug}`)}
              className="group rounded-[1.5rem] border border-line bg-white p-4 text-center shadow-soft transition hover:-translate-y-1"
            >
              <SafeImage
                src={category.imageUrl}
                alt={locale === 'km' ? category.nameKm : category.nameEn}
                imgClass="aspect-square w-full rounded-2xl object-cover"
              />
              <p className="mt-3 text-sm font-semibold">
                {locale === 'km' ? category.nameKm : category.nameEn}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
