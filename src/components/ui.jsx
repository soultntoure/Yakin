import { useRef, useState } from 'react'
import {
  Star, ShieldCheck, ShieldAlert, ShieldQuestion, Drumstick, Truck, Package, Clock, MapPin,
} from 'lucide-react'
import { formatDistance } from '../lib/geo.js'

export const STATUS = {
  verified: { label: 'JAKIM verified', Icon: ShieldCheck },
  expiring: { label: 'Expiring soon', Icon: ShieldAlert },
  unverified: { label: 'Not yet verified', Icon: ShieldQuestion },
}

export function Badge({ status }) {
  const { label, Icon } = STATUS[status]
  return (
    <span className={`badge ${status}`}>
      <Icon size={15} strokeWidth={2.4} />
      {label}
    </span>
  )
}

export function Rating({ value, count }) {
  return (
    <span className="rating">
      <Star size={14} strokeWidth={0} />
      {value.toFixed(1)}
      {count != null && <small>({count})</small>}
    </span>
  )
}

export function Stars({ value }) {
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} strokeWidth={1.8} className={i <= Math.round(value) ? 'f' : 'e'} />
      ))}
    </span>
  )
}

// A neat stand-in for supplier photos: tinted tile with a quiet pattern.
export function Thumb({ tone = 0, size = 28, className = '', style }) {
  const id = `p${tone}`
  return (
    <div className={`thumb tone-${tone} ${className}`} style={style} aria-hidden="true">
      <svg className="bg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <circle cx="3" cy="3" r="1.6" fill="rgba(255,255,255,0.16)" />
            <circle cx="14" cy="14" r="1.6" fill="rgba(255,255,255,0.16)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      <Drumstick className="glyph" size={size} strokeWidth={1.6} />
    </div>
  )
}

export function StockPill({ s }) {
  const map = {
    in: ['good', 'In stock'],
    low: ['low', 'Low stock'],
    out: ['off', 'Out today'],
  }
  const [cls, label] = map[s.stock]
  return (
    <span className={`pill ${cls}`}>
      <Package size={14} strokeWidth={2.2} />
      {label}
    </span>
  )
}

export function DeliveryPill({ s }) {
  return (
    <span className={`pill ${s.delivers ? '' : 'off'}`}>
      <Truck size={14} strokeWidth={2.2} />
      {s.delivers ? 'Delivers' : 'Pick-up only'}
    </span>
  )
}

export function OpenPill({ s }) {
  return (
    <span className={`pill ${s.open ? 'good' : 'off'}`}>
      <Clock size={14} strokeWidth={2.2} />
      {s.open ? 'Open now' : 'Closed'}
    </span>
  )
}

export function Distance({ km }) {
  return (
    <span className="pill">
      <MapPin size={14} strokeWidth={2.2} />
      {formatDistance(km)}
    </span>
  )
}

// Bottom sheet; the handle area can be dragged down to dismiss.
export function Sheet({ onClose, children, floating = false }) {
  const [dy, setDy] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const start = useRef(null)

  const close = () => {
    setLeaving(true)
    setTimeout(onClose, 200)
  }
  const down = (e) => {
    start.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e) => {
    if (start.current != null) setDy(Math.max(0, e.clientY - start.current))
  }
  const up = () => {
    if (start.current == null) return
    start.current = null
    if (dy > 70) close()
    else setDy(0)
  }

  return (
    <div
      className={`sheet ${floating ? 'over-nav' : ''} ${leaving ? 'leaving' : ''}`}
      style={dy ? { transform: `translateY(${dy}px)`, transition: 'none', animation: 'none' } : undefined}
      role="dialog"
    >
      <div
        className="grab-zone"
        style={{ touchAction: 'none', padding: '2px 0 6px', cursor: 'grab' }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <div className="grabber" style={{ marginBottom: 0 }} />
      </div>
      {typeof children === 'function' ? children(close) : children}
    </div>
  )
}

export function Scrim({ onClick }) {
  return <div className="scrim" onClick={onClick} />
}

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-ico"><Icon size={28} strokeWidth={1.8} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="sc" aria-hidden="true">
      <div className="pv">
        <div className="sk" style={{ width: 92, height: 108, borderRadius: 16 }} />
        <div className="pv-main" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="sk" style={{ height: 18, width: '75%' }} />
          <div className="sk" style={{ height: 13, width: '50%' }} />
          <div className="sk" style={{ height: 26, width: 118, borderRadius: 999 }} />
          <div className="sk" style={{ height: 13, width: '65%' }} />
        </div>
      </div>
      <div className="sc-foot">
        <div className="sk" style={{ height: 20, width: 90 }} />
        <div className="sk" style={{ height: 14, width: 60 }} />
      </div>
    </div>
  )
}
