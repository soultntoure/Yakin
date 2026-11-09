import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { OWNER } from '../data/suppliers.js'

const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIB = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const star = '<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>'

const pinIcon = (s, cls = '') =>
  L.divIcon({
    className: 'pin-wrap',
    iconSize: [0, 0],
    html: `<div class="pin-pos"><div class="pin ${s.halal} ${cls}"><div class="pin-body">${star}${s.rating.toFixed(1)}</div><div class="pin-tip"></div></div></div>`,
  })

const meIcon = L.divIcon({ className: 'me-wrap', iconSize: [22, 22], iconAnchor: [11, 11], html: '<div class="me"></div>' })

function baseMap(el, opts) {
  const map = L.map(el, { zoomControl: false, attributionControl: true, zoomSnap: 0.25, ...opts })
  L.tileLayer(TILES, { maxZoom: 19, attribution: ATTRIB }).addTo(map)
  map.attributionControl.setPrefix(false)
  return map
}

export function SupplierMap({ suppliers, selectedId, onSelect, bottomPad = 0 }) {
  const el = useRef(null)
  const map = useRef(null)
  const markers = useRef(new Map())
  const select = useRef(onSelect)
  select.current = onSelect

  useEffect(() => {
    const m = baseMap(el.current, { tap: false })
    map.current = m
    m.setView([3.8335, 103.335], 12.5)
    L.marker([OWNER.lat, OWNER.lng], { icon: meIcon, zIndexOffset: -500, interactive: false, keyboard: false }).addTo(m)
    m.on('click', () => select.current(null))
    const t = setTimeout(() => m.invalidateSize(), 60)
    return () => { clearTimeout(t); m.remove(); markers.current.clear() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const m = map.current
    const keep = new Set(suppliers.map((s) => s.id))
    for (const [id, mk] of markers.current) if (!keep.has(id)) { mk.remove(); markers.current.delete(id) }
    suppliers.forEach((s) => {
      let mk = markers.current.get(s.id)
      if (!mk) {
        mk = L.marker([s.lat, s.lng], { icon: pinIcon(s), riseOnHover: true, keyboard: true, title: s.name }).addTo(m)
        mk.on('click', (e) => { L.DomEvent.stopPropagation(e); select.current(s.id) })
        markers.current.set(s.id, mk)
      }
      mk.setIcon(pinIcon(s, selectedId === s.id ? 'sel' : selectedId ? 'dim' : ''))
      mk.setZIndexOffset(selectedId === s.id ? 1000 : 0)
    })
  }, [suppliers, selectedId])

  useEffect(() => {
    const s = suppliers.find((x) => x.id === selectedId)
    if (!s || !map.current) return
    const m = map.current
    const p = m.project([s.lat, s.lng], m.getZoom()).add([0, bottomPad / 2])
    m.panTo(m.unproject(p, m.getZoom()), { animate: true, duration: 0.4 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  return <div ref={el} style={{ position: 'absolute', inset: 0 }} />
}

export function MiniMap({ supplier }) {
  const el = useRef(null)
  useEffect(() => {
    const m = baseMap(el.current, {
      dragging: false, touchZoom: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false,
    })
    const a = [OWNER.lat, OWNER.lng]
    const b = [supplier.lat, supplier.lng]
    L.polyline([a, b], { color: '#0f4d3a', weight: 3, dashArray: '2 8', lineCap: 'round', opacity: 0.8 }).addTo(m)
    L.marker(a, { icon: meIcon, interactive: false }).addTo(m)
    L.marker(b, { icon: pinIcon(supplier, 'sel'), interactive: false }).addTo(m)
    m.fitBounds([a, b], { padding: [44, 44], maxZoom: 15 })
    const t = setTimeout(() => m.invalidateSize(), 60)
    return () => { clearTimeout(t); m.remove() }
  }, [supplier])
  return <div className="minimap"><div ref={el} style={{ position: 'absolute', inset: 0 }} /></div>
}
