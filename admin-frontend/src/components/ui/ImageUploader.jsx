import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import uploadService from '@/services/uploadService'
import { thumb } from '@/utils/formatters'
import AppIcon from './AppIcon'

export default function ImageUploader({ value, onChange, label, folder = 'vimeanbaby/products' }) {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const res = await uploadService.uploadImage(file, folder)
      onChange?.(res.url)
    } catch (err) {
      setError(err?.message || t('upload.failed'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="field-label">{label}</label>}

      {value ? (
        <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <img src={thumb(value, 200)} alt="" className="h-full w-full object-contain" />
          <button
            type="button"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-danger shadow-sm hover:bg-white"
            onClick={() => onChange?.(null)}
            aria-label={t('common.remove')}
          >
            <AppIcon name="trash" size={16} />
          </button>
        </div>
      ) : (
        <label
          className={`flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-surface/50 p-4 text-center transition hover:border-brand/40 hover:bg-white ${
            uploading ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              <span className="text-xs font-medium text-ink-muted">{t('upload.uploading')}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <AppIcon name="upload" size={24} className="text-ink-muted" />
              <span className="text-sm font-semibold text-ink">{t('upload.choose')}</span>
              <span className="text-xs text-ink-muted">JPG, PNG, WebP &le; 5MB</span>
            </div>
          )}
        </label>
      )}

      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
