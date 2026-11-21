import apiClient from '@/api/client'

export const authService = {
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register', data),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  getMe: () => apiClient.get('/me'),
  updateMe: (data) => apiClient.put('/me', data),
  updatePassword: (data) => apiClient.put('/me/password', data),
  logoutAll: () => apiClient.post('/me/logout-all'),
}

export default authService
