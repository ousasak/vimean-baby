/** Only allows same-site relative paths to prevent open redirects via `?redirect=`. */
export function safeRedirect(value, fallback) {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback
  return value
}
