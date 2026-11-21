import React from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useCart } from '@/hooks/useCart'
import { formatUsd } from '@/utils/format'
import SafeImage from '@/components/shared/SafeImage'

export default function ProductCard({ product }) {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const cart = useCart()

  if (!product) return null

  const name = locale === 'km' ? product.nameKm : product.nameEn
  const lowStock = product.stockQty > 0 && product.stockQty <= 10

  const price = Number(product.priceUsd ?? product.price ?? 0)
  const compareAt = Number(product.compareAtPrice ?? product.regularPriceUsd ?? 0)
  const discountPercent = compareAt && compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0

  const handleAddToCart = () => {
    cart.addSummary(product, name)
  }

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-line bg-white p-3 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <Link to={localePath(`/products/${product.slug}`)} className="relative block overflow-hidden rounded-xl bg-cream">
        <SafeImage
          src={product.primaryImageUrl ?? (product.images?.[0]?.imageUrl || '')}
          alt={name}
          imgClass="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {discountPercent > 0 && (
          <span className="badge-sale absolute left-2 top-2 font-bold">
            {t('product.discount', { percent: discountPercent })}
          </span>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          {product.brandName || product.brand?.name || t('product.brand')}
        </p>
        <Link to={localePath(`/products/${product.slug}`)} className="mt-1 line-clamp-2 text-sm font-semibold text-ink">
          {name}
        </Link>

        {lowStock && (
          <p className="badge-warn mt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-warn" />
            {t('product.onlyLeft', { count: product.stockQty })}
          </p>
        )}

        <div className="mt-auto pt-3">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-base font-bold">{formatUsd(price)}</span>
            {compareAt && compareAt > price && (
              <span className="text-xs text-muted line-through">
                {formatUsd(compareAt)}
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn-ghost w-full"
            disabled={product.stockQty <= 0}
            onClick={handleAddToCart}
          >
            {product.stockQty > 0 ? t('product.addToCart') : t('product.outOfStock')}
          </button>
        </div>
      </div>
    </article>
  )
}
