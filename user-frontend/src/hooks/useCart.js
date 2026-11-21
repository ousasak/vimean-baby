import { useCartStore } from '@/stores/cartStore'

export function useCart() {
  const items = useCartStore((state) => state.items)
  const open = useCartStore((state) => state.open)
  const count = useCartStore((state) => state.count)
  const subtotal = useCartStore((state) => state.subtotal)
  const toggle = useCartStore((state) => state.toggle)
  const addLine = useCartStore((state) => state.addLine)
  const addSummary = useCartStore((state) => state.addSummary)
  const addDetail = useCartStore((state) => state.addDetail)
  const removeLine = useCartStore((state) => state.removeLine)
  const remove = useCartStore((state) => state.remove)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const clearCart = useCartStore((state) => state.clearCart)

  return {
    items,
    open,
    count,
    subtotal,
    toggle,
    addLine,
    addSummary,
    addDetail,
    removeLine,
    remove,
    updateQuantity,
    setQuantity,
    clearCart,
  }
}

export default useCart
