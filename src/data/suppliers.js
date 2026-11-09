import { distanceKm } from '../lib/geo.js'
import { halalStatus } from '../lib/halal.js'

// Demo data: every business, review and price below is fictional.
export const OWNER = { lat: 3.8077, lng: 103.326, label: 'Bandar Kuantan' }
export const JAKIM_URL = 'https://www.halal.gov.my'

const DAY = 86400000
const iso = (offset) => {
  const d = new Date(Date.now() + offset * DAY)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// One price ladder so the same cut costs about the same everywhere.
const CUTS = {
  whole: { name: 'Whole chicken', form: 'Fresh', k: 1, min: 20 },
  wholeFrozen: { name: 'Whole chicken', form: 'Frozen', k: 0.9, min: 20 },
  breast: { name: 'Breast fillet', form: 'Fresh', k: 1.42, min: 10 },
  thigh: { name: 'Drumstick and thigh', form: 'Fresh', k: 1.18, min: 10 },
  wings: { name: 'Wings', form: 'Fresh', k: 1.3, min: 10 },
  wingsFrozen: { name: 'Wings', form: 'Frozen', k: 1.16, min: 10 },
}
const products = (base, keys) =>
  keys.map((key) => {
    const c = CUTS[key]
    return { name: c.name, form: c.form, price: Math.round(base * c.k * 10) / 10, minKg: c.min }
  })

const raw = [
  {
    id: 'ladang-segar',
    name: 'Ladang Segar Ayam',
    area: 'Indera Mahkota',
    lat: 3.8236, lng: 103.3012,
    tone: 0,
    rating: 4.8, address: 'Lot 14, Jalan IM 8/3, Indera Mahkota, 25200 Kuantan',
    open: true, hours: 'Open until 6:00 pm',
    stock: 'in', stockNote: 'Fresh batch in at 5:30 am',
    base: 8.6, cuts: ['whole', 'breast', 'thigh', 'wings'],
    cert: { scheme: 'Rumah Sembelihan (slaughterhouse)', premises: 'Lot 14, Jalan IM 8/3, Indera Mahkota, 25200 Kuantan', ref: 'JAKIM-RS-2024-01482', expiry: iso(214), checked: iso(-2) },
    delivery: { yes: true, areas: ['Bandar', 'Indera Mahkota', 'Semambu', 'Sungai Isap'], hours: '7:00 am to 5:00 pm', lead: 'About 2 hours', note: 'Free above 40 kg' },
    reply: 10,
    reviews: [
      { by: 'Warung Kak Nah', rating: 5, text: 'Always fresh and the halal papers are on the invoice. We switched here when our old supplier ran short.', date: iso(-6) },
      { by: 'Restoran Selera Pantai', rating: 5, text: 'Delivered before the lunch rush, every time.', date: iso(-19) },
      { by: 'Kedai Makan Pak Long', rating: 4, text: 'Good quality. The cut-off for same-day orders is a bit early.', date: iso(-41) },
    ],
    reviewCount: 64,
  },
  {
    id: 'berkat',
    name: 'Berkat Poultry Trading',
    area: 'Bandar',
    lat: 3.8112, lng: 103.3201,
    tone: 1,
    rating: 4.6, address: '22, Jalan Besar, Bandar Kuantan, 25000 Kuantan',
    open: true, hours: 'Open until 7:00 pm',
    stock: 'in', stockNote: 'Plenty today',
    base: 8.9, cuts: ['whole', 'wholeFrozen', 'breast', 'thigh'],
    cert: { scheme: 'Premis (certified premises)', premises: '22, Jalan Besar, Bandar Kuantan, 25000 Kuantan', ref: 'JAKIM-PR-2025-00377', expiry: iso(301), checked: iso(-5) },
    delivery: { yes: false, areas: [], hours: 'Pick-up 6:00 am to 7:00 pm', lead: 'Ready in 30 minutes', note: 'Pick-up only' },
    reply: 8,
    reviews: [
      { by: 'Dapur Seri Mahkota', rating: 5, text: 'Five minutes from our kitchen. Pack, weigh and go.', date: iso(-9) },
      { by: 'Ayam Penyet Abang Ali', rating: 4, text: 'Fair prices, but no delivery.', date: iso(-33) },
    ],
    reviewCount: 41,
  },
  {
    id: 'al-barakah',
    name: 'Rumah Sembelih Al-Barakah',
    area: 'Semambu',
    lat: 3.8517, lng: 103.3342,
    tone: 2,
    rating: 4.9, address: 'Lot 3, Jalan Semambu Perdana, 25350 Kuantan',
    open: true, hours: 'Open until 5:00 pm',
    stock: 'in', stockNote: 'Slaughtered this morning',
    base: 9.4, cuts: ['whole', 'breast', 'thigh', 'wings'],
    cert: { scheme: 'Rumah Sembelihan (slaughterhouse)', premises: 'Lot 3, Jalan Semambu Perdana, 25350 Kuantan', ref: 'JAKIM-RS-2023-00915', expiry: iso(168), checked: iso(-1) },
    delivery: { yes: true, areas: ['Semambu', 'Bandar', 'Beserah', 'Tanjung Lumpur', 'Indera Mahkota'], hours: '6:30 am to 4:00 pm', lead: 'About 90 minutes', note: 'Free above 30 kg' },
    reply: 12,
    reviews: [
      { by: 'Restoran Tepian Kuantan', rating: 5, text: 'The slaughter date is printed on every pack. Customers ask about it and now we can show them.', date: iso(-3) },
      { by: 'Nasi Ayam Mak Jah', rating: 5, text: 'Best quality in Kuantan, a little pricier.', date: iso(-14) },
      { by: 'Warung Kak Nah', rating: 5, text: 'We called before 9 and the chicken arrived by 10:30.', date: iso(-27) },
    ],
    reviewCount: 89,
  },
  {
    id: 'taman-ayam',
    name: 'Taman Ayam Tanjung',
    area: 'Tanjung Lumpur',
    lat: 3.8183, lng: 103.3604,
    tone: 3,
    rating: 4.3, address: '9, Lorong Tanjung 2, Tanjung Lumpur, 25100 Kuantan',
    open: true, hours: 'Open until 6:00 pm',
    stock: 'low', stockNote: 'Low stock, order early',
    base: 8.2, cuts: ['whole', 'thigh', 'wings'],
    cert: { scheme: 'Premis (certified premises)', premises: '9, Lorong Tanjung 2, Tanjung Lumpur, 25100 Kuantan', ref: 'JAKIM-PR-2024-02210', expiry: iso(23), checked: iso(-4) },
    delivery: { yes: true, areas: ['Tanjung Lumpur', 'Bandar', 'Beserah'], hours: '8:00 am to 3:00 pm', lead: 'About 3 hours', note: 'Minimum 25 kg' },
    reply: 20,
    reviews: [
      { by: 'Kopitiam Anjung Timur', rating: 4, text: 'Reliable and cheaper than most. Their certificate renewal is due soon and they told us it is in progress.', date: iso(-12) },
      { by: 'Warung Teratak Cik Ton', rating: 4, text: 'Good for wings. Runs out by the afternoon.', date: iso(-38) },
    ],
    reviewCount: 27,
  },
  {
    id: 'gebeng-jaya',
    name: 'Pusat Ayam Gebeng Jaya',
    area: 'Gebeng',
    lat: 3.9702, lng: 103.3768,
    tone: 1,
    rating: 4.5, address: 'Lot 87, Kawasan Perindustrian Gebeng, 26080 Kuantan',
    open: true, hours: 'Open until 5:00 pm',
    stock: 'out', stockNote: 'Sold out today, back tomorrow 6:00 am',
    base: 8.0, cuts: ['whole', 'wholeFrozen', 'wingsFrozen', 'thigh'],
    cert: { scheme: 'Rumah Sembelihan (slaughterhouse)', premises: 'Lot 87, Kawasan Perindustrian Gebeng, 26080 Kuantan', ref: 'JAKIM-RS-2024-00663', expiry: iso(255), checked: iso(-7) },
    delivery: { yes: true, areas: ['Gebeng', 'Balok', 'Beserah', 'Bandar'], hours: '6:00 am to 2:00 pm', lead: 'Next morning for large orders', note: 'Minimum 50 kg' },
    reply: 25,
    reviews: [
      { by: 'Restoran Selera Pantai', rating: 5, text: 'Good volume pricing for catering weeks.', date: iso(-21) },
      { by: 'Dapur Seri Mahkota', rating: 4, text: 'Far away, but they deliver in bulk.', date: iso(-52) },
    ],
    reviewCount: 33,
  },
  {
    id: 'mutiara',
    name: 'Mutiara Frozen Chicken',
    area: 'Air Putih',
    lat: 3.7931, lng: 103.3312,
    tone: 3,
    rating: 4.0, address: '41, Jalan Air Putih, 25300 Kuantan',
    open: true, hours: 'Open until 8:00 pm',
    stock: 'in', stockNote: 'Frozen stock available',
    base: 7.9, cuts: ['wholeFrozen', 'wingsFrozen', 'breast'],
    cert: null,
    pending: 'We could not match a halal certificate to this premises in the JAKIM directory.',
    delivery: { yes: true, areas: ['Air Putih', 'Bandar', 'Kubang Buaya'], hours: '9:00 am to 6:00 pm', lead: 'About 2 hours', note: 'Free above 30 kg' },
    reply: 15,
    reviews: [
      { by: 'Kedai Makan Pak Long', rating: 4, text: 'Cheapest frozen stock nearby and quick to answer.', date: iso(-16) },
      { by: 'Nasi Ayam Mak Jah', rating: 3, text: 'Fine, but we could not confirm the halal papers on our first order.', date: iso(-45) },
    ],
    reviewCount: 18,
  },
  {
    id: 'sinar-halal',
    name: 'Sinar Halal Poultry',
    area: 'Beserah',
    lat: 3.8721, lng: 103.3716,
    tone: 2,
    rating: 4.4, address: '5, Jalan Pantai Beserah, 26100 Kuantan',
    open: false, hours: 'Closed, opens 6:00 am',
    stock: 'in', stockNote: 'Stock available tomorrow',
    base: 8.5, cuts: ['whole', 'breast', 'wings'],
    cert: { scheme: 'Premis (certified premises)', premises: '5, Jalan Pantai Beserah, 26100 Kuantan', ref: 'JAKIM-PR-2023-01744', expiry: iso(9), checked: iso(-3) },
    delivery: { yes: false, areas: [], hours: 'Pick-up 6:00 am to 5:00 pm', lead: 'Ready in 45 minutes', note: 'Pick-up only' },
    reply: 30,
    reviews: [
      { by: 'Ayam Penyet Abang Ali', rating: 4, text: 'Good chicken, honest people.', date: iso(-24) },
    ],
    reviewCount: 12,
  },
  {
    id: 'pak-din',
    name: 'Pak Din Ayam Segar',
    area: 'Sungai Isap',
    lat: 3.8329, lng: 103.3098,
    tone: 0,
    rating: 3.8, address: '17, Jalan Sungai Isap 3, 25150 Kuantan',
    open: true, hours: 'Open until 4:00 pm',
    stock: 'in', stockNote: 'In stock',
    base: 8.3, cuts: ['whole', 'thigh'],
    cert: null,
    pending: 'The supplier has not shared a certificate, and we could not find this premises in the JAKIM directory.',
    delivery: { yes: false, areas: [], hours: 'Pick-up 5:30 am to 4:00 pm', lead: 'Ready in 20 minutes', note: 'Pick-up only' },
    reply: 35,
    reviews: [
      { by: 'Warung Teratak Cik Ton', rating: 4, text: 'Been buying here for years. Never asked about papers.', date: iso(-30) },
    ],
    reviewCount: 9,
  },
  {
    id: 'kemuncak',
    name: 'Kemuncak Poultry Supply',
    area: 'Kubang Buaya',
    lat: 3.7822, lng: 103.2917,
    tone: 1,
    rating: 4.7, address: 'Lot 21, Jalan Kubang Buaya, 25250 Kuantan',
    open: false, hours: 'Closed, opens 7:00 am',
    stock: 'in', stockNote: 'Fresh stock from 7:00 am',
    base: 8.7, cuts: ['whole', 'breast', 'thigh', 'wings'],
    cert: { scheme: 'Pengedar (certified distributor)', premises: 'Lot 21, Jalan Kubang Buaya, 25250 Kuantan', ref: 'JAKIM-PG-2025-00128', expiry: iso(342), checked: iso(-6) },
    delivery: { yes: true, areas: ['Kubang Buaya', 'Air Putih', 'Bandar', 'Indera Mahkota'], hours: '7:30 am to 4:30 pm', lead: 'About 2 hours', note: 'Free above 35 kg' },
    reply: 15,
    reviews: [
      { by: 'Dapur Seri Mahkota', rating: 5, text: 'Consistent size and weight. Invoices are clear.', date: iso(-8) },
      { by: 'Restoran Tepian Kuantan', rating: 5, text: 'Our back-up supplier now. Easy to switch because they show everything upfront.', date: iso(-29) },
    ],
    reviewCount: 36,
  },
]

export const suppliers = raw.map((s) => {
  const prods = products(s.base, s.cuts)
  return {
    ...s,
    products: prods,
    fromPrice: Math.min(...prods.map((p) => p.price)),
    halal: halalStatus(s.cert),
    inStock: s.stock !== 'out',
    delivers: s.delivery.yes,
    distanceKm: distanceKm(OWNER, s),
  }
})

export const byId = (id) => suppliers.find((s) => s.id === id)
