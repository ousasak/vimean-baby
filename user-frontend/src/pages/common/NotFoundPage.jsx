import React from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'

export default function NotFoundPage() {
  const { t } = useI18n()
  const localePath = useLocalePath()

  return (
    <div className="container-store section-pad">
      <div className="mx-auto max-w-lg rounded-[1.5rem] border border-line bg-white p-8 text-center shadow-soft">
        <h1 className="text-4xl font-bold text-brand">404</h1>
        <h2 className="mt-2 text-xl font-bold text-ink">{t('common.notFound') || 'Page Not Found'}</h2>
        <p className="mt-2 text-sm text-muted">
          {t('common.notFoundDesc') || 'The page you are looking for does not exist or has been moved.'}
        </p>
        <Link to={localePath('/')} className="btn-primary mt-6 inline-flex">
          {t('nav.home')}
        </Link>
      </div>
    </div>
  )
}
