import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import catalogService from '@/services/catalogService'
import { useCart } from '@/hooks/useCart'
import { formatUsd } from '@/utils/format'
import SafeImage from '@/components/shared/SafeImage'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const cart = useCart()

  const [product, setProduct] = useState(null)
  const [pending, setPending] = useState(true)
  const [error, setError] = useState(null)
  const [selectedVariantId, setSelectedVariantId] = useState(null)
  const [activeImageOverride, setActiveImageOverride] = useState(null)

  useEffect(() => {
    setPending(true)
    catalogService.getProductBySlug(slug)
      .then((data) => {
        setProduct(data)
        setSelectedVariantId(data?.variants?.[0]?.id ?? null)
        setError(null)
      })
      .catch((err) => {
        setError(err)
      })
      .finally(() => {
        setPending(false)
      })
  }, [slug])

  const name = useMemo(() => {
    if (!product) return ''
    return locale === 'km' ? product.nameKm : product.nameEn
  }, [product, locale])

  const description = useMemo(() => {
    if (!product) return ''
    return locale === 'km' ? product.descriptionKm : product.descriptionEn
  }, [product, locale])

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null
    return product.variants.find((v) => v.id === selectedVariantId) || product.variants[0]
  }, [product, selectedVariantId])

  const activeImage = useMemo(() => {
    if (activeImageOverride) return activeImageOverride
    return (
      product?.images?.find((i) => i.primary)?.url ||
      product?.images?.[0]?.url ||
      '/logo.svg'
    )
  }, [product, activeImageOverride])

  useEffect(() => {
    if (name) {
      document.title = `${name} | ${t('app.name')}`
    }
  }, [name, t])

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return
    cart.addDetail(product, selectedVariant, name)
  }

  return (
    <div className="container-store section-pad">
      {pending ? (
        <p className="py-16 text-center text-sm text-muted">{t('shop.loading')}</p>
      ) : error || !product ? (
        <p className="py-16 text-center text-sm text-muted">{t('shop.error')}</p>
      ) : (
        <>
          <p className="mb-4 text-xs text-muted">
            <Link to={localePath('/')}>{t('nav.home')}</Link>
            {' / '}
            <Link to={localePath('/products')}>{t('shop.title')}</Link>
            {' / '}
            {name}
          </p>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="animate-fade-up overflow-hidden rounded-[1.5rem] border border-line bg-white p-4 shadow-soft">
              <SafeImage
                src={activeImage}
                alt={name}
                imgClass="aspect-square w-full rounded-2xl object-cover"
              />
              {product.images?.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {product.images.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      className="overflow-hidden rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-brand"
                      onClick={() => setActiveImageOverride(image.url)}
                    >
                      <SafeImage
                        src={image.url}
                        alt=""
                        imgClass="aspect-square rounded-xl object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="animate-fade-up [animation-delay:150ms]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {product.brand?.name || t('product.brand')}
              </p>
              <h1 className="mt-2 text-3xl font-bold">{name}</h1>
              <p className="mt-4 text-2xl font-bold">
                {formatUsd(selectedVariant?.price)}
              </p>
              {selectedVariant?.compareAtPrice &&
                Number(selectedVariant.compareAtPrice) > Number(selectedVariant.price) && (
                  <p className="text-sm text-muted line-through">
                    {formatUsd(selectedVariant.compareAtPrice)}
                  </p>
                )}

              <div className="mt-6 space-y-2 text-sm text-muted">
                {product.ageRange && (
                  <p>
                    <span className="font-semibold text-ink">{t('product.age')}:</span>{' '}
                    {product.ageRange}
                  </p>
                )}
                {product.originCountry && (
                  <p>
                    <span className="font-semibold text-ink">{t('product.origin')}:</span>{' '}
                    {product.originCountry}
                  </p>
                )}
                {selectedVariant?.expiryDate && (
                  <p>
                    <span className="font-semibold text-ink">{t('product.expiry')}:</span>{' '}
                    {selectedVariant.expiryDate}
                  </p>
                )}
              </div>

              {product.variants?.length > 1 && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-semibold">{t('product.variants')}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        className={`min-h-11 rounded-2xl border px-4 text-sm font-semibold transition ${
                          selectedVariantId === variant.id
                            ? 'border-brand bg-brand-tint'
                            : 'border-line bg-white'
                        }`}
                        onClick={() => setSelectedVariantId(variant.id)}
                      >
                        {variant.optionName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                className="btn-primary mt-8 w-full sm:w-auto"
                disabled={!selectedVariant || selectedVariant.stockQty <= 0}
                onClick={handleAddToCart}
              >
                {selectedVariant && selectedVariant.stockQty > 0
                  ? t('product.addToCart')
                  : t('product.outOfStock')}
              </button>

              <div className="mt-8 rounded-2xl border border-line bg-white p-5">
                <h2 className="mb-2 text-sm font-semibold">{t('product.description')}</h2>
                <p className="text-sm leading-relaxed text-muted">
                  {description || t('home.storyBody')}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
