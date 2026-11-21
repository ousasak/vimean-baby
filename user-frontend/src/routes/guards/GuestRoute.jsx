import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import PageFallback from '@/routes/components/PageFallback'

export default function GuestRoute({ children }) {
  const { loading, isLoggedIn } = useAuth()

  if (loading) {
    return <PageFallback />
  }

  if (isLoggedIn) {
    return <Navigate to="/account" replace />
  }

  return children || <Outlet />
}
