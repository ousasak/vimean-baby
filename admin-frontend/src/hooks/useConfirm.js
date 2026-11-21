import { useConfirmStore } from '@/stores/confirmStore'

export function useConfirm() {
  const confirm = useConfirmStore((state) => state.confirm)
  return { confirm }
}

export default useConfirm
