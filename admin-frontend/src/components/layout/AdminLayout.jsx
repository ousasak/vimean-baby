import React from 'react'
import { Outlet } from 'react-router-dom'
import AppSidebar from './AppSidebar'
import AppHeader from './AppHeader'
import ToastContainer from '../ui/ToastContainer'
import ConfirmDialog from '../shared/ConfirmDialog'

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-cream text-ink transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <AppSidebar />
      <div className="lg:pl-64">
        <AppHeader />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          {children || <Outlet />}
        </main>
      </div>
      <ToastContainer />
      <ConfirmDialog />
    </div>
  )
}
