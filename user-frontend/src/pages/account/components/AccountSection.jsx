import React from 'react'

export default function AccountSection({ title, description, actions, children, className = '' }) {
  return (
    <section className={`rounded-[1.5rem] border border-line bg-white p-5 shadow-soft sm:p-8 ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
          <div>
            {title && (
              <h2 className="text-lg font-bold text-ink sm:text-xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div>
              {actions}
            </div>
          )}
        </header>
      )}
      <div className="pt-6">
        {children}
      </div>
    </section>
  )
}
