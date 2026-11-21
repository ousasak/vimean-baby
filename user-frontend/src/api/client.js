import axios from 'axios'
import { API_BASE_URL, COOKIES } from '@/config/constants'
import { getCookie } from '@/utils/cookies'
import { toApiError } from '@/utils/apiError'
import { useAuthStore } from '@/stores/authStore'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const locale = getCookie(COOKIES.LOCALE) || (typeof localStorage !== 'undefined' ? localStorage.getItem(COOKIES.LOCALE) : null) || 'km'
    config.headers['Accept-Language'] = locale
    config.headers['X-Locale'] = locale

    return config
  },
  (error) => Promise.reject(toApiError(error))
)

// Response Interceptor with Queued 401 Refresh Logic
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    const data = response.data
    return data !== undefined && data !== null && 'data' in data ? data.data : data
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/register')) {
        return Promise.reject(toApiError(error))
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(toApiError(err)))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshed = await useAuthStore.getState().refresh()
        if (refreshed) {
          const newToken = useAuthStore.getState().getAccessToken()
          processQueue(null, newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return apiClient(originalRequest)
        } else {
          processQueue(new Error('Refresh failed'), null)
          useAuthStore.getState().clearSession()
          return Promise.reject(toApiError(error))
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        useAuthStore.getState().clearSession()
        return Promise.reject(toApiError(refreshErr))
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(toApiError(error))
  }
)

/**
 * apiFetch helper for backward compatibility with existing components
 */
export async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toLowerCase()
  const params = options.query || options.params
  const data = options.body || options.data
  const headers = options.headers || {}

  return apiClient.request({
    url: path,
    method,
    params,
    data,
    headers,
  })
}

export default apiClient
