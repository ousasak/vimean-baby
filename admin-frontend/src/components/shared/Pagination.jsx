import React from 'react'
import { useTranslation } from 'react-i18next'
import AppIcon from '../ui/AppIcon'

export default function Pagination({ page = 0, totalPages = 1, totalElements = 0, size = 20, onChange }) {
  const { t } = useTranslation()

  if (totalPages <= 1) return null

  const from = totalElements === 0 ? 0 : page * size + 1
  const to = Math.min((page + 1) * size, totalElements)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line/70 px-4 py-3 sm:flex-row sm:px-6">
      <p className="text-xs text-ink-muted">
        {t('common.showing', { from, to, total: totalElements })}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-secondary min-h-8 px-2.5 text-xs disabled:opacity-40"
          disabled={page <= 0}
          onClick={() => onChange?.(page - 1)}
        >
          <AppIcon name="chevronLeft" size={14} />
          {t('common.previous')}
        </button>
        <span className="text-xs font-semibold text-ink">
          {page + 1} / {totalPages}
        </span>
        <button
          type="button"
          className="btn-secondary min-h-8 px-2.5 text-xs disabled:opacity-40"
          disabled={page >= totalPages - 1}
          onClick={() => onChange?.(page + 1)}
        >
          {t('common.next')}
          <AppIcon name="chevronRight" size={14} />
        </button>
      </div>
    </div>
  )
}
