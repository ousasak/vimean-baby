import { create } from 'zustand'
import axios from 'axios'
import { getCookie, setCookie, removeCookie } from '@/utils/cookies'
import { toApiError } from '@/utils/apiError'
import { API_BASE_URL, COOKIES, SESSION_DAYS } from '@/config/constants'

let isRefreshing = false
let refreshPromise = null

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  get isAuthenticated() {
    return Boolean(get().user)
  },

  get isLoggedIn() {
    return Boolean(get().user)
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

  register: async (payload) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, payload)
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
    refreshPromise = (async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: rt })
        const authData = res.data?.data || res.data
        get().setSession(authData)
        return true
      } catch (err) {
        get().clearSession()
        return false
      } finally {
        isRefreshing = false
        refreshPromise = null
      }
    })()

    return refreshPromise
  },

  fetchMe: async (token) => {
    const at = token || get().getAccessToken()
    if (!at) {
      set({ user: null, loading: false })
      return null
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${at}` },
      })
      const user = res.data?.data || res.data
      if (user && !user.avatarUrl && typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(`vb_avatar_${user.id || user.email}`)
        if (cached) user.avatarUrl = cached
      }
      set({ user, loading: false })
      return user
    } catch (err) {
      const apiErr = toApiError(err)
      if (apiErr.status === 401) {
        const refreshed = await get().refresh()
        if (refreshed) {
          return get().fetchMe()
        }
      }
      get().clearSession()
      return null
    }
  },

  logout: async () => {
    get().clearSession()
  },

  init: async () => {
    const at = get().getAccessToken()
    const rt = get().getRefreshToken()

    if (!at && !rt) {
      set({ user: null, loading: false })
      return
    }

    if (at) {
      await get().fetchMe(at)
    } else if (rt) {
      const ok = await get().refresh()
      if (ok) {
        await get().fetchMe()
      } else {
        set({ user: null, loading: false })
      }
    }
  },
}))
