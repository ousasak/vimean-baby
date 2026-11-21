export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

export function isValidPhone(phone) {
  return /^\+?[0-9 ()-]{8,20}$/.test(String(phone || '').trim())
}

export function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(slug || '').trim())
}

export function isValidPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(String(password || ''))
}
