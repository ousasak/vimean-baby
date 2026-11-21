import React from 'react'
import { useToastStore } from '@/stores/toastStore'
import AppIcon from './AppIcon'

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  if (!toasts.length) return null

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 p-2"
      aria-live="polite"
      role="region"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error'
        const isSuccess = toast.type === 'success'

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur transition-all ${
              isError
                ? 'border-danger/30 bg-danger/10 text-danger'
                : isSuccess
                ? 'border-mint/30 bg-mint/10 text-ink'
                : 'border-line/80 bg-white/95 text-ink'
            }`}
          >
            <AppIcon
              name={isError ? 'alert' : isSuccess ? 'check' : 'alert'}
              size={18}
              className={`mt-0.5 ${
                isError ? 'text-danger' : isSuccess ? 'text-brand' : 'text-ink-muted'
              }`}
            />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              className="text-ink-muted hover:text-ink"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss"
            >
              <AppIcon name="close" size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
