export const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:3001'

export const COOKIES = {
  ACCESS_TOKEN: 'vb_at',
  REFRESH_TOKEN: 'vb_rt',
  LOCALE: 'vb_locale',
  CART: 'vb_cart',
}

export const SESSION_DAYS = 7
export const CART_DAYS = 30

export const HOME_PRODUCTS_PAGE_SIZE = 25
export const SHOP_PRODUCTS_PAGE_SIZE = 20

export const LOCALES = [
  { code: 'km', iso: 'km-KH', name: 'ខ្មែរ' },
  { code: 'en', iso: 'en-US', name: 'English' },
]
