import React from 'react'

export default function AlertBanner({ variant = 'info', message, className = '' }) {
  if (!message) return null

  const isError = variant === 'error'
  const isSuccess = variant === 'success'

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm text-ink ${
        isError
          ? 'border-danger/30 bg-danger/5'
          : isSuccess
          ? 'border-mint bg-mint-tint'
          : 'border-line bg-cream'
      } ${className}`}
      role={isError ? 'alert' : 'status'}
    >
      {isError && (
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-danger"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      )}
      {isSuccess && (
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-ink"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      )}
      {!isError && !isSuccess && (
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
      )}
      <p className="leading-relaxed">{message}</p>
    </div>
  )
}
