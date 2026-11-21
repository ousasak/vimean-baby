import React from 'react'

export default function AuthLayout({ aside, children }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:bg-gradient-to-br lg:from-brand lg:to-brand-light lg:p-12 lg:text-white">
        <div>
          <img src="/logo-white.svg" alt="Vimean Baby" className="h-10 w-auto" width="166" height="40" />
        </div>
        <div className="max-w-md">{aside}</div>
        <p className="text-xs text-white/70">
          &copy; {new Date().getFullYear()} Vimean Baby. All rights reserved.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        {children}
      </div>
    </div>
  )
}
