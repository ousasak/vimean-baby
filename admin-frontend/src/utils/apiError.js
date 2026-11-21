export class ApiError extends Error {
  constructor(message, status = 500, code = 'GENERIC', details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function toApiError(error) {
  if (error instanceof ApiError) return error

  if (error?.response) {
    const status = error.response.status
    const body = error.response.data
    const message = body?.message || error.message || 'Request failed'
    const code = body?.code || (status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : status === 404 ? 'NOT_FOUND' : 'GENERIC')
    const details = body?.errors || body?.details || null
    return new ApiError(message, status, code, details)
  }

  if (error?.request) {
    return new ApiError('No response from server', 0, 'NETWORK')
  }

  return new ApiError(error?.message || 'Unexpected error', 500, 'GENERIC')
}
