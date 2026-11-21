import React from 'react'
import { Navigate, useSearchParams, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function PublicRoute({ children }) {
  const { loading, isAdmin } = useAuth()
  const [searchParams] = useSearchParams()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  if (isAdmin) {
    const redirect = searchParams.get('redirect')
    const target = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'
    return <Navigate to={target} replace />
  }

  return children || <Outlet />
}
