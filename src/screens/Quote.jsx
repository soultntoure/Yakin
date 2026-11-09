import { useState } from 'react'
import { ArrowLeft, Minus, Plus, Check, Send, ClipboardList } from 'lucide-react'
import { byId } from '../data/suppliers.js'
import { rm } from '../lib/format.js'
import { Thumb, Badge, Empty } from '../components/ui.jsx'

const DAYS = ['Today', 'Tomorrow', 'In 2 days']
const TIMES = ['6:00 am', '8:00 am', '10:00 am', '12:00 pm', '2:00 pm', '4:00 pm']
const prodKey = (p) => `${p.name}|${p.form}`

export function Quote({ id, back, onSend }) {
  const s = byId(id)
  const [pk, setPk] = useState(prodKey(s.products[0]))
  const product = s.products.find((p) => prodKey(p) === pk)
  const [kg, setKg] = useState(product.minKg)
  const [day, setDay] = useState(1)
  const [time, setTime] = useState(TIMES[1])

  const pick = (p) => { setPk(prodKey(p)); setKg((k) => Math.max(k, p.minKg)) }
  const step = (d) => setKg((k) => Math.max(product.minKg, k + d))

  return (
    <div className="screen">
      <div className="plain-top">
        <button className="icon-btn press" onClick={back} aria-label="Back"><ArrowLeft size={22} strokeWidth={2.2} /></button>
        <div>
          <h1 className="title" style={{ fontSize: 20 }}>Request quote</h1>
          <div className="subtitle">{s.name}</div>
        </div>
      </div>

      <div className="scroll no-nav" style={{ paddingTop: 'var(--s3)' }}>
        <div className="form">
          <div className="field">
            <span className="lbl">Chicken type</span>
            <div className="opts">
              {s.products.map((p) => (
                <button key={prodKey(p)} className={`chip press ${pk === prodKey(p) ? 'on' : ''}`} onClick={() => pick(p)} aria-pressed={pk === prodKey(p)}>
                  {p.name} <small>{p.form}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="lbl">How much do you need?</span>
            <div className="stepper">
              <button className="press" onClick={() => step(-5)} aria-label="Less"><Minus size={22} strokeWidth={2.4} /></button>
              <div><b>{kg}</b><span>kg</span></div>
              <button className="press" onClick={() => step(5)} aria-label="More"><Plus size={22} strokeWidth={2.4} /></button>
            </div>
            <p className="fine">Minimum order {product.minKg} kg for this item.</p>
          </div>

          <div className="field">
            <span className="lbl">Needed by</span>
            <div className="opts" style={{ marginBottom: 'var(--s3)' }}>
              {DAYS.map((d, i) => (
                <button key={d} className={`chip press ${day === i ? 'on' : ''}`} onClick={() => setDay(i)} aria-pressed={day === i}>{d}</button>
              ))}
            </div>
            <select className="select" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Time">
              {TIMES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="card summary">
            <div className="est">Indicative total<b>{rm(product.price * kg)}</b></div>
            <span className="muted" style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{kg} kg × {rm(product.price)}</span>
          </div>
        </div>
      </div>

      <div className="cta">
        <button className="btn btn-primary press" onClick={() => onSend({ id: s.id, item: `${product.name} (${product.form.toLowerCase()})`, kg, when: `${DAYS[day]}, ${time}`, ref: `AA-${2040 + Math.floor(Math.random() * 900)}`, at: Date.now() })}>
          <Send size={18} strokeWidth={2.4} /> Send request
        </button>
      </div>
    </div>
  )
}

export function Sent({ id, req, go }) {
  const s = byId(id)
  return (
    <div className="screen sent">
      <div className="sent-ico"><Check size={48} strokeWidth={2.6} /></div>
      <h1>Quote request sent</h1>
      <p className="lede">Suppliers usually reply within {s.reply} minutes. We will show the reply under Requests.</p>
      <div className="card" style={{ padding: 'var(--s4)' }}>
        <div className="row" style={{ gap: 'var(--s3)' }}>
          <Thumb tone={s.tone} size={22} style={{ width: 48, height: 48, borderRadius: 14 }} />
          <div style={{ minWidth: 0 }}>
            <div className="name" style={{ fontSize: 16 }}>{s.name}</div>
            <div style={{ marginTop: 4 }}><Badge status={s.halal} /></div>
          </div>
        </div>
        {req && (
          <dl className="kv" style={{ margin: 'var(--s3) calc(var(--s4) * -1) 0' }}>
            <div><dt>Item</dt><dd>{req.item}</dd></div>
            <div><dt>Quantity</dt><dd>{req.kg} kg</dd></div>
            <div><dt>Needed by</dt><dd>{req.when}</dd></div>
            <div><dt>Reference</dt><dd>{req.ref}</dd></div>
          </dl>
        )}
      </div>
      <div className="actions">
        <button className="btn btn-primary press" onClick={() => go('/explore')}>Back to suppliers</button>
        <button className="btn btn-ghost press" onClick={() => go('/requests')}>View my requests</button>
      </div>
    </div>
  )
}

export function Requests({ requests, go }) {
  return (
    <div className="screen">
      <div className="topbar"><h1 className="title">My requests</h1><div className="subtitle">Quotes you have asked for</div></div>
      <div className="scroll">
        {requests.length === 0 ? (
          <Empty icon={ClipboardList} title="No requests yet" text="When you request a quote from a supplier, it will show up here." action={<button className="btn btn-primary press" onClick={() => go('/explore')}>Find suppliers</button>} />
        ) : (
          <div className="list">
            {requests.map((r) => {
              const s = byId(r.id)
              return (
                <div className="card req" key={r.ref}>
                  <Thumb tone={s.tone} size={20} />
                  <div className="req-main">
                    <b>{s.name}</b>
                    <span>{r.kg} kg {r.item} · {r.when}</span>
                  </div>
                  <span className="status-chip">Awaiting reply</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
