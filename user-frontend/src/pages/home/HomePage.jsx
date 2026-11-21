import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import catalogService from '@/services/catalogService'
import HeroBanner from './components/HeroBanner'
import CategoryStrip from './components/CategoryStrip'
import ProductGrid from '@/components/shared/ProductGrid'
import SafeImage from '@/components/shared/SafeImage'
import { HOME_PRODUCTS_PAGE_SIZE } from '@/config/constants'

export default function HomePage() {
  const { t } = useI18n()
  const localePath = useLocalePath()

  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [featuredError, setFeaturedError] = useState(null)

  const [products, setProducts] = useState([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(null)

  useEffect(() => {
    document.title = `${t('app.name')} | ${t('app.tagline')}`
  }, [t])

  useEffect(() => {
    catalogService.getCategories()
      .then((data) => setCategories(data || []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setFeaturedLoading(true)
    catalogService.getProducts({ page: 0, size: 5, sort: 'featured' })
      .then((data) => {
        setFeatured(data?.content || [])
        setFeaturedError(null)
      })
      .catch((err) => {
        setFeaturedError(err)
      })
      .finally(() => {
        setFeaturedLoading(false)
      })
  }, [])

  useEffect(() => {
    setProductsLoading(true)
    Promise.all([
      catalogService.getProducts({ page: 0, size: HOME_PRODUCTS_PAGE_SIZE, sort: 'newest' }),
      catalogService.getProducts({ page: 1, size: HOME_PRODUCTS_PAGE_SIZE, sort: 'newest' }).catch(() => null),
    ])
      .then(([page0, page1]) => {
        const list = [...(page0?.content || []), ...(page1?.content || [])]
        setProducts(list)
        setTotalProducts(page0?.totalElements || 0)
        setProductsError(null)
      })
      .catch((err) => {
        setProductsError(err)
      })
      .finally(() => {
        setProductsLoading(false)
      })
  }, [])

  return (
    <div>
      <HeroBanner />
      <CategoryStrip categories={categories} />

      {/* Top Offers */}
      <section className="container-store section-pad">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">{t('home.topOffers')}</h2>
            <p className="mt-1 text-sm text-muted">{t('home.topOffersSub')}</p>
          </div>
          <Link to={localePath('/products')} className="text-sm font-semibold text-brand">
            {t('home.showMore')} →
          </Link>
        </div>
        {featuredLoading ? (
          <p className="py-10 text-center text-sm text-muted">{t('shop.loading')}</p>
        ) : featuredError ? (
          <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-muted">{t('shop.error')}</p>
        ) : featured.length > 0 ? (
          <ProductGrid products={featured} />
        ) : (
          <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-muted">
            {t('shop.empty')}
          </p>
        )}
      </section>

      {/* Recommended Products */}
      <section className="container-store px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">{t('home.products')}</h2>
            <p className="mt-1 text-sm text-muted">{t('home.productsSub', { count: totalProducts })}</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{t('home.topPicks')}</p>
        </div>
        {productsLoading ? (
          <p className="py-10 text-center text-sm text-muted">{t('shop.loading')}</p>
        ) : productsError ? (
          <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-muted">{t('shop.error')}</p>
        ) : products.length > 0 ? (
          <>
            <ProductGrid products={products} />
            <div className="mt-8 text-center">
              <Link to={localePath('/products')} className="btn-primary">
                {t('home.viewAll')}
              </Link>
            </div>
          </>
        ) : (
          <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-muted">
            {t('shop.empty')}
          </p>
        )}
      </section>

      {/* Brand Story Banner */}
      <section className="container-store px-4 pb-14 sm:px-6 lg:px-8">
        <div className="relative min-h-[360px] overflow-hidden rounded-[1.75rem] bg-ink text-white shadow-soft sm:min-h-[420px]">
          <SafeImage
            src="https://res.cloudinary.com/vimeanbaby/image/upload/vimeanbaby/packshots/p-0013"
            alt=""
            imgClass="absolute inset-0 h-full w-full object-cover"
            width={1400}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/65 to-ink/25" />

          <div className="relative z-10 grid h-full min-h-[360px] gap-8 p-8 sm:min-h-[420px] sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">{t('home.storyTitle')}</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/80">{t('home.storyBody')}</p>
              <div className="mt-8">
                <Link to={localePath('/contact')} className="btn-primary bg-white text-brand hover:bg-cream">
                  {t('home.storyCta')}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:max-w-md lg:justify-self-end">
              <div className="rounded-2xl bg-white/95 p-4 text-ink shadow-soft backdrop-blur-sm">
                <p className="text-2xl font-bold text-brand">COD</p>
                <p className="mt-2 text-xs text-ink-muted">{t('home.trustCod')}</p>
              </div>
              <div className="rounded-2xl bg-white/95 p-4 text-ink shadow-soft backdrop-blur-sm">
                <p className="text-2xl font-bold text-brand">100%</p>
                <p className="mt-2 text-xs text-ink-muted">{t('home.trustAuth')}</p>
              </div>
              <div className="col-span-2 rounded-2xl bg-white/95 p-4 text-ink shadow-soft backdrop-blur-sm">
                <p className="text-sm font-semibold">{t('home.trustShip')}</p>
                <p className="mt-1 text-xs text-ink-muted">Phnom Penh · Siem Reap · Provinces</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
