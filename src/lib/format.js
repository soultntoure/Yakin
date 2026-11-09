const parse = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const fmtDate = (iso) =>
  parse(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })

export function ago(iso) {
  const n = Math.round((Date.now() - parse(iso).getTime()) / 86400000)
  if (n <= 0) return 'Today'
  if (n === 1) return 'Yesterday'
  if (n < 30) return `${n} days ago`
  return `${Math.round(n / 30)} mo ago`
}

export const rm = (n) => `RM ${n.toFixed(2)}`
