import React from 'react'
import { Link } from 'react-router-dom'
import AppIcon from '../ui/AppIcon'

export default function StatCard({ title, value, hint, icon, to }) {
  const content = (
    <div className="card flex items-start justify-between p-5 transition hover:border-brand/30">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{title}</p>
        <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
        {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      </div>
      {icon && (
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-tint text-brand">
          <AppIcon name={icon} size={22} />
        </span>
      )}
    </div>
  )

  return to ? <Link to={to} className="block">{content}</Link> : content
}
