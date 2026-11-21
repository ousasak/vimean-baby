import apiClient from '@/api/client'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

export const uploadService = {
  validateFile: (file) => {
    if (!ALLOWED_TYPES.includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      throw new Error('Please choose a JPG, PNG or WebP image.')
    }
    if (file.size > MAX_BYTES) {
      throw new Error('The image must be 5 MB or smaller.')
    }
  },

  uploadImage: async (file, folder = 'vimeanbaby/products') => {
    uploadService.validateFile(file)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    return apiClient.post('/admin/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteImage: async (publicId) => {
    if (!publicId) return
    return apiClient.delete(`/admin/media/${publicId}`)
  },
}

export default uploadService
