/**
 * KHQR / Bakong EMVCo Standard QR string generator for Cambodia
 */
export function calculateCrc16(data) {
  let crc = 0xffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff
      } else {
        crc = (crc << 1) & 0xffff
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export function generateKhqrString({
  bakongAccount = 'vimean_baby@abaa',
  merchantName = 'VIMEAN BABY STORE',
  merchantCity = 'Phnom Penh',
  amount = 0,
  currency = 'USD',
  billNumber = 'VB-001'
} = {}) {
  const padTag = (tag, val) => {
    const s = String(val)
    const len = String(s.length).padStart(2, '0')
    return `${tag}${len}${s}`
  }

  const sub00 = padTag('00', bakongAccount)
  const tag29 = padTag('29', sub00)

  const tag00 = '000201'
  const tag01 = '010212' // Dynamic QR
  const tag52 = '52045999'
  const tag53 = currency === 'USD' ? '5303840' : '5303116'
  const formattedAmount = Number(amount || 0).toFixed(2)
  const tag54 = padTag('54', formattedAmount)
  const tag58 = '5802KH'
  const tag59 = padTag('59', merchantName)
  const tag60 = padTag('60', merchantCity)

  const subBill = padTag('01', billNumber || 'VB-ORDER')
  const tag62 = padTag('62', subBill)

  const payload = `${tag00}${tag01}${tag29}${tag52}${tag53}${tag54}${tag58}${tag59}${tag60}${tag62}6304`
  const crc = calculateCrc16(payload)
  return `${payload}${crc}`
}
