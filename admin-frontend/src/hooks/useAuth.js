import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const refresh = useAuthStore((state) => state.refresh)
  const setUser = useAuthStore((state) => state.setUser)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)

  const isAuthenticated = Boolean(user)
  const isAdmin = user?.role === 'ADMIN'

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    refresh,
    setUser,
    setSession,
    clearSession,
  }
}

export default useAuth
