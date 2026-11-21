import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import EmptyState from '@/components/shared/EmptyState'

export default function NotFoundPage() {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = '404 | Vimean Baby Admin'
  }, [])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="card max-w-md p-8 text-center">
        <EmptyState
          icon="alert"
          title={t('errors.notFoundTitle', 'Page Not Found')}
          description={t('errors.notFoundBody', 'The requested page could not be found or has moved.')}
        >
          <Link to="/" className="btn-primary">
            {t('nav.dashboard', 'Back to Dashboard')}
          </Link>
        </EmptyState>
      </div>
    </div>
  )
}
