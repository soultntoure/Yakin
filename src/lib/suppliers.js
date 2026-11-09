export function filterSuppliers(list, f) {
  return list.filter(
    (s) =>
      (!f.verified || s.halal !== 'unverified') &&
      (!f.delivers || s.delivers) &&
      (!f.inStock || s.inStock) &&
      (!f.openNow || s.open),
  )
}

const by = {
  nearest: (a, b) => a.distanceKm - b.distanceKm,
  rating: (a, b) => b.rating - a.rating,
  price: (a, b) => a.fromPrice - b.fromPrice,
}

export function sortSuppliers(list, key) {
  return [...list].sort(by[key] || by.nearest)
}
