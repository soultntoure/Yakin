import { useEffect, useMemo, useState } from 'react'
import { Map as MapIcon, List, ArrowUpDown, ChevronRight, Check, SearchX, ShieldCheck, Truck, Package, Clock } from 'lucide-react'
import { suppliers } from '../data/suppliers.js'
import { filterSuppliers, sortSuppliers } from '../lib/suppliers.js'
import { SupplierMap } from '../components/Map.jsx'
import { Badge, Rating, Thumb, StockPill, DeliveryPill, Distance, Sheet, Scrim, Empty, CardSkeleton } from '../components/ui.jsx'
import { rm } from '../lib/format.js'

const CHIPS = [
  { key: 'verified', label: 'Verified halal', Icon: ShieldCheck },
  { key: 'delivers', label: 'Delivers', Icon: Truck },
  { key: 'inStock', label: 'In stock', Icon: Package },
  { key: 'openNow', label: 'Open now', Icon: Clock },
]
const SORTS = [
  { key: 'nearest', label: 'Nearest' },
  { key: 'rating', label: 'Top rated' },
  { key: 'price', label: 'Lowest price' },
]

let seen = false

function Preview({ s, go }) {
  return (
    <button className="press" style={{ display: 'block', width: '100%' }} onClick={() => go(`/s/${s.id}`)}>
      <div className="pv">
        <Thumb tone={s.tone} />
        <div className="pv-main">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 className="name">{s.name}</h3>
            <ChevronRight size={20} className="muted" style={{ marginTop: 1 }} />
          </div>
          <div className="meta">
            <Rating value={s.rating} count={s.reviewCount} />
            <i className="dot" />
            <Distance km={s.distanceKm} />
          </div>
          <div style={{ marginTop: 8 }}><Badge status={s.halal} /></div>
        </div>
      </div>
      <div className="facts">
        <div className="fact"><b>{rm(s.fromPrice)}</b><span>indicative /kg</span></div>
        <div className="fact"><b>{{ in: 'In stock', low: 'Low stock', out: 'Out today' }[s.stock]}</b><span>stock today</span></div>
        <div className="fact"><b>{s.delivers ? 'Yes' : 'Pick-up'}</b><span>delivery</span></div>
      </div>
    </button>
  )
}

function SupplierCard({ s, go }) {
  return (
    <button className="sc press" onClick={() => go(`/s/${s.id}`)}>
      <div className="pv">
        <Thumb tone={s.tone} size={32} />
        <div className="pv-main">
          <h3 className="name">{s.name}</h3>
          <div className="meta"><span className="muted">{s.area}</span><i className="dot" /><Distance km={s.distanceKm} /></div>
          <div style={{ marginTop: 8 }}><Badge status={s.halal} /></div>
          <div className="stat-row">
            <StockPill s={s} />
            <DeliveryPill s={s} />
          </div>
        </div>
      </div>
      <div className="sc-foot">
        <span className="price">{rm(s.fromPrice)}<small> /kg · indicative</small></span>
        <Rating value={s.rating} count={s.reviewCount} />
      </div>
    </button>
  )
}

export default function Explore({ go, ui, setUi }) {
  const { view, filters, sort } = ui
  const [loading, setLoading] = useState(!seen)
  const [selected, setSelected] = useState(null)
  const [sortOpen, setSortOpen] = useState(false)

  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => { seen = true; setLoading(false) }, 750)
    return () => clearTimeout(t)
  }, [loading])

  const shown = useMemo(() => sortSuppliers(filterSuppliers(suppliers, filters), sort), [filters, sort])
  const sel = shown.find((s) => s.id === selected)
  const toggle = (k) => setUi({ ...ui, filters: { ...filters, [k]: !filters[k] } })
  const sortLabel = SORTS.find((x) => x.key === sort).label
  const anyFilter = Object.values(filters).some(Boolean)

  return (
    <div className="screen explore">
      <div className="topbar">
        <div className="topbar-row">
          <div>
            <h1 className="title">Suppliers</h1>
            <div className="subtitle">Bandar Kuantan · {shown.length} nearby</div>
          </div>
          <div className="seg" role="tablist" aria-label="View">
            <button className={view === 'map' ? 'on' : ''} onClick={() => setUi({ ...ui, view: 'map' })} aria-label="Map view"><MapIcon size={17} strokeWidth={2.2} />Map</button>
            <button className={view === 'list' ? 'on' : ''} onClick={() => { setSelected(null); setUi({ ...ui, view: 'list' }) }} aria-label="List view"><List size={17} strokeWidth={2.2} />List</button>
          </div>
        </div>
        <div className="chips">
          <button className="chip sort press" onClick={() => setSortOpen(true)}><ArrowUpDown size={15} strokeWidth={2.2} />{sortLabel}</button>
          {CHIPS.map(({ key, label, Icon }) => (
            <button key={key} className={`chip press ${filters[key] ? 'on' : ''}`} aria-pressed={!!filters[key]} onClick={() => toggle(key)}>
              {filters[key] ? <Check size={15} strokeWidth={2.8} /> : <Icon size={15} strokeWidth={2.2} />}
              {label}
            </button>
          ))}
          <span style={{ width: 1, flexShrink: 0 }} />
        </div>
      </div>

      {view === 'map' ? (
        <div className="mapwrap">
          <SupplierMap suppliers={shown} selectedId={sel ? sel.id : null} onSelect={setSelected} bottomPad={280} />
          {loading && <div className="sk" style={{ position: 'absolute', inset: 0, zIndex: 400, borderRadius: 0 }} />}
          {!loading && shown.length === 0 && (
            <div className="sheet over-nav" style={{ animation: 'rise .3s' }}>
              <Empty icon={SearchX} title="No suppliers match" text="Try removing a filter to see more suppliers nearby." action={<button className="btn btn-primary press" onClick={() => setUi({ ...ui, filters: {} })}>Clear filters</button>} />
            </div>
          )}
          {sel && (
            <Sheet floating onClose={() => setSelected(null)} key={sel.id}>
              <Preview s={sel} go={go} />
            </Sheet>
          )}
        </div>
      ) : (
        <div className="scroll" style={{ paddingBottom: 'var(--s5)' }}>
          {loading ? (
            <div className="list"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
          ) : shown.length === 0 ? (
            <Empty icon={SearchX} title="No suppliers match" text="Try removing a filter to see more suppliers nearby." action={anyFilter && <button className="btn btn-primary press" onClick={() => setUi({ ...ui, filters: {} })}>Clear filters</button>} />
          ) : (
            <div className="list">
              {shown.map((s) => <SupplierCard key={s.id} s={s} go={go} />)}
            </div>
          )}
        </div>
      )}

      {sortOpen && (
        <>
          <Scrim onClick={() => setSortOpen(false)} />
          <Sheet onClose={() => setSortOpen(false)}>
            {(close) => (
              <>
                <h3 className="sheet-title">Sort suppliers</h3>
                {SORTS.map((o) => (
                  <button key={o.key} className="opt" onClick={() => { setUi({ ...ui, sort: o.key }); close() }}>
                    {o.label}
                    {sort === o.key && <Check size={20} strokeWidth={2.6} />}
                  </button>
                ))}
              </>
            )}
          </Sheet>
        </>
      )}
    </div>
  )
}
