'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from './Icon'

interface Props {
  view: string
  setView: (v: string) => void
  onNewClient: () => void
  clientCount: number
  technicien?: { nom: string; initiales: string; secteur: string }
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const NAV = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { id: 'clients',   label: 'Clients',          icon: 'users' },
  { id: 'calendar',  label: 'Calendrier',        icon: 'calendar' },
  { id: 'report',    label: 'Compte-rendu',      icon: 'file' },
  { id: 'insights',  label: 'Analyses',          icon: 'chart' },
]

export default function Sidebar({ view, setView, onNewClient, clientCount, technicien, mobileOpen, onMobileClose }: Props) {
  const router = useRouter()
  const [showPwChange, setShowPwChange] = useState(false)
  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')

  const activeView = view === 'client' ? 'clients' : view
  const tech = technicien ?? { nom: 'Utilisateur', initiales: 'AD', secteur: '67' }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const handleChangePw = async () => {
    setPwMsg('')
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
    })
    const data = await res.json()
    if (res.ok) { setPwMsg('✓ Mot de passe modifié'); setCurPw(''); setNewPw('') }
    else setPwMsg(data.error ?? 'Erreur')
  }

  const handleNavClick = (id: string) => {
    setView(id)
    onMobileClose?.()
  }

  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onMobileClose} />}
      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
      <div className="sb-brand">
        <div className="sb-brand-mark">
          <img src="/logo-acepi.png" alt="ACEPI" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
        </div>
        <div className="sb-brand-text">
          <div className="sb-brand-title">ACEPI Prévention</div>
          <div className="sb-brand-sub">Maintenance · v2.4</div>
        </div>
      </div>

      <div className="sb-section">Exploitation</div>
      <nav className="sb-nav">
        {NAV.map(n => (
          <div
            key={n.id}
            className={`sb-item ${activeView === n.id ? 'active' : ''}`}
            onClick={() => handleNavClick(n.id)}
          >
            <Icon name={n.icon} className="sb-icon" />
            <span>{n.label}</span>
            {n.id === 'clients' && <span className="count">{clientCount}</span>}
          </div>
        ))}
      </nav>

      <div style={{ padding: '14px 10px 6px' }}>
        <button onClick={onNewClient} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '9px 12px', borderRadius: 6, background: 'var(--red-600)', color: '#fff',
          border: 0, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
        }}>
          <Icon name="plus" size={13} />Nouveau client
        </button>
      </div>

      <div className="sb-section">Outils</div>
      <nav className="sb-nav">
        <div className="sb-item">
          <Icon name="bell" className="sb-icon" /><span>Rappels</span>
        </div>
        <div className={`sb-item ${view === 'settings' ? 'active' : ''}`} onClick={() => handleNavClick('settings')}>
          <Icon name="settings" className="sb-icon" /><span>Paramètres</span>
        </div>
      </nav>

      <div className="sb-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="sb-avatar">{tech.initiales}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tech.nom}</div>
            <div className="sb-user-role">Technicien · Secteur {tech.secteur}</div>
          </div>
          <button
            title="Déconnexion"
            onClick={handleLogout}
            style={{ color: 'rgba(255,255,255,0.45)', background: 'none', border: 0, cursor: 'pointer', padding: 4, borderRadius: 4 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 5l4 3-4 3M14 8H6"/>
            </svg>
          </button>
        </div>

        <button
          onClick={() => setShowPwChange(v => !v)}
          style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', background: 'none', border: 0, cursor: 'pointer', textAlign: 'left', padding: '2px 0', letterSpacing: '0.04em' }}
        >
          {showPwChange ? '▲ Fermer' : 'Changer le mot de passe'}
        </button>

        {showPwChange && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
            <input
              type="password" placeholder="Mot de passe actuel" value={curPw}
              onChange={e => setCurPw(e.target.value)}
              style={{ fontSize: 11.5, padding: '6px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', outline: 0 }}
            />
            <input
              type="password" placeholder="Nouveau mot de passe" value={newPw}
              onChange={e => setNewPw(e.target.value)}
              style={{ fontSize: 11.5, padding: '6px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', outline: 0 }}
            />
            <button onClick={handleChangePw} style={{
              fontSize: 11.5, padding: '6px 8px', borderRadius: 4, background: 'var(--red-600)',
              color: '#fff', border: 0, cursor: 'pointer', fontWeight: 600,
            }}>Modifier</button>
            {pwMsg && <span style={{ fontSize: 11, color: pwMsg.startsWith('✓') ? '#6EE7B7' : '#FCA5A5' }}>{pwMsg}</span>}
          </div>
        )}
      </div>
      </aside>
    </>
  )
}
