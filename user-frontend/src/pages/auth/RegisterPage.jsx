import React, { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useAuth } from '@/hooks/useAuth'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { isEmail, isCambodianPhone, isStrongEnoughPassword } from '@/utils/validators'
import { safeRedirect } from '@/utils/safeRedirect'
import AuthShell from './components/AuthShell'
import FormInput from '@/components/common/FormInput'
import SubmitButton from '@/components/common/SubmitButton'
import AlertBanner from '@/components/common/AlertBanner'
import PasswordStrength from './components/PasswordStrength'

export default function RegisterPage() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const errorMessage = useApiErrorMessage()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    acceptTerms: false,
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  useEffect(() => {
    document.title = `${t('auth.registerTitle')} | ${t('app.name')}`
  }, [t])

  const errors = useMemo(() => {
    const show = (field) => touched[field] || submitted
    const fullNameVal = String(form.fullName || '').trim()
    const emailVal = String(form.email || '').trim()
    const phoneVal = String(form.phone || '').trim()
    const passwordVal = String(form.password || '')
    const confirmPasswordVal = String(form.confirmPassword || '')
    return {
      fullName: show('fullName') && fullNameVal.length < 2 ? t('auth.validation.fullName') : null,
      email: show('email') && !isEmail(emailVal) ? t('auth.validation.email') : null,
      phone: show('phone') && !isCambodianPhone(phoneVal) ? t('auth.validation.phone') : null,
      password: show('password') && !isStrongEnoughPassword(passwordVal) ? t('auth.validation.password') : null,
      confirmPassword:
        show('confirmPassword') && confirmPasswordVal !== passwordVal
          ? t('auth.validation.confirmPassword')
          : null,
      acceptTerms: show('acceptTerms') && !form.acceptTerms ? t('auth.validation.terms') : null,
    }
  }, [form, touched, submitted, t])

  const redirectTo = useMemo(() => {
    return safeRedirect(searchParams.get('redirect'), localePath('/account'))
  }, [searchParams, localePath])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    setServerError(null)

    if (Object.values(errors).some(Boolean)) return

    setLoading(true)
    try {
      await auth.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      })
      navigate({
        pathname: redirectTo,
        search: '?welcome=1',
      }, { replace: true })
    } catch (err) {
      setServerError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loginRedirectQuery = searchParams.get('redirect')
    ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}`
    : ''

  return (
    <AuthShell
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      footer={
        <>
          {t('auth.haveAccount')}{' '}
          <Link
            to={`${localePath('/login')}${loginRedirectQuery}`}
            className="font-semibold text-brand-light hover:text-brand"
          >
            {t('auth.signIn')}
          </Link>
        </>
      }
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        {serverError && <AlertBanner variant="error" message={serverError} />}

        <FormInput
          value={form.fullName}
          onChange={(val) => setForm((prev) => ({ ...prev, fullName: val }))}
          onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
          label={t('auth.fullName')}
          placeholder={t('auth.fullNamePlaceholder')}
          autoComplete="name"
          maxLength={150}
          error={errors.fullName}
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput
            value={form.email}
            onChange={(val) => setForm((prev) => ({ ...prev, email: val }))}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            type="email"
            inputMode="email"
            label={t('auth.email')}
            placeholder="you@example.com"
            autoComplete="email"
            maxLength={180}
            error={errors.email}
            required
          />
          <FormInput
            value={form.phone}
            onChange={(val) => setForm((prev) => ({ ...prev, phone: val }))}
            onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
            type="tel"
            inputMode="tel"
            label={t('auth.phone')}
            placeholder="012 345 678"
            autoComplete="tel"
            maxLength={20}
            error={errors.phone}
            hint={t('auth.phoneHint')}
            required
          />
        </div>

        <div className="space-y-3">
          <FormInput
            value={form.password}
            onChange={(val) => setForm((prev) => ({ ...prev, password: val }))}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            type="password"
            label={t('auth.password')}
            autoComplete="new-password"
            maxLength={72}
            error={errors.password}
            required
          />
          <PasswordStrength password={form.password} />
        </div>

        <FormInput
          value={form.confirmPassword}
          onChange={(val) => setForm((prev) => ({ ...prev, confirmPassword: val }))}
          onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
          type="password"
          label={t('auth.confirmPassword')}
          autoComplete="new-password"
          maxLength={72}
          error={errors.confirmPassword}
          required
        />

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(e) => {
                setForm({ ...form, acceptTerms: e.target.checked })
                setTouched((prev) => ({ ...prev, acceptTerms: true }))
              }}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-line accent-brand"
            />
            <span>{t('auth.acceptTerms')}</span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-1.5 text-xs font-medium text-danger" role="alert">
              {errors.acceptTerms}
            </p>
          )}
        </div>

        <SubmitButton
          loading={loading}
          label={t('auth.createAccount')}
          loadingLabel={t('auth.creatingAccount')}
        />
      </form>
    </AuthShell>
  )
}
