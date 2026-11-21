import React from 'react'

export default function SubmitButton({
  children,
  label,
  loadingLabel,
  loading = false,
  disabled = false,
  block = false,
  variant = 'primary',
  className = '',
  onClick,
  type = 'submit',
}) {
  const content = loading && loadingLabel ? loadingLabel : (label || children)

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} ${
        block ? 'w-full' : ''
      } gap-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {content}
    </button>
  )
}
