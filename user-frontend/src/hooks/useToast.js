import { useToastStore } from '@/stores/toastStore'

export function useToast() {
  const success = useToastStore((state) => state.success)
  const error = useToastStore((state) => state.error)
  const info = useToastStore((state) => state.info)
  const warning = useToastStore((state) => state.warning)
  const addToast = useToastStore((state) => state.addToast)
  const removeToast = useToastStore((state) => state.removeToast)
  const toasts = useToastStore((state) => state.toasts)

  return {
    toasts,
    success,
    error,
    info,
    warning,
    addToast,
    removeToast,
  }
}

export default useToast
