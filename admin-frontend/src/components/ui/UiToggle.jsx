import React from 'react'

export default function UiToggle({ value, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <div className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`h-6 w-11 rounded-full transition-colors ${
            value ? 'bg-brand' : 'bg-line'
          }`}
        />
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      <div>
        {label && <p className="text-sm font-semibold text-ink">{label}</p>}
        {description && <p className="text-xs text-ink-muted">{description}</p>}
      </div>
    </label>
  )
}
