export const EXPIRING_DAYS = 60
const DAY = 86400000

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

// 'verified' | 'expiring' | 'unverified'. An expired certificate is never shown as verified.
export function halalStatus(cert, now = new Date()) {
  if (!cert || !cert.expiry) return 'unverified'
  const [y, m, d] = cert.expiry.split('-').map(Number)
  const left = Math.round((new Date(y, m - 1, d).getTime() - startOfDay(now)) / DAY)
  if (left < 0) return 'unverified'
  return left <= EXPIRING_DAYS ? 'expiring' : 'verified'
}

export function daysLeft(cert, now = new Date()) {
  const [y, m, d] = cert.expiry.split('-').map(Number)
  return Math.round((new Date(y, m - 1, d).getTime() - startOfDay(now)) / DAY)
}
