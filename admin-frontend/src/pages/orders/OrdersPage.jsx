import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'

const steps = ['pending', 'confirmed', 'shipping', 'delivered']

export default function OrdersPage() {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = `${t('nav.orders')} | Vimean Baby Admin`
  }, [t])

  return (
    <div>
      <PageHeader title={t('nav.orders')} description={t('orders.subtitle')} />

      <div className="card p-6 sm:p-10">
        <EmptyState
          icon="orders"
          title={t('orders.comingTitle')}
          description={t('orders.comingBody')}
        >
          <Link to="/customers" className="btn-secondary">
            {t('nav.customers')}
          </Link>
        </EmptyState>

        <ol className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step}
              className="rounded-xl border border-line/80 bg-surface/60 p-4 text-center"
            >
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-ink-muted shadow-sm">
                {index + 1}
              </span>
              <p className="mt-2 text-sm font-semibold text-ink">
                {t(`orders.steps.${step}`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
