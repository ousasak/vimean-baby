import { useTranslation } from 'react-i18next'
import { toApiError } from '@/utils/apiError'

export function useApiErrorMessage() {
  const { t, i18n } = useTranslation()

  return function message(error) {
    const { code } = toApiError(error)
    if (code && i18n.exists(`errors.${code}`)) {
      return t(`errors.${code}`)
    }
    return t('errors.GENERIC')
  }
}

export default useApiErrorMessage
