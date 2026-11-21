import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import { changeLanguage } from '@/lib/i18n'
import { LOCALES } from '@/config/constants'
import { useLocalePath } from '@/hooks/useLocalePath'

export function useI18n() {
  const { t, i18n } = useTranslation()
  const localePath = useLocalePath()

  const locale = i18n.language || 'km'

  const setLocale = useCallback((newLocale) => {
    changeLanguage(newLocale)
  }, [])

  const te = useCallback((key) => {
    return i18n.exists(key)
  }, [i18n])

  return {
    t,
    i18n,
    locale,
    locales: LOCALES,
    setLocale,
    te,
    localePath,
  }
}

export default useI18n
