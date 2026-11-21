import React, { useState, useMemo } from 'react'
import { useI18n } from '@/hooks/useI18n'
import { useAuth } from '@/hooks/useAuth'
import { PROVINCES } from '@/utils/provinces'
import { isCambodianPhone } from '@/utils/validators'
import FormInput from '@/components/common/FormInput'
import SubmitButton from '@/components/common/SubmitButton'
import AlertBanner from '@/components/common/AlertBanner'

export default function AddressForm({
  address = null,
  loading = false,
  serverError = null,
  onSubmit,
  onCancel,
}) {
  const { t } = useI18n()
  const auth = useAuth()

  const [form, setForm] = useState({
    receiverName: address?.receiverName ?? auth.user?.fullName ?? '',
    phone: address?.phone ?? auth.user?.phone ?? '',
    province: address?.province ?? 'Phnom Penh',
    district: address?.district ?? '',
    commune: address?.commune ?? '',
    streetDetail: address?.streetDetail ?? '',
    note: address?.note ?? '',
    defaultAddress: address?.defaultAddress ?? false,
  })

  const [submitted, setSubmitted] = useState(false)

  const errors = useMemo(() => {
    const required = (val) => (submitted && !String(val || '').trim() ? t('address.validation.required') : null)
    return {
      receiverName: required(form.receiverName),
      phone: submitted && !isCambodianPhone(form.phone) ? t('auth.validation.phone') : null,
      district: required(form.district),
      commune: required(form.commune),
      streetDetail: required(form.streetDetail),
    }
  }, [submitted, form, t])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (Object.values(errors).some(Boolean)) return

    onSubmit({
      ...form,
      receiverName: form.receiverName.trim(),
      phone: form.phone.trim(),
      district: form.district.trim(),
      commune: form.commune.trim(),
      streetDetail: form.streetDetail.trim(),
      note: form.note?.trim() || null,
    })
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      {serverError && <AlertBanner variant="error" message={serverError} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput
          value={form.receiverName}
          onChange={(val) => setForm((prev) => ({ ...prev, receiverName: val }))}
          label={t('address.receiverName')}
          autoComplete="name"
          maxLength={150}
          error={errors.receiverName}
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

      <div>
        <label htmlFor="address-province" className="mb-1.5 block text-sm font-semibold text-ink">
          {t('address.province')} <span className="text-brand" aria-hidden="true">*</span>
        </label>
        <select
          id="address-province"
          value={form.province}
          onChange={(e) => setForm({ ...form, province: e.target.value })}
          className="min-h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
        >
          {PROVINCES.map((province) => (
            <option key={province.key} value={province.value}>
              {t(`provinces.${province.key}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput
          value={form.district}
          onChange={(val) => setForm((prev) => ({ ...prev, district: val }))}
          label={t('address.district')}
          maxLength={100}
          error={errors.district}
          required
        />
        <FormInput
          value={form.commune}
          onChange={(val) => setForm((prev) => ({ ...prev, commune: val }))}
          label={t('address.commune')}
          maxLength={100}
          error={errors.commune}
          required
        />
      </div>

      <FormInput
        value={form.streetDetail}
        onChange={(val) => setForm((prev) => ({ ...prev, streetDetail: val }))}
        label={t('address.streetDetail')}
        placeholder={t('address.streetPlaceholder')}
        autoComplete="street-address"
        maxLength={255}
        error={errors.streetDetail}
        required
      />

      <div>
        <label htmlFor="address-note" className="mb-1.5 block text-sm font-semibold text-ink">
          {t('address.note')}
        </label>
        <textarea
          id="address-note"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          rows={2}
          maxLength={500}
          placeholder={t('address.notePlaceholder')}
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10"
        />
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={form.defaultAddress}
            onChange={(e) => setForm({ ...form, defaultAddress: e.target.checked })}
            className="h-5 w-5 rounded border-line accent-brand"
          />
          <span>{t('address.makeDefault')}</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <SubmitButton
          loading={loading}
          label={address ? t('address.save') : t('address.save')}
        />
        <button type="button" className="btn-ghost" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}
