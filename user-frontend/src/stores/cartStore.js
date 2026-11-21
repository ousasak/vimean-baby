import { create } from 'zustand'
import { getCookie, setCookie } from '@/utils/cookies'
import { COOKIES, CART_DAYS } from '@/config/constants'

function loadInitialCart() {
  try {
    const cookieVal = getCookie(COOKIES.CART)
    if (cookieVal) {
      const parsed = typeof cookieVal === 'string' ? JSON.parse(cookieVal) : cookieVal
      if (Array.isArray(parsed)) return parsed
    }
    const localVal = typeof localStorage !== 'undefined' ? localStorage.getItem(COOKIES.CART) : null
    if (localVal) {
      const parsed = JSON.parse(localVal)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore parse error
  }
  return []
}

function persistCart(items) {
  setCookie(COOKIES.CART, items, CART_DAYS)
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(COOKIES.CART, JSON.stringify(items))
    } catch {
      // ignore
    }
  }
}

export const useCartStore = create((set, get) => ({
  items: loadInitialCart(),
  open: false,

  get count() {
    return get().items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  },

  get subtotal() {
    return get().items.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0), 0)
  },

  toggle: (force) => {
    set((state) => ({ open: typeof force === 'boolean' ? force : !state.open }))
  },

  addLine: (line) => {
    const current = get().items
    const existingIndex = current.findIndex((item) => item.variantId === line.variantId)
    let next
    if (existingIndex > -1) {
      next = current.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + line.quantity } : item
      )
    } else {
      next = [...current, { ...line }]
    }
    persistCart(next)
    set({ items: next, open: true })
  },

  addSummary: (product, name) => {
    get().addLine({
      productId: product.id,
      variantId: product.id,
      name: name || product.nameKm || product.nameEn,
      price: product.priceUsd ?? product.price ?? 0,
      regularPrice: product.regularPriceUsd ?? product.regularPrice ?? null,
      image: product.primaryImageUrl ?? (product.images?.[0]?.imageUrl || product.images?.[0]?.url || ''),
      quantity: 1,
      optionSummary: '',
    })
  },

  addDetail: (product, variant, name) => {
    get().addLine({
      productId: product.id,
      variantId: variant.id,
      name: name || product.nameKm || product.nameEn,
      price: Number(variant.price ?? product.priceUsd ?? product.price ?? 0),
      regularPrice: variant.compareAtPrice ?? product.regularPriceUsd ?? product.regularPrice ?? null,
      image: variant.imageUrl || product.primaryImageUrl || (product.images?.[0]?.imageUrl || product.images?.[0]?.url || ''),
      quantity: 1,
      optionSummary: variant.optionName || '',
    })
  },

  removeLine: (variantId) => {
    const next = get().items.filter((item) => item.variantId !== variantId)
    persistCart(next)
    set({ items: next })
  },

  remove: (variantId) => {
    get().removeLine(variantId)
  },

  updateQuantity: (variantId, quantity) => {
    const qty = Math.max(0, quantity)
    let next
    if (qty === 0) {
      next = get().items.filter((item) => item.variantId !== variantId)
    } else {
      next = get().items.map((item) => (item.variantId === variantId ? { ...item, quantity: qty } : item))
    }
    persistCart(next)
    set({ items: next })
  },

  setQuantity: (variantId, quantity) => {
    get().updateQuantity(variantId, quantity)
  },

  clearCart: () => {
    persistCart([])
    set({ items: [] })
  },
}))
