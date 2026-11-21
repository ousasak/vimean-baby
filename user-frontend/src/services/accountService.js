import apiClient from '@/api/client'

export const accountService = {
  getProfile: () => apiClient.get('/me'),
  updateProfile: (data) => apiClient.put('/me', data),
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  changePassword: (data) => apiClient.put('/me/password', data),
  logoutAll: () => apiClient.post('/me/logout-all'),

  getAddresses: () => apiClient.get('/me/addresses'),
  createAddress: (data) => apiClient.post('/me/addresses', data),
  updateAddress: (id, data) => apiClient.put(`/me/addresses/${id}`, data),
  setDefaultAddress: (id) => apiClient.patch(`/me/addresses/${id}/default`),
  deleteAddress: (id) => apiClient.delete(`/me/addresses/${id}`),

  getOrders: (params) => apiClient.get('/me/orders', { params }),
}

export default accountService
