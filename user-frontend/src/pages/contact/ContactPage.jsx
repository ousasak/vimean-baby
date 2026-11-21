import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'

export default function ContactPage() {
  const { t } = useI18n()
  const localePath = useLocalePath()

  useEffect(() => {
    document.title = `${t('contact.title')} | ${t('app.name')}`
  }, [t])

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    topic: 'order',
    message: '',
  })
  const [sent, setSent] = useState(false)

  const cards = useMemo(() => [
    { title: t('contact.helpTitle'), body: t('contact.helpBody'), icon: '💬' },
    { title: t('contact.returnsTitle'), body: t('contact.returnsBody'), icon: '📦' },
    { title: t('contact.shipTitle'), body: t('contact.shipBody'), icon: '🚚' },
  ], [t])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div>
      <div className="bg-brand">
        <div className="container-store section-pad text-center">
          <h1 className="text-4xl font-bold text-white">{t('contact.title')}</h1>
          <p className="mt-3 text-white/80">{t('contact.subtitle')}</p>
          <p className="mt-4 text-lg font-semibold text-white">{t('contact.phone')}</p>
          <p className="mt-1 text-sm text-white/75">{t('contact.hours')}</p>
        </div>
      </div>

      <div className="container-store section-pad pt-8">
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.5rem] border border-line bg-white p-6 text-center shadow-soft"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-2xl">
                {card.icon}
              </div>
              <h2 className="text-lg font-bold">{card.title}</h2>
              <p className="mt-2 text-sm text-ink-muted">{card.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-8 overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-soft lg:grid-cols-2">
          <div className="bg-brand p-8 text-white lg:p-10">
            <h2 className="text-2xl font-bold">{t('contact.supportTitle')}</h2>
            <p className="mt-3 text-sm text-white/75">{t('contact.supportBody')}</p>
            <ul className="mt-6 space-y-3 text-sm text-white/85">
              <li>{t('contact.address')}</li>
              <li>{t('contact.phone')}</li>
              <li>{t('contact.email')}</li>
              <li>{t('contact.hours')}</li>
            </ul>
            <Link to={localePath('/products')} className="btn-primary mt-8 inline-flex bg-white text-brand hover:bg-cream">
              {t('home.shopNow')}
            </Link>
          </div>

          <form className="p-8 lg:p-10" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold">{t('contact.formTitle')}</h2>
            <p className="mt-2 text-sm text-ink-muted">{t('contact.formHint')}</p>

            {sent ? (
              <div className="mt-6 rounded-2xl bg-mint-tint px-4 py-6 text-sm font-semibold text-ink">
                {t('contact.formThanks')}
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1 block font-semibold">{t('contact.firstName')}</span>
                    <input
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                      className="min-h-11 w-full rounded-2xl border border-line px-3 outline-none focus:border-brand"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-semibold">{t('contact.lastName')}</span>
                    <input
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                      className="min-h-11 w-full rounded-2xl border border-line px-3 outline-none focus:border-brand"
                    />
                  </label>
                </div>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold">{t('contact.emailLabel')}</span>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    type="email"
                    required
                    className="min-h-11 w-full rounded-2xl border border-line px-3 outline-none focus:border-brand"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold">{t('contact.topic')}</span>
                  <select
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="min-h-11 w-full rounded-2xl border border-line bg-white px-3 outline-none focus:border-brand"
                  >
                    <option value="order">{t('contact.topicOrder')}</option>
                    <option value="product">{t('contact.topicProduct')}</option>
                    <option value="shipping">{t('contact.topicShipping')}</option>
                    <option value="other">{t('contact.topicOther')}</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold">{t('contact.message')}</span>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows="4"
                    className="w-full rounded-2xl border border-line px-3 py-2 outline-none focus:border-brand"
                  />
                </label>
                <button type="submit" className="btn-primary">
                  {t('contact.send')}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
