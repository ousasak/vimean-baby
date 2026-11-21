import React from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import SafeImage from '@/components/shared/SafeImage'
import ScrollReveal from '@/components/common/ScrollReveal'

export default function CategoryStrip({ categories = [] }) {
  const { locale, t } = useI18n()
  const localePath = useLocalePath()

  return (
    <section className="bg-brand">
      <div className="container-store section-pad">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
            {t('home.categories')}
          </h2>
          <Link to={localePath('/categories')} className="shrink-0 text-sm font-semibold text-white hover:underline">
            {t('home.viewAllShort')} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => (
            <ScrollReveal key={category.id} index={index}>
              <Link
                to={localePath(`/categories/${category.slug}`)}
                className="group block text-center"
              >
                <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-soft transition duration-300 group-hover:-translate-y-1">
                  <SafeImage
                    src={category.imageUrl}
                    alt={locale === 'km' ? category.nameKm : category.nameEn}
                    imgClass="aspect-square w-full rounded-xl object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  {locale === 'km' ? category.nameKm : category.nameEn}
                </p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
