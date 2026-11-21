import React, { useState, useId } from 'react'
import { useI18n } from '@/hooks/useI18n'

export default function FormInput({
  label,
  type = 'text',
  value = '',
  onChange,
  onBlur,
  error = null,
  hint = null,
  autoComplete = 'off',
  autocomplete,
  required = false,
  placeholder = '',
  inputMode,
  inputmode,
  maxLength,
  maxlength,
  className = '',
}) {
  const { t } = useI18n()
  const id = useId()
  const [revealed, setRevealed] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && revealed ? 'text' : type
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  const handleChange = (e) => {
    if (!onChange) return
    onChange(e)
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-brand" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          autoComplete={autoComplete || autocomplete}
          required={required}
          placeholder={placeholder}
          inputMode={inputMode || inputmode}
          maxLength={maxLength || maxlength}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`min-h-12 w-full rounded-2xl border bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10 ${
            error ? 'border-danger' : 'border-line'
          } ${isPassword ? 'pr-12' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed(!revealed)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-muted hover:text-ink"
            aria-label={revealed ? t('auth.hidePassword') : t('auth.showPassword')}
          >
            {revealed ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
