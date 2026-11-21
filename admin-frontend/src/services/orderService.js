import apiClient from '@/api/client'

export const orderService = {
  getOrders: (params) => apiClient.get('/admin/orders', { params }),
}

export default orderService
