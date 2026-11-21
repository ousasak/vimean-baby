import { create } from 'zustand'
import axios from 'axios'
import { getCookie, setCookie, removeCookie } from '@/utils/cookies'
import { toApiError, ApiError } from '@/utils/apiError'
import { API_BASE_URL, COOKIES, SESSION_DAYS } from '@/config/constants'

let isRefreshing = false
let refreshPromise = null

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  get isAuthenticated() {
    return Boolean(get().user)
  },

  get isAdmin() {
    return get().user?.role === 'ADMIN'
  },

  getAccessToken: () => {
    return getCookie(COOKIES.ACCESS_TOKEN)
  },

  getRefreshToken: () => {
    return getCookie(COOKIES.REFRESH_TOKEN)
  },

  clearSession: () => {
    removeCookie(COOKIES.ACCESS_TOKEN)
    removeCookie(COOKIES.REFRESH_TOKEN)
    set({ user: null, loading: false })
  },

  setUser: (user) => {
    set({ user })
  },

  setSession: (authData) => {
    if (!authData) return
    if (authData.user?.role !== 'ADMIN') {
      get().clearSession()
      throw new ApiError('Admin access required', 403, 'NOT_ADMIN')
    }
    setCookie(COOKIES.ACCESS_TOKEN, authData.accessToken, SESSION_DAYS)
    setCookie(COOKIES.REFRESH_TOKEN, authData.refreshToken, SESSION_DAYS)
    set({ user: authData.user, loading: false })
  },

  login: async (identifier, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { identifier, password })
      const authData = res.data?.data || res.data
      get().setSession(authData)
      return authData
    } catch (err) {
      throw toApiError(err)
    }
  },

  refresh: async () => {
    const rt = get().getRefreshToken()
    if (!rt) return false

    if (isRefreshing && refreshPromise) {
      return refreshPromise
    }

    isRefreshing = true
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, { refreshToken: rt })
      .then((res) => {
        const authData = res.data?.data || res.data
        get().setSession(authData)
        return true
      })
      .catch((err) => {
        const status = toApiError(err).status
        if (status === 400 || status === 401 || status === 403) {
          get().clearSession()
        }
        return false
      })
      .finally(() => {
        isRefreshing = false
        refreshPromise = null
      })

    return refreshPromise
  },

  fetchProfile: async () => {
    const at = get().getAccessToken()
    if (!at) {
      set({ user: null, loading: false })
      return null
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${at}` },
      })
      const body = res.data
      const profile = body?.data || body
      if (profile.role !== 'ADMIN') {
        get().clearSession()
        return null
      }
      set({ user: profile, loading: false })
      return profile
    } catch (err) {
      const apiErr = toApiError(err)
      if (apiErr.status === 401) {
        const refreshed = await get().refresh()
        if (refreshed) {
          return get().fetchProfile()
        }
      }
      get().clearSession()
      return null
    }
  },

  logout: async () => {
    const at = get().getAccessToken()
    const rt = get().getRefreshToken()
    if (at && rt) {
      try {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          { refreshToken: rt },
          { headers: { Authorization: `Bearer ${at}` } }
        )
      } catch {
        // Ignore logout errors
      }
    }
    get().clearSession()
  },

  init: async () => {
    const at = get().getAccessToken()
    const rt = get().getRefreshToken()
    if (!at && !rt) {
      set({ user: null, loading: false })
      return
    }
    await get().fetchProfile()
  },
}))
