import apiClient from '@/api/client'

export const catalogService = {
  getCategories: () => apiClient.get('/public/categories'),
  getProducts: (params) => apiClient.get('/public/products', { params }),
  getProductBySlug: (slug) => apiClient.get(`/public/products/${slug}`),
  getFeaturedProducts: (size = 5) => apiClient.get('/public/products', { params: { page: 0, size, sort: 'featured' } }),
}

export default catalogService
