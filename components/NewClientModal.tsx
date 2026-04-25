'use client'
import { useState } from 'react'
import Icon from './Icon'
import type { Client, Store } from '@/lib/types'
import { MOIS } from '@/lib/helpers'

interface Props {
  store: Store
  onClose: () => void
  onCreate: (c: Omit<Client, 'id'>) => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

export default function NewClientModal({ store, onClose, onCreate }: Props) {
  const [c, setC] = useState<Omit<Client, 'id'>>({
    ref: `AC-${String(Math.floor(Math.random() * 900) + 100)}`,
    nom: '', contact: '', titre: '', tel: '', email: '',
    adresse: '', ville: '', cp: '', dept: '67',
    prestation: [], moisIntervention: new Date().getMonth() + 1, anneeDerniere: new Date().getFullYear(),
    ep6: 0, co2: 0, poudre: 0, ria: 0, alarmeT4: 0, ssi: 0, desenfumage: 0, obs: '',
  })

  const togglePresta = (code: string) => {
    setC(prev => ({
      ...prev,
      prestation: prev.prestation.includes(code)
        ? prev.prestation.filter(p => p !== code)
        : [...prev.prestation, code],
    }))
  }

  const canCreate = c.nom && c.contact && c.ville

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ width: 760 }} onClick={e => e.stopPropagation()}>
        <div className="card-hd">
          <div><h3>Nouveau client</h3><div className="sub">Les champs étoilés sont obligatoires</div></div>
          <button className="btn sm ghost" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        <div className="card-bd" style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 10 }}>
            <Field label="Réf *">
              <input className="input mono" value={c.ref} onChange={e => setC(p => ({ ...p, ref: e.target.value }))} />
            </Field>
            <Field label="Raison sociale *">
              <input className="input" value={c.nom} onChange={e => setC(p => ({ ...p, nom: e.target.value }))} />
            </Field>
            <Field label="Département">
              <select className="input select" value={c.dept} onChange={e => setC(p => ({ ...p, dept: e.target.value }))}>
                {store.secteurs.map(s => <option key={s.id} value={s.code}>{s.code} — {s.nom}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Field label="Contact *">
              <input className="input" value={c.contact} onChange={e => setC(p => ({ ...p, contact: e.target.value }))} />
            </Field>
            <Field label="Titre / fonction">
              <input className="input" value={c.titre} onChange={e => setC(p => ({ ...p, titre: e.target.value }))} />
            </Field>
            <Field label="Téléphone">
              <input className="input" value={c.tel} onChange={e => setC(p => ({ ...p, tel: e.target.value }))} />
            </Field>
          </div>

          <Field label="Email">
            <input className="input" value={c.email} onChange={e => setC(p => ({ ...p, email: e.target.value }))} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 120px', gap: 10 }}>
            <Field label="Adresse">
              <input className="input" value={c.adresse} onChange={e => setC(p => ({ ...p, adresse: e.target.value }))} />
            </Field>
            <Field label="Ville *">
              <input className="input" value={c.ville} onChange={e => setC(p => ({ ...p, ville: e.target.value }))} />
            </Field>
            <Field label="Code postal">
              <input className="input mono" value={c.cp} onChange={e => setC(p => ({ ...p, cp: e.target.value }))} />
            </Field>
          </div>

          <div>
            <div className="label" style={{ marginBottom: 6 }}>Prestations — cliquer pour sélectionner</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {store.prestations.map(p => {
                const on = c.prestation.includes(p.code)
                return (
                  <div key={p.id} onClick={() => togglePresta(p.code)} style={{
                    padding: '6px 10px', borderRadius: 4, fontWeight: 600, fontSize: 11, cursor: 'pointer',
                    background: on ? p.color : p.color + '15',
                    color: on ? '#fff' : p.color,
                    border: `1px solid ${on ? p.color : 'transparent'}`,
                  }}>{on && '✓ '}{p.code}</div>
                )
              })}
            </div>
          </div>

          <div>
            <div className="label" style={{ marginBottom: 6 }}>Cycle de maintenance</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10 }}>
              <Field label="Mois d'intervention annuel">
                <select className="input select" value={c.moisIntervention} onChange={e => setC(p => ({ ...p, moisIntervention: +e.target.value }))}>
                  {MOIS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </Field>
              <Field label="Dernière visite (année)">
                <input className="input mono" value={c.anneeDerniere} onChange={e => setC(p => ({ ...p, anneeDerniere: +e.target.value || p.anneeDerniere }))} />
              </Field>
            </div>
          </div>

          <div>
            <div className="label" style={{ marginBottom: 6 }}>Parc d'équipements</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {([
                ['EP6',    'ep6',     'Extincteurs EP6'],
                ['CO2',    'co2',     'Extincteurs CO₂'],
                ['POUDRE', 'poudre',  'Extincteurs Poudre'],
                ['RIA',    'ria',     'RIA'],
                ['T4',     'alarmeT4','Alarme T4'],
                ['SSI',    'ssi',     'SSI'],
                ['DESENF', 'desenfumage', 'Désenfumage'],
              ] as [string, keyof Omit<Client,'id'|'ref'|'nom'|'contact'|'titre'|'tel'|'email'|'adresse'|'ville'|'dept'|'cp'|'prestation'|'obs'>, string][]).map(([code, key, lbl]) => (
                <Field key={code} label={lbl}>
                  <input className="input mono" style={{ textAlign: 'center' }}
                    value={c[key] as number}
                    onChange={e => setC(p => ({ ...p, [key]: +e.target.value || 0 }))} />
                </Field>
              ))}
            </div>
          </div>

          <Field label="Observations">
            <textarea className="input" rows={2} value={c.obs} onChange={e => setC(p => ({ ...p, obs: e.target.value }))} />
          </Field>
        </div>

        <div style={{ padding: 14, borderTop: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--paper-2)' }}>
          <span className="muted" style={{ fontSize: 11.5 }}>
            <Icon name="check" size={12} /> Ce client apparaîtra immédiatement dans la liste et le calendrier.
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onClose}>Annuler</button>
            <button
              className="btn primary"
              style={!canCreate ? { opacity: 0.5, pointerEvents: 'none' } : {}}
              onClick={() => canCreate && onCreate(c)}
            >
              <Icon name="plus" size={13} />Créer le client
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
