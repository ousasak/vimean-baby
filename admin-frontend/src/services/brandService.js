import apiClient from '@/api/client'

export const brandService = {
  getBrands: () => apiClient.get('/admin/brands'),
  createBrand: (data) => apiClient.post('/admin/brands', data),
  updateBrand: (id, data) => apiClient.put(`/admin/brands/${id}`, data),
  deleteBrand: (id) => apiClient.delete(`/admin/brands/${id}`),
}

export default brandService
