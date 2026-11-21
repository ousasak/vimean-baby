import apiClient, { apiFetch } from '@/api/client'

export { apiClient, apiFetch }

export function useApi() {
  return {
    apiClient,
    apiFetch,
  }
}

export function setAuthStoreRef() {
  // handled automatically via zustand in @/api/client
}

export default apiClient
