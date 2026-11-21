import { create } from 'zustand'

export const useConfirmStore = create((set) => ({
  isOpen: false,
  options: {
    title: '',
    message: '',
    confirmLabel: '',
    cancelLabel: '',
    danger: false,
  },
  resolver: null,

  confirm: (options) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        options: {
          title: options.title || '',
          message: options.message || '',
          confirmLabel: options.confirmLabel || '',
          cancelLabel: options.cancelLabel || '',
          danger: Boolean(options.danger),
        },
        resolver: resolve,
      })
    })
  },

  handleConfirm: () => {
    set((state) => {
      if (state.resolver) state.resolver(true)
      return { isOpen: false, resolver: null }
    })
  },

  handleCancel: () => {
    set((state) => {
      if (state.resolver) state.resolver(false)
      return { isOpen: false, resolver: null }
    })
  },
}))
