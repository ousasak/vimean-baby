import { useTranslation } from 'react-i18next'
import { ApiError } from '@/utils/apiError'

export function useApiErrorMessage() {
  const { t, i18n } = useTranslation()

  return function errorMessage(error) {
    if (!error) return ''

    if (error instanceof ApiError) {
      if (error.code && i18n.exists(`errors.${error.code}`)) {
        return t(`errors.${error.code}`)
      }
      return error.message || t('errors.GENERIC')
    }

    if (error.response?.data?.message) {
      const code = error.response.data.code
      if (code && i18n.exists(`errors.${code}`)) {
        return t(`errors.${code}`)
      }
      return error.response.data.message
    }

    if (error.message) {
      return error.message
    }

    return t('errors.GENERIC')
  }
}

export default useApiErrorMessage
