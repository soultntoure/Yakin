import { ArrowLeft, Phone, MessageCircle, ExternalLink, Check, Snowflake, MapPin, FileText, Info, Timer } from 'lucide-react'
import { byId, JAKIM_URL } from '../data/suppliers.js'
import { daysLeft } from '../lib/halal.js'
import { fmtDate, ago, rm } from '../lib/format.js'
import { STATUS, Thumb, Rating, Stars, Distance } from '../components/ui.jsx'
import { MiniMap } from '../components/Map.jsx'

function HalalCard({ s }) {
  const { Icon } = STATUS[s.halal]
  const c = s.cert
  const left = c && s.halal !== 'unverified' ? daysLeft(c) : null

  const head = {
    verified: ['JAKIM verified', `Certificate valid for another ${left} days`],
    expiring: ['Expiring soon', `Certificate valid for ${left} more ${left === 1 ? 'day' : 'days'}`],
    unverified: ['Not yet verified', 'We could not confirm this supplier'],
  }[s.halal]

  return (
    <div className={`card halal ${s.halal}`}>
      <div className="halal-top">
        <div className="halal-ico"><Icon size={28} strokeWidth={2} /></div>
        <div>
          <h3>{head[0]}</h3>
          <p>{head[1]}</p>
        </div>
      </div>

      {c ? (
        <>
          <dl className="kv" style={{ margin: 0 }}>
            <div><dt>Scheme</dt><dd>{c.scheme}</dd></div>
            <div><dt>Certified premises</dt><dd>{c.premises}</dd></div>
            <div><dt>Certificate no.</dt><dd>{c.ref}</dd></div>
            <div><dt>Valid until</dt><dd>{fmtDate(c.expiry)}</dd></div>
            <div><dt>Last checked</dt><dd>{ago(c.checked)} · {fmtDate(c.checked)}</dd></div>
          </dl>
          <div className="checks">
            <div className="check"><Check size={17} strokeWidth={2.6} />Premises matched to the JAKIM directory</div>
            {s.halal === 'verified' ? (
              <div className="check"><Check size={17} strokeWidth={2.6} />Certificate is in date</div>
            ) : (
              <div className="check warn"><Timer size={17} strokeWidth={2.4} />Renewal due soon. Ask for the renewed certificate.</div>
            )}
            <div className="check"><Check size={17} strokeWidth={2.6} />Scheme covers chicken slaughter and supply</div>
          </div>
        </>
      ) : (
        <div className="halal-note" style={{ marginTop: 'var(--s4)' }}>
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <Info size={17} style={{ marginTop: 2 }} />
            <span>{s.pending} Ask the supplier for their JAKIM certificate before you order.</span>
          </div>
        </div>
      )}

      <a className="link press" href={JAKIM_URL} target="_blank" rel="noreferrer" style={c ? undefined : { marginTop: 0 }}>
        <span className="row"><FileText size={18} />View in JAKIM directory</span>
        <ExternalLink size={17} />
      </a>
    </div>
  )
}

export default function Detail({ id, go, back }) {
  const s = byId(id)
  if (!s) return null
  const delivery = s.delivery

  return (
    <div className="screen">
      <div className="scroll no-nav">
        <div className="d-hero">
          <button className="icon-btn d-back press" onClick={back} aria-label="Back"><ArrowLeft size={22} strokeWidth={2.2} /></button>
          <Thumb tone={s.tone} size={72} />
        </div>

        <div className="d-sheet">
          <div className="d-head">
            <h1>{s.name}</h1>
            <div className="meta" style={{ marginTop: 8, fontSize: 14 }}>
              <Rating value={s.rating} count={`${s.reviewCount} reviews`} />
              <i className="dot" />
              <Distance km={s.distanceKm} />
              <i className="dot" />
              <span className={`open-tag ${s.open ? 'yes' : 'no'}`}>{s.open ? 'Open' : 'Closed'}</span>
            </div>
            <div className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>{s.area} · {s.hours}</div>
            <div className="d-actions">
              <button className="press" onClick={(e) => e.preventDefault()}><Phone size={19} strokeWidth={2.2} />Call</button>
              <button className="press wa" onClick={(e) => e.preventDefault()}><MessageCircle size={19} strokeWidth={2.2} />WhatsApp</button>
            </div>
          </div>

          <section className="section">
            <h2>Halal status</h2>
            <HalalCard s={s} />
          </section>

          <section className="section">
            <h2>Products</h2>
            <div className="card">
              {s.products.map((p) => (
                <div className="prod" key={p.name + p.form}>
                  <div>
                    <b>{p.name}</b>
                    <div className="sub">
                      {p.form === 'Frozen' && <Snowflake size={13} strokeWidth={2.2} />}
                      {p.form} · min. {p.minKg} kg
                    </div>
                  </div>
                  <div className="p">{rm(p.price)}<small>indicative /kg</small></div>
                </div>
              ))}
            </div>
            <p className="fine">Prices are indicative and may change. Confirm with the supplier in your quote.</p>
          </section>

          <section className="section">
            <h2>Delivery</h2>
            <div className="card deliv">
              {delivery.yes ? (
                <>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Areas covered</div>
                    <div className="tags">{delivery.areas.map((a) => <span className="tag" key={a}>{a}</span>)}</div>
                  </div>
                  <dl className="kv" style={{ margin: '0 calc(var(--s4) * -1)' }}>
                    <div><dt>Delivery hours</dt><dd>{delivery.hours}</dd></div>
                    <div><dt>Typical lead time</dt><dd>{delivery.lead}</dd></div>
                    <div><dt>Delivery fee</dt><dd>{delivery.note}</dd></div>
                  </dl>
                </>
              ) : (
                <dl className="kv" style={{ margin: '0 calc(var(--s4) * -1)' }}>
                  <div><dt>Delivery</dt><dd>Not available</dd></div>
                  <div><dt>Pick-up hours</dt><dd>{delivery.hours.replace('Pick-up ', '')}</dd></div>
                  <div><dt>Order ready in</dt><dd>{delivery.lead.replace('Ready in ', '')}</dd></div>
                </dl>
              )}
            </div>
          </section>

          <section className="section">
            <h2>Reviews from restaurants</h2>
            <div className="card">
              {s.reviews.map((r) => (
                <div className="rv" key={r.by}>
                  <div className="rv-top"><b>{r.by}</b><Stars value={r.rating} /></div>
                  <p>{r.text}</p>
                  <div className="date">{fmtDate(r.date)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h2>Location</h2>
            <MiniMap supplier={s} />
            <div className="addr"><MapPin size={17} style={{ marginTop: 2 }} />{s.address}</div>
          </section>
        </div>
      </div>

      <div className="cta">
        <div className="from"><small>From</small><b>{rm(s.fromPrice)}</b><small style={{ display: 'inline', marginLeft: 3 }}>/kg</small></div>
        <button className="btn btn-primary press" onClick={() => go(`/s/${s.id}/quote`)}>Request quote</button>
      </div>
    </div>
  )
}
