import React from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  if (!toasts.length) return null

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[9999] flex w-full max-w-sm flex-col gap-2.5 p-2 sm:p-0"
      aria-live="polite"
      role="region"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error'
        const isSuccess = toast.type === 'success'
        const isWarning = toast.type === 'warning'

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              isError
                ? 'border-rose-200 bg-rose-50/95 text-rose-900 shadow-rose-500/10 dark:border-rose-900/50 dark:bg-rose-950/90 dark:text-rose-100'
                : isSuccess
                ? 'border-emerald-200 bg-emerald-50/95 text-emerald-900 shadow-emerald-500/10 dark:border-emerald-900/50 dark:bg-emerald-950/90 dark:text-emerald-100'
                : isWarning
                ? 'border-amber-200 bg-amber-50/95 text-amber-900 shadow-amber-500/10 dark:border-amber-900/50 dark:bg-amber-950/90 dark:text-amber-100'
                : 'border-line bg-white/95 text-ink shadow-black/10 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isError && <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              {isWarning && <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
              {!isError && !isSuccess && !isWarning && <Info className="h-5 w-5 text-brand" />}
            </div>

            <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>

            <button
              type="button"
              className="shrink-0 rounded-lg p-1 text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
