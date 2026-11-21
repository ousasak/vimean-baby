import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import SafeImage from '@/components/shared/SafeImage'

const slides = [
  {
    eyebrow: 'home.heroEyebrow',
    title: 'home.heroTitle',
    subtitle: 'home.heroSubtitle',
    image: 'https://res.cloudinary.com/vimeanbaby/image/upload/vimeanbaby/packshots/p-0003',
  },
  {
    eyebrow: 'home.heroEyebrow',
    title: 'home.topOffers',
    subtitle: 'home.topOffersSub',
    image: 'https://res.cloudinary.com/vimeanbaby/image/upload/vimeanbaby/packshots/p-0001',
  },
]

export default function HeroBanner() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const [index, setIndex] = useState(0)

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const currentSlide = slides[index]

  return (
    <section className="container-store section-pad pb-6 pt-6 sm:pt-8">
      <div className="relative min-h-[380px] overflow-hidden rounded-[1.75rem] bg-ink text-white shadow-soft sm:min-h-[440px] lg:min-h-[520px]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <SafeImage
              src={slide.image}
              alt=""
              imgClass="absolute inset-0 h-full w-full object-cover"
              width={1400}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/20" />
          </div>
        ))}

        <div className="relative z-10 flex h-full min-h-[380px] flex-col justify-center px-6 py-12 sm:min-h-[440px] sm:px-10 lg:min-h-[520px] lg:max-w-xl lg:px-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-light">
            {t(currentSlide.eyebrow)}
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {t('app.name')}
          </h1>
          <p className="mt-2 text-xl font-semibold text-mint sm:text-2xl">
            {t(currentSlide.title)}
          </p>
          <p className="mt-4 max-w-md text-sm text-white/80 sm:text-base">
            {t(currentSlide.subtitle)}
          </p>
          <div className="mt-8">
            <Link to={localePath('/products')} className="btn-primary bg-white text-ink hover:bg-cream">
              {t('home.shopNow')}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-white/95 px-2 py-1 text-ink shadow-sm">
          <button type="button" className="h-8 w-8 rounded-full hover:bg-cream" onClick={prev}>
            ‹
          </button>
          <div className="flex gap-1.5 px-1">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i === index ? 'bg-brand' : 'bg-line'}`}
              />
            ))}
          </div>
          <button type="button" className="h-8 w-8 rounded-full hover:bg-cream" onClick={next}>
            ›
          </button>
        </div>
      </div>
    </section>
  )
}
