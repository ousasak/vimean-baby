import React, { useMemo } from 'react'
import { MapPin, Phone, User as UserIcon } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { provinceKey } from '@/utils/provinces'

export default function AddressSummary({ address }) {
  const { t } = useI18n()

  const provinceLabel = useMemo(() => {
    if (!address?.province) return ''
    const key = provinceKey(address.province)
    return key ? t(`provinces.${key}`) : address.province
  }, [address?.province, t])

  if (!address) return null

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <UserIcon className="h-3.5 w-3.5 text-slate-400" />
          {address.receiverName}
        </span>
        {address.defaultAddress && (
          <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
            {t('address.defaultBadge')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs">
        <Phone className="h-3 w-3 text-slate-400" />
        <span>{address.phone}</span>
      </div>

      <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
        <span>
          {address.streetDetail}, {address.commune}, {address.district}, {provinceLabel}
        </span>
      </div>

      {address.note && (
        <p className="rounded-md bg-slate-50 dark:bg-slate-800/60 p-2 text-xs text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
          <span className="font-medium text-slate-700 dark:text-slate-300">{t('address.note')}:</span> {address.note}
        </p>
      )}
    </div>
  )
}
