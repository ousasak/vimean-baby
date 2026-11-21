import React, { useState, useEffect, useMemo } from 'react'
import { useI18n } from '@/hooks/useI18n'
import { useAuth } from '@/hooks/useAuth'
import accountService from '@/services/accountService'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { isEmail, isCambodianPhone } from '@/utils/validators'
import AccountSection from './components/AccountSection'
import FormInput from '@/components/common/FormInput'
import SubmitButton from '@/components/common/SubmitButton'
import AlertBanner from '@/components/common/AlertBanner'
import AvatarUpload from './components/AvatarUpload'

export default function AccountProfilePage() {
  const { t } = useI18n()
  const auth = useAuth()
  const errorMessage = useApiErrorMessage()

  const [form, setForm] = useState({
    fullName: auth.user?.fullName ?? '',
    email: auth.user?.email ?? '',
    phone: auth.user?.phone ?? '',
    dateOfBirth: auth.user?.dateOfBirth ?? '',
    gender: auth.user?.gender ?? '',
  })

  useEffect(() => {
    if (auth.user) {
      setForm({
        fullName: auth.user.fullName ?? '',
        email: auth.user.email ?? '',
        phone: auth.user.phone ?? '',
        dateOfBirth: auth.user.dateOfBirth ?? '',
        gender: auth.user.gender ?? '',
      })
    }
  }, [auth.user])

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [success, setSuccess] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    document.title = `${t('account.nav.profile')} | ${t('app.name')}`
  }, [t])

  const genders = useMemo(() => [
    { value: '', label: t('account.genderUnset') },
    { value: 'FEMALE', label: t('account.genders.FEMALE') },
    { value: 'MALE', label: t('account.genders.MALE') },
    { value: 'OTHER', label: t('account.genders.OTHER') },
  ], [t])

  const errors = useMemo(() => {
    if (!submitted) return { fullName: null, email: null, phone: null, dateOfBirth: null }
    return {
      fullName: String(form.fullName || '').trim().length < 2 ? t('auth.validation.fullName') : null,
      email: !isEmail(String(form.email || '').trim()) ? t('auth.validation.email') : null,
      phone: !isCambodianPhone(String(form.phone || '').trim()) ? t('auth.validation.phone') : null,
      dateOfBirth: form.dateOfBirth && form.dateOfBirth >= today ? t('account.validation.dateOfBirth') : null,
    }
  }, [submitted, form, today, t])

  const dirty = useMemo(() => {
    const user = auth.user
    if (!user) return false
    return (
      form.fullName !== user.fullName ||
      form.email !== user.email ||
      form.phone !== user.phone ||
      form.dateOfBirth !== (user.dateOfBirth ?? '') ||
      form.gender !== (user.gender ?? '')
    )
  }, [form, auth.user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    setServerError(null)
    setSuccess(false)

    if (Object.values(errors).some(Boolean)) return

    setLoading(true)
    try {
      const profile = await accountService.updateProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        avatarUrl: auth.user?.avatarUrl || null,
      })
      auth.setUser(profile?.data || profile)
      setForm((prev) => ({
        ...prev,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
      }))
      setSuccess(true)
      setSubmitted(false)
    } catch (err) {
      setServerError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AccountSection
      title={t('account.nav.profile')}
      description={t('account.profileSubtitle')}
    >
      <form className="space-y-6" noValidate onSubmit={handleSubmit}>
        {success && <AlertBanner variant="success" message={t('account.profileSaved')} />}
        {serverError && <AlertBanner variant="error" message={serverError} />}

        {/* Profile Photo Upload - Single clean Avatar */}
        <div className="rounded-2xl border border-line bg-cream/40 p-5 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <AvatarUpload size="xl" variant="default" showHint={true} hintText="ប្តូររូបថត Profile" />
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-sm font-bold text-ink">
                រូបភាពគណនី (Profile Picture)
              </h3>
              <p className="text-xs text-muted max-w-md leading-relaxed">
                ចុចលើរូបភាព ឬប៊ូតុងកាមេរ៉ាដើម្បីជ្រើសរើសរូបភាពថ្មីពីទូរស័ព្ទ ឬកុំព្យូទ័រ (គាំទ្រ JPG, PNG, WebP អតិបរមា 5MB)។
              </p>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <FormInput
          value={form.fullName}
          onChange={(val) => setForm((prev) => ({ ...prev, fullName: val }))}
          label={t('auth.fullName')}
          autoComplete="name"
          maxLength={150}
          error={errors.fullName}
          required
        />

        {/* Email & Phone */}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput
            value={form.email}
            onChange={(val) => setForm((prev) => ({ ...prev, email: val }))}
            type="email"
            inputMode="email"
            label={t('auth.email')}
            autoComplete="email"
            maxLength={180}
            error={errors.email}
            required
          />
          <FormInput
            value={form.phone}
            onChange={(val) => setForm((prev) => ({ ...prev, phone: val }))}
            type="tel"
            inputMode="tel"
            label={t('auth.phone')}
            autoComplete="tel"
            maxLength={20}
            error={errors.phone}
            required
          />
        </div>

        {/* Date of Birth & Gender */}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput
            value={form.dateOfBirth}
            onChange={(val) => setForm((prev) => ({ ...prev, dateOfBirth: val }))}
            type="date"
            label={t('account.dateOfBirth')}
            autoComplete="bday"
            error={errors.dateOfBirth}
          />
          <div>
            <label htmlFor="profile-gender" className="mb-1.5 block text-sm font-semibold text-ink">
              {t('account.gender')}
            </label>
            <select
              id="profile-gender"
              value={form.gender}
              onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
              className="min-h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand"
            >
              {genders.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <SubmitButton
            loading={loading}
            disabled={!dirty}
            label={t('account.saveChanges')}
          />
          {!dirty && !success && (
            <p className="text-xs text-muted">{t('account.noChanges')}</p>
          )}
        </div>
      </form>
    </AccountSection>
  )
}
