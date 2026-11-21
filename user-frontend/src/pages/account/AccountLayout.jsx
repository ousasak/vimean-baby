import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import AccountNav from './components/AccountNav'
import PageFallback from '@/routes/components/PageFallback'

export default function AccountLayout() {
  return (
    <div className="container-store px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside className="lg:sticky lg:top-44 lg:self-start">
          <AccountNav />
        </aside>
        <div className="min-w-0">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
