import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'
import AppFooter from './AppFooter'
import MiniCart from '@/components/shared/MiniCart'
import ToastContainer from '@/components/ui/ToastContainer'
import PageFallback from '@/routes/components/PageFallback'

export default function DefaultLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AppHeader />
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          {children || <Outlet />}
        </Suspense>
      </main>
      <AppFooter />
      <MiniCart />
      <ToastContainer />
    </div>
  )
}
