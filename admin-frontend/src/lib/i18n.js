import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getCookie, setCookie } from '@/utils/cookies'

import enCommon from '@/locales/en/common.json'
import enAuth from '@/locales/en/auth.json'
import enNav from '@/locales/en/navigation.json'
import enDashboard from '@/locales/en/dashboard.json'
import enProducts from '@/locales/en/products.json'
import enInventory from '@/locales/en/inventory.json'
import enOrders from '@/locales/en/orders.json'
import enCustomers from '@/locales/en/customers.json'
import enSettings from '@/locales/en/settings.json'
import enCategories from '@/locales/en/categories.json'
import enBrands from '@/locales/en/brands.json'

import kmCommon from '@/locales/km/common.json'
import kmAuth from '@/locales/km/auth.json'
import kmNav from '@/locales/km/navigation.json'
import kmDashboard from '@/locales/km/dashboard.json'
import kmProducts from '@/locales/km/products.json'
import kmInventory from '@/locales/km/inventory.json'
import kmOrders from '@/locales/km/orders.json'
import kmCustomers from '@/locales/km/customers.json'
import kmSettings from '@/locales/km/settings.json'
import kmCategories from '@/locales/km/categories.json'
import kmBrands from '@/locales/km/brands.json'

const savedLocale = (typeof document !== 'undefined' ? getCookie('vb_admin_locale') : null) || 'km'

const enMerged = {
  ...enCommon,
  common: enCommon,
  auth: enAuth,
  nav: enNav,
  dashboard: enDashboard,
  products: enProducts,
  inventory: enInventory,
  orders: enOrders,
  customers: enCustomers,
  settings: enSettings,
  categories: enCategories,
  brands: enBrands,
}

const kmMerged = {
  ...kmCommon,
  common: kmCommon,
  auth: kmAuth,
  nav: kmNav,
  dashboard: kmDashboard,
  products: kmProducts,
  inventory: kmInventory,
  orders: kmOrders,
  customers: kmCustomers,
  settings: kmSettings,
  categories: kmCategories,
  brands: kmBrands,
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enMerged },
      km: { translation: kmMerged },
    },
    lng: savedLocale,
    fallbackLng: 'km',
    interpolation: {
      escapeValue: false, // React already escapes values
      prefix: '{',
      suffix: '}',
    },
  })

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    setCookie('vb_admin_locale', lng, 365)
    document.documentElement.lang = lng
  }
})

if (typeof document !== 'undefined') {
  document.documentElement.lang = savedLocale
}

export default i18n
