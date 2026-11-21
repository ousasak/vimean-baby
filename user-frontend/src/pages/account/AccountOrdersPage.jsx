import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import { formatUsd } from '@/utils/format'
import SafeImage from '@/components/shared/SafeImage'
import AccountSection from './components/AccountSection'

export default function AccountOrdersPage() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    document.title = `${t('account.nav.orders')} | ${t('app.name')}`
    try {
      const stored = JSON.parse(localStorage.getItem('vb_orders') || '[]')
      setOrders(stored)
    } catch (e) {
      console.error('Failed to parse orders:', e)
    }
  }, [t])

  if (!orders || orders.length === 0) {
    return (
      <AccountSection title={t('account.nav.orders')} description={t('orders.subtitle')}>
        <div className="flex flex-col items-center px-4 py-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-tint text-brand">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.63 10.63a2.25 2.25 0 0 1-2.24 2.12H6.62a2.25 2.25 0 0 1-2.24-2.12L3.75 7.5M10 11.25h4M3.38 7.5h17.25c.62 0 1.12-.5 1.12-1.13v-1.5c0-.62-.5-1.12-1.12-1.12H3.38c-.63 0-1.13.5-1.13 1.12v1.5c0 .63.5 1.13 1.13 1.13Z" />
            </svg>
          </span>
          <h3 className="mt-5 text-lg font-bold text-ink dark:text-slate-100">{t('orders.emptyTitle')}</h3>
          <p className="mt-2 max-w-sm text-sm text-muted dark:text-slate-400">{t('orders.emptyBody')}</p>
          <Link to={localePath('/products')} className="btn-primary mt-6">
            {t('home.shopNow')}
          </Link>
        </div>
      </AccountSection>
    )
  }

  return (
    <AccountSection title={t('account.nav.orders')} description={t('orders.subtitle')}>
      <div className="space-y-4">
        {orders.map((order) => {
          const isPaid = order.paymentStatus === 'paid'
          const isCod = order.paymentMethod === 'cod'

          return (
            <div
              key={order.orderId}
              className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                      #{order.orderId}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      • {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {order.recipient.fullName} ({order.recipient.phone}) — {order.recipient.province}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  {isPaid ? (
                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      ✓ បានបង់ប្រាក់រួច (Paid)
                    </span>
                  ) : isCod ? (
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                      COD (បង់ពេលទទួល)
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      រង់ចាំការទូទាត់ (Pending)
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    បានបញ្ជាក់
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {order.items?.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3 py-2.5">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      imgClass="h-12 w-12 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatUsd(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {formatUsd(Number(item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5 text-xs dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  វិធីសាស្ត្រទូទាត់៖ <strong className="text-slate-900 dark:text-slate-100 uppercase">{order.paymentMethod}</strong>
                </span>
                <div className="text-right">
                  <span className="text-slate-500 dark:text-slate-400">សរុប៖ </span>
                  <span className="font-mono text-base font-extrabold text-brand">
                    {formatUsd(order.total)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </AccountSection>
  )
}
