export function getCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
  if (!match) return null
  try {
    return decodeURIComponent(match[3])
  }
  catch {
    return match[3]
  }
}

export function setCookie(name, value, days = 7) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  const val = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')
  document.cookie = `${name}=${encodeURIComponent(val)}; expires=${expires}; path=/; SameSite=Lax${secure}`
}

export function removeCookie(name) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
}
