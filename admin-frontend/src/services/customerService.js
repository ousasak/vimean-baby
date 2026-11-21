import apiClient from '@/api/client'

export const customerService = {
  getCustomers: (params) => apiClient.get('/admin/customers', { params }),
  getCustomer: (id) => apiClient.get(`/admin/customers/${id}`),
  updateCustomerStatus: (id, active) =>
    apiClient.patch(`/admin/customers/${id}/status`, { active }),
}

export default customerService
