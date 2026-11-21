import apiClient from '@/api/client'

export const authService = {
  login: (identifier, password) => apiClient.post('/auth/login', { identifier, password }),
  logout: (refreshToken) => apiClient.post('/auth/logout', { refreshToken }),
  getProfile: () => apiClient.get('/me'),
  updateProfile: (data) => apiClient.put('/me', data),
  changePassword: (data) => apiClient.put('/me/password', data),
}

export default authService
