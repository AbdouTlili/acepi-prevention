'use client'
import { useState } from 'react'
import Topbar from './Topbar'
import Icon from './Icon'
import type { Client } from '@/lib/types'
import { computeStatus, computeNextDue, formatDate } from '@/lib/helpers'

interface Props {
  clients: Client[]
  selected?: Client | null
  onPickClient: (c: Client) => void
  onNewClient: () => void
  onImport: () => void
}

export default function ClientList({ clients, selected, onPickClient, onNewClient, onImport }: Props) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [dept, setDept] = useState('all')
  const today = new Date()

  const rows = clients
    .map(c => ({ c, s: computeStatus(c, today), d: computeNextDue(c) }))
    .filter(({ c, s }) => {
      if (filter !== 'all' && s.code !== filter) return false
      if (dept !== 'all' && c.dept !== dept) return false
      const query = q.toLowerCase()
      if (query && !(
        c.nom.toLowerCase().includes(query) ||
        c.ref.toLowerCase().includes(query) ||
        c.ville.toLowerCase().includes(query) ||
        c.contact.toLowerCase().includes(query)
      )) return false
      return true
    })
    .sort((a, b) => a.s.days - b.s.days)

  const handleExportCSV = () => {
    const header = ['Réf','Raison sociale','Contact','Ville','Dept','Prestation','Dernière visite','Prochaine visite','Statut']
    const csvRows = rows.map(({ c, s, d }) => [
      c.ref, c.nom, c.contact, c.ville, c.dept,
      c.prestation.join('+'),
      `${c.moisIntervention}/${c.anneeDerniere}`,
      formatDate(d),
      s.label,
    ])
    const csv = [header, ...csvRows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'acepi-clients.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Topbar
        title="Clients"
        onSearch={setQ}
        right={<>
          <button className="btn" onClick={onImport}><Icon name="upload" size={14} />Importer Excel</button>
          <button className="btn" onClick={handleExportCSV}><Icon name="download" size={14} />Exporter CSV</button>
          <button className="btn primary" onClick={onNewClient}><Icon name="plus" size={14} />Nouveau client</button>
        </>}
      />
      <div className="content">
        <div className="filter-bar">
          <div className="search" style={{ width: 320 }}>
            <Icon name="search" size={14} />
            <input placeholder="Nom, référence, ville…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="seg">
            {([['all','Tous'],['overdue','En retard'],['due','À prévoir'],['soon','Bientôt'],['ok','À jour']] as [string,string][]).map(([k, v]) => (
              <button key={k} className={filter === k ? 'active' : ''} onClick={() => setFilter(k)}>{v}</button>
            ))}
          </div>
          <div className="seg">
            {([['all','67 + 68'],['67','Bas-Rhin'],['68','Haut-Rhin']] as [string,string][]).map(([k, v]) => (
              <button key={k} className={dept === k ? 'active' : ''} onClick={() => setDept(k)}>{v}</button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <span className="muted" style={{ fontSize: 12 }}>
            <b style={{ color: 'var(--ink-900)' }}>{rows.length}</b> / {clients.length} clients
          </span>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Réf</th>
                <th>Raison sociale</th>
                <th>Contact</th>
                <th>Ville</th>
                <th>Prestation</th>
                <th>Dernière visite</th>
                <th>Prochaine visite</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ c, s, d }) => {
                const lastDate = new Date(c.anneeDerniere, c.moisIntervention - 1, 15)
                return (
                  <tr key={c.ref} onClick={() => onPickClient(c)} className={selected?.ref === c.ref ? 'selected' : ''}>
                    <td className="c-ref">{c.ref}</td>
                    <td className="c-name">{c.nom}</td>
                    <td>
                      {c.contact}
                      <div className="muted mono" style={{ fontSize: 10.5 }}>{c.tel}</div>
                    </td>
                    <td>{c.ville} <span className="muted">({c.dept})</span></td>
                    <td>
                      <div className="c-tags">
                        {c.prestation.map(p => <span key={p} className="mini">{p}</span>)}
                      </div>
                    </td>
                    <td className="mono">{formatDate(lastDate)}</td>
                    <td className="mono">{formatDate(d)}</td>
                    <td>
                      <span className={`chip ${s.code}`}>
                        <span className={`dot ${s.code}`} />
                        {s.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-500)' }}>
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
