import { create } from 'zustand'

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const toast = { id, message, type }
    set((state) => ({ toasts: [...state.toasts, toast] }))

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }
    return id
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },

  success: (message) => get().addToast(message, 'success'),
  error: (message) => get().addToast(message, 'error'),
  info: (message) => get().addToast(message, 'info'),
  warning: (message) => get().addToast(message, 'warning'),
}))
