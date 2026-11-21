import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { formatDate, formatDateTime, initials } from '@/utils/formatters'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import AppIcon from '@/components/ui/AppIcon'
import LocaleSwitcher from '@/components/ui/LocaleSwitcher'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language || 'km'
  const { user, setUser, setSession } = useAuth()
  const toast = useToast()
  const errorMessage = useApiErrorMessage()

  useEffect(() => {
    document.title = `${t('nav.settings')} | Vimean Baby Admin`
  }, [t])

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [profileForm, setProfileForm] = useState({ fullName: '', email: '', phone: '' })
  const [profileSubmitted, setProfileSubmitted] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPasswords, setShowPasswords] = useState(false)
  const [passwordSubmitted, setPasswordSubmitted] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await authService.getProfile()
      setProfile(data)
      setProfileForm({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
      })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const profileErrors = useMemo(() => {
    if (!profileSubmitted) return {}
    const result = {}
    if (profileForm.fullName.trim().length < 2) result.fullName = t('validation.required')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) result.email = t('validation.email')
    if (!/^\+?[0-9 ()-]{8,20}$/.test(profileForm.phone.trim())) result.phone = t('validation.phone')
    return result
  }, [profileSubmitted, profileForm, t])

  async function handleSaveProfile(e) {
    e.preventDefault()
    setProfileSubmitted(true)
    if (
      profileForm.fullName.trim().length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim()) ||
      !/^\+?[0-9 ()-]{8,20}$/.test(profileForm.phone.trim()) ||
      !profile
    ) {
      return
    }
    setSavingProfile(true)
    try {
      const updated = await authService.updateProfile({
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
      })
      setProfile(updated)
      setUser(updated)
      setProfileSubmitted(false)
      toast.success(t('settings.profileSaved'))
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSavingProfile(false)
    }
  }

  const passwordErrors = useMemo(() => {
    if (!passwordSubmitted) return {}
    const result = {}
    if (!passwordForm.currentPassword) result.currentPassword = t('validation.required')
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(passwordForm.newPassword)) result.newPassword = t('validation.password')
    if (passwordForm.confirmPassword !== passwordForm.newPassword) result.confirmPassword = t('validation.passwordMatch')
    return result
  }, [passwordSubmitted, passwordForm, t])

  async function handleChangePassword(e) {
    e.preventDefault()
    setPasswordSubmitted(true)
    if (
      !passwordForm.currentPassword ||
      !/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(passwordForm.newPassword) ||
      passwordForm.confirmPassword !== passwordForm.newPassword
    ) {
      return
    }
    setSavingPassword(true)
    try {
      const response = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setSession(response)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordSubmitted(false)
      toast.success(t('settings.passwordChanged'))
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div>
      <PageHeader title={t('nav.settings')} description={t('settings.subtitle')} />

      {error ? (
        <div className="card p-6">
          <EmptyState icon="alert" title={t('errors.loadTitle')} description={errorMessage(error)}>
            <button type="button" className="btn-primary" onClick={loadProfile}>
              {t('common.retry')}
            </button>
          </EmptyState>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <section className="card p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                {initials(profile?.fullName ?? user?.fullName ?? '')}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-ink">{profile?.fullName ?? user?.fullName}</p>
                <span className="badge-brand mt-1">{t('app.roleAdmin')}</span>
              </div>
            </div>
            <dl className="mt-6 space-y-3 border-t border-line/70 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{t('customers.joined')}</dt>
                <dd className="font-medium text-ink">{formatDate(profile?.createdAt, locale)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{t('customers.lastLogin')}</dt>
                <dd className="font-medium text-ink">{formatDateTime(profile?.lastLoginAt, locale)}</dd>
              </div>
            </dl>
            <div className="mt-6 border-t border-line/70 pt-5">
              <p className="field-label">{t('settings.language')}</p>
              <LocaleSwitcher />
            </div>
          </section>

          <div className="space-y-6 xl:col-span-2">
            <form className="card p-6" noValidate onSubmit={handleSaveProfile}>
              <h2 className="font-bold text-ink">{t('settings.profile')}</h2>
              <p className="mt-1 text-sm text-ink-muted">{t('settings.profileHint')}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="s-name">{t('settings.fullName')}</label>
                  <input
                    id="s-name"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    className={`field-input ${profileErrors.fullName ? 'border-danger' : ''}`}
                    autoComplete="name"
                  />
                  {profileErrors.fullName && <p className="field-error">{profileErrors.fullName}</p>}
                </div>
                <div>
                  <label className="field-label" htmlFor="s-email">{t('customers.email')}</label>
                  <input
                    id="s-email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                    type="email"
                    className={`field-input ${profileErrors.email ? 'border-danger' : ''}`}
                    autoComplete="email"
                  />
                  {profileErrors.email && <p className="field-error">{profileErrors.email}</p>}
                </div>
                <div>
                  <label className="field-label" htmlFor="s-phone">{t('customers.phone')}</label>
                  <input
                    id="s-phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                    type="tel"
                    className={`field-input ${profileErrors.phone ? 'border-danger' : ''}`}
                    autoComplete="tel"
                  />
                  {profileErrors.phone && <p className="field-error">{profileErrors.phone}</p>}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button type="submit" className="btn-primary" disabled={savingProfile || !profile}>
                  {t('common.saveChanges')}
                </button>
              </div>
            </form>

            <form className="card p-6" noValidate onSubmit={handleChangePassword}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-ink">{t('settings.password')}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{t('settings.passwordHint')}</p>
                </div>
                <button
                  type="button"
                  className="btn-icon"
                  aria-label={showPasswords ? t('auth.hidePassword') : t('auth.showPassword')}
                  onClick={() => setShowPasswords((prev) => !prev)}
                >
                  <AppIcon name={showPasswords ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="s-current">{t('settings.currentPassword')}</label>
                  <input
                    id="s-current"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    type={showPasswords ? 'text' : 'password'}
                    className={`field-input ${passwordErrors.currentPassword ? 'border-danger' : ''}`}
                    autoComplete="current-password"
                  />
                  {passwordErrors.currentPassword && <p className="field-error">{passwordErrors.currentPassword}</p>}
                </div>
                <div>
                  <label className="field-label" htmlFor="s-new">{t('settings.newPassword')}</label>
                  <input
                    id="s-new"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    type={showPasswords ? 'text' : 'password'}
                    className={`field-input ${passwordErrors.newPassword ? 'border-danger' : ''}`}
                    autoComplete="new-password"
                  />
                  {passwordErrors.newPassword && <p className="field-error">{passwordErrors.newPassword}</p>}
                </div>
                <div>
                  <label className="field-label" htmlFor="s-confirm">{t('settings.confirmPassword')}</label>
                  <input
                    id="s-confirm"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    type={showPasswords ? 'text' : 'password'}
                    className={`field-input ${passwordErrors.confirmPassword ? 'border-danger' : ''}`}
                    autoComplete="new-password"
                  />
                  {passwordErrors.confirmPassword && <p className="field-error">{passwordErrors.confirmPassword}</p>}
                </div>
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
                <AppIcon name="lock" size={14} /> {t('settings.signOutOthers')}
              </p>
              <div className="mt-6 flex justify-end">
                <button type="submit" className="btn-primary" disabled={savingPassword}>
                  {t('settings.updatePassword')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
