import { useCallback, useEffect, useRef, useState } from 'react'
import { House, Map as MapIcon, ClipboardList } from 'lucide-react'
import Welcome from './screens/Welcome.jsx'
import Explore from './screens/Explore.jsx'
import Detail from './screens/Detail.jsx'
import { Quote, Sent, Requests } from './screens/Quote.jsx'

const path = () => window.location.hash.replace(/^#/, '') || '/'
const depth = (p) => (p === '/' || p === '/explore' || p === '/requests' ? 0 : p.split('/').length - 1)

function usePath() {
  const [p, setP] = useState(path)
  useEffect(() => {
    const on = () => setP(path())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return p
}

const load = () => {
  try { return JSON.parse(localStorage.getItem('aa-requests')) || [] } catch { return [] }
}

export default function App() {
  const p = usePath()
  const prev = useRef(p)
  const goingBack = depth(p) < depth(prev.current)
  useEffect(() => { prev.current = p }, [p])

  const [ui, setUi] = useState({ view: 'map', filters: {}, sort: 'nearest' })
  const [requests, setRequests] = useState(load)

  const go = useCallback((to) => { window.location.hash = to }, [])
  const back = useCallback(() => {
    if (window.history.length > 1) window.history.back()
    else go('/explore')
  }, [go])

  const send = (req) => {
    const next = [req, ...requests]
    setRequests(next)
    try { localStorage.setItem('aa-requests', JSON.stringify(next)) } catch { /* private mode */ }
    window.location.replace(`#/s/${req.id}/sent/${req.ref}`)
  }

  const parts = p.split('/').filter(Boolean)
  let screen
  let nav = true
  if (p === '/') screen = <Welcome go={go} />
  else if (p === '/explore') screen = <Explore go={go} ui={ui} setUi={setUi} />
  else if (p === '/requests') screen = <Requests requests={requests} go={go} />
  else if (parts[0] === 's' && parts[2] === 'quote') { nav = false; screen = <Quote id={parts[1]} back={back} onSend={send} /> }
  else if (parts[0] === 's' && parts[2] === 'sent') { nav = false; screen = <Sent id={parts[1]} req={requests.find((r) => r.ref === parts[3])} go={go} /> }
  else if (parts[0] === 's') { nav = false; screen = <Detail id={parts[1]} go={go} back={back} /> }
  else screen = <Welcome go={go} />

  const tab = p === '/' ? 'home' : p === '/explore' ? 'explore' : p === '/requests' ? 'requests' : null

  return (
    <div className="app">
      <div key={p.startsWith('/explore') ? '/explore' : p} className={`screen-host ${goingBack ? 'back' : ''}`} style={{ display: 'contents' }}>
        {screen}
      </div>
      {nav && (
        <nav className="nav" aria-label="Main">
          <button className={tab === 'home' ? 'on' : ''} onClick={() => go('/')}><House size={23} strokeWidth={tab === 'home' ? 2.5 : 2} />Home</button>
          <button className={tab === 'explore' ? 'on' : ''} onClick={() => go('/explore')}><MapIcon size={23} strokeWidth={tab === 'explore' ? 2.5 : 2} />Suppliers</button>
          <button className={tab === 'requests' ? 'on' : ''} onClick={() => go('/requests')}>
            <ClipboardList size={23} strokeWidth={tab === 'requests' ? 2.5 : 2} />Requests
            {requests.length > 0 && <span className="count-dot">{requests.length}</span>}
          </button>
        </nav>
      )}
    </div>
  )
}
