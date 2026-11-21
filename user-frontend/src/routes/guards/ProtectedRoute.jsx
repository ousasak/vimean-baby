import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import PageFallback from '@/routes/components/PageFallback'

export default function ProtectedRoute({ children }) {
  const { loading, isLoggedIn } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageFallback />
  }

  if (!isLoggedIn) {
    const fullPath = location.pathname + location.search
    const query = fullPath !== '/' && fullPath !== '' ? `?redirect=${encodeURIComponent(fullPath)}` : ''
    return <Navigate to={`/login${query}`} replace />
  }

  return children || <Outlet />
}
