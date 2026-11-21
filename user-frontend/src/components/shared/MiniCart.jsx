import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useCart } from '@/hooks/useCart'
import { formatUsd } from '@/utils/format'
import SafeImage from '@/components/shared/SafeImage'

export default function MiniCart() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const cart = useCart()

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && cart.open) {
        cart.toggle(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cart])

  if (!cart.open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        className="absolute inset-0 bg-ink/40"
        type="button"
        aria-label="Close cart"
        onClick={() => cart.toggle(false)}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold">{t('cart.title')}</h2>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-sm"
            onClick={() => cart.toggle(false)}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!cart.items.length ? (
            <div className="rounded-2xl bg-cream px-4 py-10 text-center">
              <p className="mb-4 text-sm text-muted">{t('cart.empty')}</p>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => cart.toggle(false)}
              >
                {t('cart.continue')}
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex gap-3 rounded-2xl border border-line p-3"
                >
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    imgClass="h-20 w-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wide text-muted">{item.brand}</p>
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm font-semibold">{formatUsd(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        className="h-9 w-16 rounded-lg border border-line px-2 text-sm outline-none"
                        value={item.quantity}
                        onChange={(e) => cart.setQuantity(item.variantId, Number(e.target.value))}
                      />
                      <button
                        type="button"
                        className="text-xs text-muted underline hover:text-danger"
                        onClick={() => cart.remove(item.variantId)}
                      >
                        {t('cart.remove')}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line px-5 py-4">
          <div className="mb-1 flex items-center justify-between text-sm font-semibold">
            <span>{t('cart.estimatedTotal')}</span>
            <span>{formatUsd(cart.subtotal)}</span>
          </div>
          <p className="mb-4 text-xs text-muted">{t('cart.note')}</p>
          <Link
            to={localePath('/checkout')}
            className="btn-primary w-full text-center"
            onClick={() => cart.toggle(false)}
          >
            {t('cart.checkout')}
          </Link>
        </div>
      </aside>
    </div>
  )
}
