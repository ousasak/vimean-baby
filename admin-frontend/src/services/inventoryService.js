import apiClient from '@/api/client'

export const inventoryService = {
  getInventory: (params) => apiClient.get('/admin/inventory', { params }),
  updateStock: (variantId, stockQty) =>
    apiClient.patch(`/admin/inventory/variants/${variantId}/stock`, { stockQty }),
}

export default inventoryService
