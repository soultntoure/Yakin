import { describe, it, expect } from 'vitest'
import { distanceKm, formatDistance } from '../src/lib/geo.js'
import { halalStatus, EXPIRING_DAYS } from '../src/lib/halal.js'
import { filterSuppliers, sortSuppliers } from '../src/lib/suppliers.js'

const day = 86400000
const now = new Date('2026-11-09T09:00:00+08:00')
const inDays = (n) => new Date(now.getTime() + n * day).toISOString().slice(0, 10)

describe('distanceKm', () => {
  it('is zero for identical points', () => {
    expect(distanceKm({ lat: 3.8077, lng: 103.326 }, { lat: 3.8077, lng: 103.326 })).toBe(0)
  })
  it('matches a known Kuantan to Gebeng span (~10-14 km)', () => {
    const d = distanceKm({ lat: 3.8077, lng: 103.326 }, { lat: 3.9728, lng: 103.3846 })
    expect(d).toBeGreaterThan(17)
    expect(d).toBeLessThan(20)
  })
  it('is symmetric', () => {
    const a = { lat: 3.8, lng: 103.3 }
    const b = { lat: 3.9, lng: 103.4 }
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 10)
  })
  it('formats short distances in metres and long in km', () => {
    expect(formatDistance(0.43)).toBe('430 m')
    expect(formatDistance(2.46)).toBe('2.5 km')
    expect(formatDistance(12.3)).toBe('12 km')
  })
})

describe('halalStatus', () => {
  it('is unverified with no certificate', () => {
    expect(halalStatus(null, now)).toBe('unverified')
  })
  it('is verified when expiry is far away', () => {
    expect(halalStatus({ expiry: inDays(EXPIRING_DAYS + 1) }, now)).toBe('verified')
  })
  it('is expiring within the warning window', () => {
    expect(halalStatus({ expiry: inDays(EXPIRING_DAYS) }, now)).toBe('expiring')
    expect(halalStatus({ expiry: inDays(5) }, now)).toBe('expiring')
  })
  it('treats an expired certificate as unverified', () => {
    expect(halalStatus({ expiry: inDays(-1) }, now)).toBe('unverified')
  })
  it('is still valid on the expiry day itself', () => {
    expect(halalStatus({ expiry: inDays(0) }, now)).toBe('expiring')
  })
})

const mk = (id, o) => ({ id, distanceKm: 1, rating: 4, halal: 'verified', delivers: true, inStock: true, open: true, fromPrice: 8, ...o })
const list = [
  mk('a', { distanceKm: 3, rating: 4.8, fromPrice: 9.5 }),
  mk('b', { distanceKm: 1, rating: 4.1, halal: 'expiring', fromPrice: 8.2, delivers: false }),
  mk('c', { distanceKm: 2, rating: 3.9, halal: 'unverified', inStock: false, open: false, fromPrice: 7.8 }),
]

describe('filterSuppliers', () => {
  it('returns everything with no filters', () => {
    expect(filterSuppliers(list, {})).toHaveLength(3)
  })
  it('verified includes expiring but not unverified', () => {
    expect(filterSuppliers(list, { verified: true }).map((s) => s.id)).toEqual(['a', 'b'])
  })
  it('combines filters with AND', () => {
    expect(filterSuppliers(list, { verified: true, delivers: true }).map((s) => s.id)).toEqual(['a'])
  })
  it('filters in stock and open now', () => {
    expect(filterSuppliers(list, { inStock: true }).map((s) => s.id)).toEqual(['a', 'b'])
    expect(filterSuppliers(list, { openNow: true }).map((s) => s.id)).toEqual(['a', 'b'])
  })
})

describe('sortSuppliers', () => {
  it('sorts nearest first', () => {
    expect(sortSuppliers(list, 'nearest').map((s) => s.id)).toEqual(['b', 'c', 'a'])
  })
  it('sorts top rated first', () => {
    expect(sortSuppliers(list, 'rating').map((s) => s.id)).toEqual(['a', 'b', 'c'])
  })
  it('sorts lowest price first', () => {
    expect(sortSuppliers(list, 'price').map((s) => s.id)).toEqual(['c', 'b', 'a'])
  })
  it('does not mutate the input', () => {
    const copy = [...list]
    sortSuppliers(list, 'price')
    expect(list).toEqual(copy)
  })
})
