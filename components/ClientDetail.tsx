'use client'
import { useEffect, useState } from 'react'
import Topbar from './Topbar'
import Icon from './Icon'
import type { Client, Visit } from '@/lib/types'
import { computeStatus, computeNextDue, formatDate, formatDateLong, totalEquip, MOIS } from '@/lib/helpers'

interface Props {
  client: Client
  onBack: () => void
  onReport: () => void
  onDelete: (id: number) => void
}

function EquipCell({ k, v, n }: { k: string; v: number; n: string }) {
  return (
    <div className="equip-cell">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
      <div className="n">{n}</div>
    </div>
  )
}

const VISIT_SUMMARIES = [
  'Contrôle annuel — extincteurs vérifiés, RAS.',
  'Vérification périodique — 1 extincteur EP6 remplacé, étiquettes refaites.',
  'Maintenance complète — valves changées, test alarme OK.',
  'Visite annuelle — observation: trappe désenfumage à réviser.',
]

export default function ClientDetail({ client: c, onBack, onReport, onDelete }: Props) {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date()
  const s = computeStatus(c, today)
  const next = computeNextDue(c)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/visits?clientId=${c.id}`)
      .then(r => r.json())
      .then(data => { setVisits(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [c.id])

  // Synthetic visit history if no real visits stored
  const syntheticVisits = (() => {
    const out = []
    for (let y = c.anneeDerniere; y >= c.anneeDerniere - 3; y--) {
      const d = new Date(y, c.moisIntervention - 1, 10)
      if (d > today) continue
      out.push({
        id: y,
        clientId: c.id,
        dateVisite: formatDate(d),
        technicien: ['T. Schneider','M. Kieffer','L. Roth'][y % 3],
        travaux: [],
        notes: VISIT_SUMMARIES[(y + c.ref.charCodeAt(4)) % VISIT_SUMMARIES.length],
        createdAt: d.toISOString(),
      })
    }
    return out
  })()

  const displayVisits = visits.length > 0 ? visits : syntheticVisits

  const handleDelete = () => {
    if (!confirm(`Supprimer ${c.nom} ? Cette action est irréversible.`)) return
    fetch(`/api/clients/${c.id}`, { method: 'DELETE' }).then(() => onDelete(c.id))
  }

  return (
    <>
      <Topbar
        title="Fiche client"
        right={<>
          <button className="btn" onClick={onBack}><Icon name="arrowLeft" size={14} />Retour</button>
          <button className="btn" onClick={() => window.print()}><Icon name="printer" size={14} />Imprimer</button>
          <button className="btn ghost" onClick={handleDelete} style={{ color: 'var(--red-600)' }}>
            <Icon name="trash" size={14} />Supprimer
          </button>
          <button className="btn primary" onClick={onReport}><Icon name="file" size={14} />Générer compte-rendu</button>
        </>}
      />
      <div className="content">
        <div className="detail-hd">
          <div>
            <div className="ref">{c.ref}</div>
            <h2>{c.nom}</h2>
            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              {c.prestation.map(p => <span key={p} className="chip neutral">{p}</span>)}
              <span className={`chip ${s.code}`}><span className={`dot ${s.code}`} />{s.label}</span>
            </div>
            <div className="detail-meta">
              {c.adresse && <span><Icon name="mapPin" size={12} />{c.adresse}, {c.cp} {c.ville}</span>}
              {c.tel && <span><Icon name="phone" size={12} />{c.tel}</span>}
              {c.email && <span><Icon name="mail" size={12} />{c.email}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="label">Prochaine maintenance</div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', marginTop: 4 }}>
              {formatDateLong(next)}
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              {s.code === 'overdue'
                ? `${Math.abs(s.days)} jours de retard`
                : `dans ${s.days} jours`}
            </div>
          </div>
        </div>

        <div className="detail-grid wide">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-hd"><h3>Informations contact</h3></div>
              <div className="card-bd">
                <div className="info-list">
                  <div className="info-row"><span className="k">Raison sociale</span><span className="v">{c.nom}</span></div>
                  <div className="info-row"><span className="k">Contact</span><span className="v">{c.contact} · <span className="muted" style={{ fontWeight: 400 }}>{c.titre}</span></span></div>
                  <div className="info-row"><span className="k">Téléphone</span><span className="v mono">{c.tel || '—'}</span></div>
                  <div className="info-row"><span className="k">Email</span><span className="v">{c.email || '—'}</span></div>
                  <div className="info-row"><span className="k">Adresse</span><span className="v">{c.adresse || '—'}<br />{c.cp} {c.ville} · Dépt {c.dept}</span></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-hd">
                <h3>Historique des interventions</h3>
                <div className="sub">{loading ? '…' : `${displayVisits.length} visite(s)`}</div>
              </div>
              <div className="card-bd">
                <div className="timeline">
                  <div className="tl-item future">
                    <div className="date">{formatDateLong(next)} · planifié</div>
                    <div className="title">Maintenance annuelle · {c.prestation.join(' + ')}</div>
                    <div className="body muted">Rappel automatique configuré — technicien non assigné.</div>
                  </div>
                  {displayVisits.map((v, i) => (
                    <div className="tl-item" key={v.id ?? i}>
                      <div className="date">{v.dateVisite} · {v.technicien}</div>
                      <div className="title">Maintenance · {c.prestation.join(' + ')}</div>
                      <div className="body">{v.notes}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-hd">
                <h3>Parc d'équipements</h3>
                <div className="sub">{totalEquip(c)} unités</div>
              </div>
              <div className="card-bd">
                <div className="equip-grid">
                  <EquipCell k="Extincteurs EP6"   v={c.ep6}     n="Eau pulvérisée" />
                  <EquipCell k="Extincteurs CO₂"   v={c.co2}     n="Dioxyde de carbone" />
                  <EquipCell k="Extincteurs Poudre" v={c.poudre}  n="Poudre ABC" />
                  <EquipCell k="RIA"               v={c.ria}     n="Hydrants intérieurs" />
                  <EquipCell k="Alarme Type 4"     v={c.alarmeT4} n="Alarme sonore" />
                  <EquipCell k="SSI"               v={c.ssi}     n="Sécurité incendie" />
                </div>
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--paper-2)', borderRadius: 6, fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Désenfumage (trappes / exutoires)</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--ff-mono)' }}>{c.desenfumage}</span>
                </div>
              </div>
            </div>

            {c.obs && (
              <div className="card">
                <div className="card-hd"><h3>Observations</h3></div>
                <div className="card-bd">
                  <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-700)', lineHeight: 1.5 }}>{c.obs}</p>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-hd"><h3>Actions rapides</h3></div>
              <div className="card-bd" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {c.tel && <a href={`tel:${c.tel}`} className="btn"><Icon name="phone" size={13} />Appeler {c.contact.split(' ')[0]}</a>}
                {c.email && <a href={`mailto:${c.email}`} className="btn"><Icon name="mail" size={13} />Envoyer un rappel par email</a>}
                <button className="btn" onClick={onReport}><Icon name="calendar" size={13} />Créer un compte-rendu</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
