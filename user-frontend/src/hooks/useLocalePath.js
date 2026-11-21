import { useCallback } from 'react'

export function useLocalePath() {
  return useCallback((target) => {
    if (!target) return '/'
    if (typeof target === 'string') return target
    if (typeof target === 'object' && target.path) {
      const url = new URL(target.path, 'http://localhost')
      if (target.query) {
        for (const [k, v] of Object.entries(target.query)) {
          if (v !== undefined && v !== null && v !== '') {
            url.searchParams.set(k, String(v))
          }
        }
      }
      return url.pathname + url.search
    }
    return '/'
  }, [])
}

export default useLocalePath
