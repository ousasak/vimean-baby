import React from 'react'
import AppIcon from '../ui/AppIcon'

export default function EmptyState({ icon = 'alert', title, description, children }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-ink-muted">
        <AppIcon name={icon} size={28} />
      </span>
      <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}
