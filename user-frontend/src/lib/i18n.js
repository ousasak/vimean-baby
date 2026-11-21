import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getCookie, setCookie } from '@/utils/cookies'

import enCommon from '@/locales/en/common.json'
import enAuth from '@/locales/en/auth.json'
import enNav from '@/locales/en/navigation.json'
import enHome from '@/locales/en/home.json'
import enProducts from '@/locales/en/products.json'
import enCart from '@/locales/en/cart.json'
import enCheckout from '@/locales/en/checkout.json'
import enAccount from '@/locales/en/account.json'
import enContact from '@/locales/en/contact.json'
import enProvinces from '@/locales/en/provinces.json'
import enErrors from '@/locales/en/errors.json'

import kmCommon from '@/locales/km/common.json'
import kmAuth from '@/locales/km/auth.json'
import kmNav from '@/locales/km/navigation.json'
import kmHome from '@/locales/km/home.json'
import kmProducts from '@/locales/km/products.json'
import kmCart from '@/locales/km/cart.json'
import kmCheckout from '@/locales/km/checkout.json'
import kmAccount from '@/locales/km/account.json'
import kmContact from '@/locales/km/contact.json'
import kmProvinces from '@/locales/km/provinces.json'
import kmErrors from '@/locales/km/errors.json'

const savedLocale = (typeof document !== 'undefined' ? (getCookie('vb_locale') || localStorage.getItem('vb_locale')) : null) || 'km'

const enMerged = {
  ...enCommon,
  auth: enAuth,
  ...enNav,
  home: enHome,
  ...enProducts,
  cart: enCart,
  checkout: enCheckout,
  ...enAccount,
  contact: enContact,
  provinces: enProvinces,
  errors: enErrors,
}

const kmMerged = {
  ...kmCommon,
  auth: kmAuth,
  ...kmNav,
  home: kmHome,
  ...kmProducts,
  cart: kmCart,
  checkout: kmCheckout,
  ...kmAccount,
  contact: kmContact,
  provinces: kmProvinces,
  errors: kmErrors,
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
      escapeValue: false,
      prefix: '{',
      suffix: '}',
    },
  })

export const changeLanguage = (lng) => {
  const target = lng === 'en' ? 'en' : 'km'
  i18n.changeLanguage(target)
  setCookie('vb_locale', target, 365)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('vb_locale', target)
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = target
  }
}

export default i18n
