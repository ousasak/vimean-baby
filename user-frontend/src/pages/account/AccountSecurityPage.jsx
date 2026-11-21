import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useAuth } from '@/hooks/useAuth'
import accountService from '@/services/accountService'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { formatDate } from '@/utils/format'
import { isStrongEnoughPassword } from '@/utils/validators'
import AccountSection from './components/AccountSection'
import FormInput from '@/components/common/FormInput'
import SubmitButton from '@/components/common/SubmitButton'
import AlertBanner from '@/components/common/AlertBanner'
import PasswordStrength from '@/pages/auth/components/PasswordStrength'

export default function AccountSecurityPage() {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const auth = useAuth()
  const errorMessage = useApiErrorMessage()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = `${t('account.nav.security')} | ${t('app.name')}`
  }, [t])

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [success, setSuccess] = useState(false)

  const errors = useMemo(() => {
    if (!submitted) return { currentPassword: null, newPassword: null, confirmPassword: null }
    return {
      currentPassword: !form.currentPassword ? t('auth.validation.passwordRequired') : null,
      newPassword: !isStrongEnoughPassword(form.newPassword) ? t('auth.validation.password') : null,
      confirmPassword:
        form.confirmPassword !== form.newPassword ? t('auth.validation.confirmPassword') : null,
    }
  }, [submitted, form, t])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    setServerError(null)
    setSuccess(false)

    if (Object.values(errors).some(Boolean)) return

    setLoading(true)
    try {
      const session = await accountService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      auth.setSession(session)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSubmitted(false)
      setSuccess(true)
    } catch (err) {
      setServerError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const [signingOutAll, setSigningOutAll] = useState(false)
  const [signOutError, setSignOutError] = useState(null)

  const signOutEverywhere = async () => {
    if (!window.confirm(t('account.security.confirmSignOutAll'))) return
    setSigningOutAll(true)
    setSignOutError(null)
    try {
      await accountService.logoutAll()
      auth.logout()
      navigate(localePath('/login'))
    } catch (err) {
      setSignOutError(errorMessage(err))
    } finally {
      setSigningOutAll(false)
    }
  }

  return (
    <div className="space-y-6">
      <AccountSection
        title={t('account.security.changePassword')}
        description={t('account.security.changePasswordHint')}
      >
        <form className="max-w-lg space-y-5" noValidate onSubmit={handleSubmit}>
          {success && <AlertBanner variant="success" message={t('account.security.passwordChanged')} />}
          {serverError && <AlertBanner variant="error" message={serverError} />}

          <FormInput
            value={form.currentPassword}
            onChange={(val) => setForm((prev) => ({ ...prev, currentPassword: val }))}
            type="password"
            label={t('account.security.currentPassword')}
            autoComplete="current-password"
            error={errors.currentPassword}
            required
          />

          <div className="space-y-3">
            <FormInput
              value={form.newPassword}
              onChange={(val) => setForm((prev) => ({ ...prev, newPassword: val }))}
              type="password"
              label={t('account.security.newPassword')}
              autoComplete="new-password"
              maxLength={72}
              error={errors.newPassword}
              required
            />
            <PasswordStrength password={form.newPassword} />
          </div>

          <FormInput
            value={form.confirmPassword}
            onChange={(val) => setForm((prev) => ({ ...prev, confirmPassword: val }))}
            type="password"
            label={t('auth.confirmPassword')}
            autoComplete="new-password"
            maxLength={72}
            error={errors.confirmPassword}
            required
          />

          <SubmitButton
            loading={loading}
            label={t('account.security.updatePassword')}
          />
        </form>
      </AccountSection>

      <AccountSection
        title={t('account.security.sessions')}
        description={t('account.security.sessionsHint')}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm">
            <p className="font-semibold text-ink">{t('account.security.lastSignIn')}</p>
            <p className="text-muted">{formatDate(auth.user?.lastLoginAt, locale) || '—'}</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 shadow-2xs hover:bg-rose-50 hover:border-rose-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-60"
            disabled={signingOutAll}
            onClick={signOutEverywhere}
          >
            {t('account.security.signOutAll')}
          </button>
        </div>
        {signOutError && (
          <AlertBanner className="mt-4" variant="error" message={signOutError} />
        )}
      </AccountSection>
    </div>
  )
}
