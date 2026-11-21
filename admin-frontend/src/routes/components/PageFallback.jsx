import React from 'react'

export default function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" aria-busy="true">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        <span className="text-xs font-medium text-ink-muted">Loading...</span>
      </div>
    </div>
  )
}
