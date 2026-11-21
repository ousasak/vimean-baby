import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const logout = useAuthStore((state) => state.logout)
  const refresh = useAuthStore((state) => state.refresh)
  const fetchMe = useAuthStore((state) => state.fetchMe)
  const setUser = useAuthStore((state) => state.setUser)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const getAccessToken = useAuthStore((state) => state.getAccessToken)
  const getRefreshToken = useAuthStore((state) => state.getRefreshToken)

  const isAuthenticated = Boolean(user)
  const isLoggedIn = isAuthenticated

  return {
    user,
    loading,
    isAuthenticated,
    isLoggedIn,
    login,
    register,
    logout,
    refresh,
    fetchMe,
    setUser,
    setSession,
    clearSession,
    getAccessToken,
    getRefreshToken,
  }
}

export default useAuth
