import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!isAdmin) {
    const fullPath = location.pathname + location.search
    const query = fullPath !== '/' ? `?redirect=${encodeURIComponent(fullPath)}` : ''
    return <Navigate to={`/login${query}`} replace />
  }

  return children || <Outlet />
}
