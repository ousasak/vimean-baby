export const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'
export const STORE_URL = import.meta.env.VITE_STORE_URL || 'http://localhost:3000'

export const COOKIES = {
  ACCESS_TOKEN: 'vb_admin_at',
  REFRESH_TOKEN: 'vb_admin_rt',
  LOCALE: 'vb_admin_locale',
}

export const SESSION_DAYS = 7
