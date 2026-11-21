import apiClient from '@/api/client'

export const checkoutService = {
  createOrder: (data) => apiClient.post('/orders', data),
  getPaymentMethods: () => apiClient.get('/public/payment-methods'),
}

export default checkoutService
