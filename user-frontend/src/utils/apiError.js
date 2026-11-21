export class ApiError extends Error {
  constructor(message, status, code, fields = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

/** Converts an axios error (or anything thrown) into an ApiError with the backend's error code. */
export function toApiError(error) {
  if (error instanceof ApiError) return error

  const status = error?.response?.status ?? error?.statusCode ?? error?.status ?? 0
  const body = error?.response?.data ?? error?.data
  let code = null
  let fields = []

  if (body?.errors && typeof body.errors === 'object' && !Array.isArray(body.errors)) {
    const value = body.errors.code
    code = typeof value === 'string' ? value : null
  }
  else if (Array.isArray(body?.errors)) {
    fields = body.errors
      .filter((item) => typeof item === 'string')
      .map((item) => item.split(':')[0]?.trim() ?? '')
      .filter(Boolean)
    code = 'VALIDATION'
  }

  if (!code && status === 0) code = 'NETWORK'

  const message = body?.message || error?.message || 'Request failed'
  return new ApiError(message, status, code, fields)
}
