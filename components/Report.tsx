'use client'
import { useRef, useState } from 'react'
import Topbar from './Topbar'
import Icon from './Icon'
import type { Client, Store, TravauxType } from '@/lib/types'
import { MOIS } from '@/lib/helpers'

interface Props {
  client: Client
  store: Store
  onBack: () => void
  onSaved?: () => void
}

function pad(n: number) { return String(n).padStart(2, '0') }
function todayStr() {
  const d = new Date()
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export default function Report({ client: c, store, onBack, onSaved }: Props) {
  const pdfRef = useRef<HTMLDivElement>(null)
  const [date, setDate] = useState(todayStr())
  const [tech, setTech] = useState(store.techniciens[0]?.id ?? '')
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    store.travaux.forEach((t, i) => { init[t.id] = i < 3 })
    return init
  })
  const [qty, setQty] = useState<Record<string, string>>({})
  const [sub, setSub] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [extraTravaux, setExtraTravaux] = useState<TravauxType[]>([])
  const [quickLabel, setQuickLabel] = useState('')
  const [quickOpen, setQuickOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const allTravaux = [...store.travaux, ...extraTravaux]
  const techObj = store.techniciens.find(t => t.id === tech) ?? store.techniciens[0]

  const toggle = (id: string) => setChecked(v => ({ ...v, [id]: !v[id] }))

  const addQuick = () => {
    if (!quickLabel.trim()) { setQuickOpen(false); return }
    const item: TravauxType = { id: `tr-${Date.now()}`, label: quickLabel.trim(), unit: 'unité', withQty: true, withType: false }
    setExtraTravaux(p => [...p, item])
    setChecked(v => ({ ...v, [item.id]: true }))
    setQuickLabel('')
    setQuickOpen(false)
  }

  const handlePrint = () => {
    if (!pdfRef.current) return
    const html = pdfRef.current.innerHTML
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>Compte-rendu ACEPI</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; font-size: 10.5px; color: #0B1220; margin: 0; padding: 20px; }
        .pdf-hd { display: flex; justify-content: space-between; border-bottom: 2px solid #0A1A30; padding-bottom: 12px; margin-bottom: 14px; }
        .pdf-section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #0E2647; margin: 14px 0 6px; border-bottom: 1px solid #D8DCE4; padding-bottom: 3px; }
        .pdf-kv { display: grid; grid-template-columns: 80px 1fr; row-gap: 3px; font-size: 10px; }
        .pdf-kv .k { color: #5C6778; }
        .pdf-table { width: 100%; border-collapse: collapse; font-size: 10px; }
        .pdf-table th { text-align: left; font-weight: 600; background: #F3F3EE; padding: 5px 8px; border-bottom: 1px solid #D8DCE4; }
        .pdf-table td { padding: 5px 8px; border-bottom: 1px solid #ECEFF4; }
        .pdf-sig { display: flex; gap: 20px; margin-top: 20px; }
        .pdf-sig div { flex: 1; font-size: 9px; color: #5C6778; }
        .pdf-sig .line { height: 1px; background: #B6BDC9; margin-bottom: 4px; margin-top: 30px; }
        h1 { margin: 0; font-size: 16px; font-weight: 700; text-transform: uppercase; color: #0A1A30; }
        h1 span { display: block; font-size: 9.5px; font-weight: 500; color: #5C6778; letter-spacing: 0.1em; margin-top: 2px; }
      </style></head>
      <body>${html}</body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  const handleSave = async () => {
    setSaving(true)
    const travaux = allTravaux
      .filter(t => checked[t.id])
      .map(t => ({ ...t, qty: qty[t.id] ? Number(qty[t.id]) : undefined, subType: sub[t.id] }))
    await fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: c.id, dateVisite: date, technicien: techObj?.nom ?? '', travaux, notes }),
    })
    setSaving(false)
    onSaved?.()
    onBack()
  }

  const refNum = `${c.ref}-${date.replace(/\//g, '')}`

  return (
    <>
      <Topbar
        title="Compte-rendu de visite"
        crumb={`${c.ref} · ${c.nom}`}
        right={<>
          <button className="btn" onClick={onBack}><Icon name="arrowLeft" size={14} />Annuler</button>
          <button className="btn navy" onClick={handlePrint}><Icon name="printer" size={14} />Imprimer / PDF</button>
          <button className="btn primary" onClick={handleSave} disabled={saving}>
            <Icon name="download" size={14} />{saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </>}
      />
      <div className="content" style={{ padding: '18px 28px' }}>
        <div className="report-layout">
          {/* ── Form ── */}
          <div className="card report-form-col" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-hd">
              <h3>Saisie de l'intervention</h3>
              <div className="sub">Remplir et enregistrer</div>
            </div>
            <div className="card-bd" style={{ overflow: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label>Client</label>
                  <div className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--paper-2)' }}>
                    <span>{c.nom}</span><span className="mono muted">{c.ref}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Date de visite</label>
                  <input className="input" value={date} onChange={e => setDate(e.target.value)} placeholder="jj/mm/aaaa" />
                </div>
              </div>

              <div className="form-group">
                <label>Technicien</label>
                <select className="select input" value={tech} onChange={e => setTech(e.target.value)}>
                  {store.techniciens.map(t => (
                    <option key={t.id} value={t.id}>{t.nom} ({t.initiales}) — secteur {t.secteur}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ marginBottom: 0 }}>Travaux réalisés</label>
                  <span className="muted" style={{ fontSize: 10.5 }}>{allTravaux.length} types</span>
                </div>
                <div style={{ border: '1px solid var(--ink-200)', borderRadius: 6, padding: '2px 14px', marginTop: 6 }}>
                  {allTravaux.map(t => (
                    <div key={t.id} className={`check-row ${checked[t.id] ? 'on' : ''}`}>
                      <div className="cb" onClick={() => toggle(t.id)} />
                      <label onClick={() => toggle(t.id)}>{t.label}</label>
                      {checked[t.id] && t.withQty && (
                        <div className="qty">
                          <input value={qty[t.id] ?? ''} placeholder="0"
                            onChange={e => setQty(v => ({ ...v, [t.id]: e.target.value }))} />
                          <span className="muted" style={{ fontSize: 10.5 }}>{t.unit}</span>
                          {t.withType && (
                            <div className="qty-type">
                              {['EP6', 'CO2', 'POUDRE'].map(tp => (
                                <span key={tp} className={(sub[t.id] || 'EP6') === tp ? 'on' : ''}
                                  onClick={() => setSub(v => ({ ...v, [t.id]: tp }))}>
                                  {tp}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!quickOpen ? (
                  <button onClick={() => setQuickOpen(true)} style={{
                    marginTop: 8, width: '100%', padding: '10px 12px', borderRadius: 6,
                    border: '1.5px dashed var(--ink-300)', background: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontSize: 12, fontWeight: 500, color: 'var(--ink-500)', cursor: 'pointer',
                  }}>
                    <Icon name="plus" size={12} />Ajouter un type de travail
                  </button>
                ) : (
                  <div style={{ marginTop: 8, padding: 10, borderRadius: 6, border: '1.5px solid var(--navy-600)', background: 'var(--navy-50)', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Icon name="plus" size={13} />
                    <input className="input" autoFocus placeholder="ex. Vérification blocs BAES"
                      value={quickLabel} onChange={e => setQuickLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addQuick(); if (e.key === 'Escape') setQuickOpen(false) }}
                      style={{ flex: 1, padding: '6px 8px', background: '#fff' }} />
                    <button className="btn sm primary" onClick={addQuick}>Créer</button>
                    <button className="btn sm ghost" onClick={() => setQuickOpen(false)}><Icon name="x" size={12} /></button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Observations et détails libres</label>
                <textarea className="input" value={notes} onChange={e => setNotes(e.target.value)} rows={4} />
              </div>

              <div className="form-group">
                <label>Prochaine maintenance suggérée</label>
                <div className="input" style={{ background: 'var(--paper-2)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{MOIS[c.moisIntervention - 1]} {c.anneeDerniere + 1}</span>
                  <span className="muted" style={{ fontSize: 11 }}>Cycle annuel</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── PDF Preview ── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div className="label">Aperçu PDF</div>
              <button className="btn sm ghost" onClick={handlePrint}><Icon name="printer" size={12} />Imprimer</button>
            </div>
            <div className="pdf-preview" ref={pdfRef}>
              <div className="pdf-hd">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div className="logo"><img src="/logo-acepi.png" alt="ACEPI" style={{ maxWidth: 48, maxHeight: 48 }} /></div>
                  <div className="co">
                    <b style={{ color: 'var(--ink-900)', fontSize: 10.5 }}>ACEPI Sécurité · Formation · Conseils</b><br />
                    15 rue d'Altkirch · 67100 Strasbourg<br />
                    03 88 44 52 85 · contact@acepi.fr
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h1>Compte-rendu<span>Maintenance sécurité incendie</span></h1>
                  <div style={{ marginTop: 8, fontSize: 9.5, color: 'var(--ink-500)' }}>N° {refNum} · {date}</div>
                </div>
              </div>

              <div className="pdf-section-title">Client intervenu</div>
              <div className="pdf-kv">
                <span className="k">Raison sociale</span><span><b>{c.nom}</b></span>
                <span className="k">Contact</span><span>{c.contact} — {c.titre}</span>
                <span className="k">Adresse</span><span>{c.adresse}, {c.cp} {c.ville} (Dépt {c.dept})</span>
                <span className="k">Technicien</span><span>{techObj?.nom} ({techObj?.initiales})</span>
              </div>

              <div className="pdf-section-title">Travaux réalisés</div>
              <table className="pdf-table">
                <thead>
                  <tr>
                    <th>Prestation</th>
                    <th style={{ width: 60 }}>Qté</th>
                    <th style={{ width: 70 }}>Unité</th>
                    <th>Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  {allTravaux.filter(t => checked[t.id]).map(t => (
                    <tr key={t.id}>
                      <td>{t.label}{t.withType && sub[t.id] ? ` — ${sub[t.id]}` : ''}</td>
                      <td className="mono">{t.withQty ? (qty[t.id] || '—') : '—'}</td>
                      <td>{t.unit}</td>
                      <td>Conforme</td>
                    </tr>
                  ))}
                  {allTravaux.filter(t => checked[t.id]).length === 0 && (
                    <tr><td colSpan={4} style={{ color: 'var(--ink-400)', fontStyle: 'italic' }}>Aucun travail sélectionné</td></tr>
                  )}
                </tbody>
              </table>

              {notes && <>
                <div className="pdf-section-title">Observations</div>
                <p style={{ margin: 0, fontSize: 10, lineHeight: 1.5 }}>{notes}</p>
              </>}

              <div className="pdf-sig">
                <div><div className="line" />Signature technicien — {techObj?.initiales ?? ''}</div>
                <div><div className="line" />Signature client — {c.contact}</div>
              </div>
              <div style={{ marginTop: 14, fontSize: 8.5, color: 'var(--ink-500)', textAlign: 'center', borderTop: '1px solid var(--ink-200)', paddingTop: 8 }}>
                ACEPI Conseils · Prochaine visite : {MOIS[c.moisIntervention - 1]} {c.anneeDerniere + 1}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
