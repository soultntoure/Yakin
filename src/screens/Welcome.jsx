import { ShieldCheck, MapPin, Truck, ArrowRight, Check } from 'lucide-react'

function Art() {
  // Quiet topographic rings, a nod to the Kuantan river bend. No gradients.
  return (
    <svg className="welcome-art" viewBox="0 0 390 800" preserveAspectRatio="xMidYMin slice" fill="none" aria-hidden="true">
      {[70, 120, 175, 235, 300, 370].map((r, i) => (
        <ellipse key={r} cx="330" cy="120" rx={r * 1.1} ry={r * 0.85} stroke="rgba(246,242,234,0.07)" strokeWidth="1.5" transform={`rotate(${-18 + i * 3} 330 120)`} />
      ))}
      {[90, 150, 220].map((r) => (
        <ellipse key={r} cx="40" cy="560" rx={r} ry={r * 0.7} stroke="rgba(246,242,234,0.05)" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

export default function Welcome({ go }) {
  return (
    <div className="screen welcome">
      <Art />
      <div className="welcome-body" style={{ paddingBottom: 'calc(var(--nav-h) + var(--s5))' }}>
        <div className="brand">
          <div className="brand-mark"><ShieldCheck size={22} strokeWidth={2.4} /></div>
          Amanah Ayam
        </div>

        <h1>
          Supplier ran out? Find <em>verified halal</em> chicken near you.
        </h1>
        <p className="lede">See who is JAKIM certified, how far they are, and what they charge. Before you pick up the phone.</p>

        <div className="how" aria-label="How it works">
          <span><Check size={16} strokeWidth={2.6} /> Verified halal</span>
          <i className="dot" />
          <span><MapPin size={16} strokeWidth={2.4} /> Nearby</span>
          <i className="dot" />
          <span><Truck size={16} strokeWidth={2.4} /> Delivered</span>
        </div>

        <button className="btn btn-primary press" onClick={() => go('/explore')}>
          Find suppliers near me
          <ArrowRight size={20} strokeWidth={2.4} />
        </button>
        <p className="demo-note">Demo data. All suppliers shown are fictional.</p>
      </div>
    </div>
  )
}
