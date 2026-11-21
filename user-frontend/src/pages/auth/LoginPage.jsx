import React, { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useAuth } from '@/hooks/useAuth'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { isEmail, isCambodianPhone } from '@/utils/validators'
import { safeRedirect } from '@/utils/safeRedirect'
import AuthShell from './components/AuthShell'
import FormInput from '@/components/common/FormInput'
import SubmitButton from '@/components/common/SubmitButton'
import AlertBanner from '@/components/common/AlertBanner'

export default function LoginPage() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const errorMessage = useApiErrorMessage()

  const [form, setForm] = useState({ identifier: '', password: '' })
  const [touched, setTouched] = useState({ identifier: false, password: false })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  useEffect(() => {
    document.title = `${t('auth.loginTitle')} | ${t('app.name')}`
  }, [t])

  const errors = useMemo(() => {
    const show = (field) => touched[field] || submitted
    const idVal = typeof form.identifier === 'string' ? form.identifier.trim() : (form.identifier?.target?.value ?? '')
    const passVal = typeof form.password === 'string' ? form.password : (form.password?.target?.value ?? '')
    return {
      identifier: !show('identifier')
        ? null
        : !idVal
        ? t('auth.validation.identifierRequired')
        : idVal.includes('@')
        ? isEmail(idVal)
          ? null
          : t('auth.validation.email')
        : isCambodianPhone(idVal)
        ? null
        : t('auth.validation.phone'),
      password: show('password') && !passVal ? t('auth.validation.passwordRequired') : null,
    }
  }, [form, touched, submitted, t])

  const redirectTo = useMemo(() => {
    return safeRedirect(searchParams.get('redirect'), '/account')
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    setServerError(null)

    const idVal = typeof form.identifier === 'string' ? form.identifier.trim() : (form.identifier?.target?.value ?? '')
    const passVal = typeof form.password === 'string' ? form.password : (form.password?.target?.value ?? '')
    if (errors.identifier || errors.password || !idVal || !passVal) return

    setLoading(true)
    try {
      await auth.login(idVal, passVal)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setServerError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
      footer={
        <p className="text-center text-sm text-ink-muted">
          {t('auth.noAccount')}{' '}
          <Link
            to={localePath({
              path: '/register',
              query: redirectTo !== '/account' ? { redirect: redirectTo } : undefined,
            })}
            className="font-semibold text-brand-light hover:text-brand"
          >
            {t('auth.createAccount')}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && <AlertBanner variant="error" message={serverError} />}

        <FormInput
          id="identifier"
          label={t('auth.identifier')}
          type="text"
          value={form.identifier}
          placeholder={t('auth.identifierPlaceholder')}
          autoComplete="username"
          required
          error={errors.identifier}
          onChange={(val) => setForm((prev) => ({ ...prev, identifier: val }))}
          onBlur={() => setTouched((prev) => ({ ...prev, identifier: true }))}
        />

        <div>
          <FormInput
            id="password"
            label={t('auth.password')}
            type="password"
            value={form.password}
            autoComplete="current-password"
            required
            error={errors.password}
            onChange={(val) => setForm((prev) => ({ ...prev, password: val }))}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          />
          <div className="mt-1 text-right">
            <Link
              to={localePath('/contact')}
              className="text-xs text-ink-muted hover:text-brand"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>
        </div>

        <SubmitButton
          loading={loading}
          label={t('auth.signIn')}
          loadingLabel={t('auth.signingIn')}
        />
      </form>
    </AuthShell>
  )
}
