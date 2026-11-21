import apiClient from '@/api/client'

export const productService = {
  getProducts: (params) => apiClient.get('/admin/products', { params }),
  getProduct: (id) => apiClient.get(`/admin/products/${id}`),
  createProduct: (data) => apiClient.post('/admin/products', data),
  updateProduct: (id, data) => apiClient.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/admin/products/${id}`),
}

export default productService
