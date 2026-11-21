import React from 'react'
import { useTranslation } from 'react-i18next'
import { useConfirmStore } from '@/stores/confirmStore'
import UiModal from '../ui/UiModal'

export default function ConfirmDialog() {
  const { t } = useTranslation()
  const isOpen = useConfirmStore((state) => state.isOpen)
  const options = useConfirmStore((state) => state.options)
  const handleConfirm = useConfirmStore((state) => state.handleConfirm)
  const handleCancel = useConfirmStore((state) => state.handleCancel)

  if (!isOpen) return null

  return (
    <UiModal
      open={isOpen}
      title={options.title || t('common.confirm')}
      size="sm"
      onClose={handleCancel}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            {options.cancelLabel || t('common.cancel')}
          </button>
          <button
            type="button"
            className={options.danger ? 'btn-danger' : 'btn-primary'}
            onClick={handleConfirm}
          >
            {options.confirmLabel || t('common.confirm')}
          </button>
        </>
      }
    >
      <p className="text-sm text-ink-muted">{options.message}</p>
    </UiModal>
  )
}
