import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import AuthLayout from '@/components/layout/AuthLayout'
import AppIcon from '@/components/ui/AppIcon'
import LocaleSwitcher from '@/components/ui/LocaleSwitcher'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const errorMessage = useApiErrorMessage()

  useEffect(() => {
    document.title = `${t('auth.title')} | Vimean Baby Admin`
  }, [t])

  function getRedirectTarget() {
    const value = searchParams.get('redirect')
    return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'
  }

  useEffect(() => {
    if (isAdmin) {
      navigate(getRedirectTarget(), { replace: true })
    }
  }, [isAdmin])

  const [form, setForm] = useState({ identifier: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  const errors = useMemo(() => ({
    identifier: submitted && !form.identifier.trim() ? t('auth.validation.identifier') : null,
    password: submitted && !form.password ? t('auth.validation.password') : null,
  }), [submitted, form, t])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    setServerError(null)
    if (!form.identifier.trim() || !form.password) return
    setLoading(true)
    try {
      await login(form.identifier.trim(), form.password)
      navigate(getRedirectTarget(), { replace: true })
    } catch (error) {
      setServerError(errorMessage(error))
      setForm((prev) => ({ ...prev, password: '' }))
    } finally {
      setLoading(false)
    }
  }

  const highlights = useMemo(() => [
    t('auth.highlights.catalog'),
    t('auth.highlights.inventory'),
    t('auth.highlights.customers'),
  ], [t])

  const asideContent = (
    <>
      <h2 className="text-3xl font-bold leading-tight">{t('auth.asideTitle')}</h2>
      <p className="mt-3 text-white/85">{t('auth.asideBody')}</p>
      <ul className="mt-8 space-y-3">
        {highlights.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm font-medium">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
              <AppIcon name="check" size={16} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </>
  )

  return (
    <AuthLayout aside={asideContent}>
      <div className="w-full max-w-md">
        <img src="/logo.svg" alt="Vimean Baby" className="mb-8 h-10 w-auto lg:hidden" width="166" height="40" />
        <div className="card p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{t('auth.title')}</h1>
              <p className="mt-1 text-sm text-ink-muted">{t('auth.subtitle')}</p>
            </div>
            <LocaleSwitcher />
          </div>

          <form className="space-y-5" noValidate onSubmit={handleSubmit}>
            {serverError && (
              <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-ink" role="alert">
                <AppIcon name="alert" size={18} className="mt-0.5 text-danger" />
                {serverError}
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="field-label">{t('auth.identifier')}</label>
              <input
                id="identifier"
                value={form.identifier}
                onChange={(e) => setForm((prev) => ({ ...prev, identifier: e.target.value }))}
                className={`field-input min-h-11 ${errors.identifier ? 'border-danger' : ''}`}
                autoComplete="username"
                placeholder="admin@vimeanbaby.com"
                aria-invalid={Boolean(errors.identifier)}
              />
              {errors.identifier && <p className="field-error">{errors.identifier}</p>}
            </div>

            <div>
              <label htmlFor="password" className="field-label">{t('auth.password')}</label>
              <div className="relative">
                <input
                  id="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  type={showPassword ? 'text' : 'password'}
                  className={`field-input min-h-11 pr-11 ${errors.password ? 'border-danger' : ''}`}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-muted hover:text-ink"
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <AppIcon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="btn-primary min-h-11 w-full"
              disabled={loading}
            >
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-slate-950/40 dark:border-t-slate-950" aria-hidden="true" />}
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-muted">
          <AppIcon name="lock" size={14} />
          {t('auth.restricted')}
        </p>
      </div>
    </AuthLayout>
  )
}
