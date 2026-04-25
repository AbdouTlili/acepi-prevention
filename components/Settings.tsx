'use client'
import { useReducer, useState } from 'react'
import Topbar from './Topbar'
import Icon from './Icon'
import type { Store } from '@/lib/types'

type Action =
  | { type: 'add';    list: keyof Store; item: Record<string, unknown> }
  | { type: 'remove'; list: keyof Store; id: string }

function storeReducer(state: Store, action: Action): Store {
  if (action.type === 'add')    return { ...state, [action.list]: [...(state[action.list] as unknown[]), action.item] }
  if (action.type === 'remove') return { ...state, [action.list]: (state[action.list] as { id: string }[]).filter(x => x.id !== action.id) }
  return state
}

interface Props {
  initialStore: Store
  onStoreChange: (s: Store) => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="label" style={{ marginBottom: 4 }}>{label}</div>{children}</div>
}

function ToggleRow({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
      border: '1px solid var(--ink-200)', borderRadius: 5, cursor: 'pointer', fontSize: 12.5,
      background: on ? 'var(--navy-50)' : 'var(--white)',
    }}>
      <div style={{ width: 26, height: 14, borderRadius: 10, background: on ? 'var(--navy-700)' : 'var(--ink-300)', position: 'relative', flex: 'none' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: on ? 14 : 2, transition: 'left 120ms' }} />
      </div>
      <span>{label}</span>
    </div>
  )
}

export default function Settings({ initialStore, onStoreChange }: Props) {
  const [store, dispatch] = useReducer(storeReducer, initialStore)
  const [tab, setTab] = useState('techniciens')
  const [saved, setSaved] = useState(false)

  const TABS = [
    { id: 'techniciens', label: 'Techniciens',         icon: 'users',      n: store.techniciens.length },
    { id: 'prestations', label: 'Types de prestation',  icon: 'shield',     n: store.prestations.length },
    { id: 'travaux',     label: 'Types de travaux',     icon: 'check',      n: store.travaux.length },
    { id: 'equipements', label: 'Équipements',           icon: 'extincteur', n: store.equipements.length },
    { id: 'secteurs',    label: 'Secteurs / Dépts',     icon: 'mapPin',     n: store.secteurs.length },
  ]

  const save = async () => {
    for (const key of Object.keys(store) as (keyof Store)[]) {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: store[key] }),
      })
    }
    onStoreChange(store)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <Topbar
        title="Paramètres"
        right={<>
          <button className="btn primary" onClick={save}><Icon name="check" size={14} />{saved ? 'Enregistré !' : 'Enregistrer'}</button>
        </>}
      />
      <div className="content settings-layout">
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="label" style={{ padding: '0 8px 8px' }}>Variables de la plateforme</div>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
              borderRadius: 6, background: tab === t.id ? 'var(--navy-50)' : 'transparent',
              color: tab === t.id ? 'var(--navy-800)' : 'var(--ink-700)',
              fontWeight: tab === t.id ? 600 : 500, fontSize: 12.5, border: 0, textAlign: 'left', cursor: 'pointer',
            }}>
              <Icon name={t.icon} size={14} />
              <span style={{ flex: 1 }}>{t.label}</span>
              <span className="mono muted" style={{ fontSize: 11 }}>{t.n}</span>
            </button>
          ))}
          <div style={{ padding: 12, background: 'var(--paper-2)', border: '1px solid var(--ink-100)', borderRadius: 6, margin: '16px 4px', fontSize: 11.5, color: 'var(--ink-700)', lineHeight: 1.45 }}>
            Ces listes alimentent <b>tous</b> les formulaires. Un ajout ici apparaît immédiatement dans les menus déroulants.
          </div>
        </aside>

        <div>
          {tab === 'techniciens' && <TechniciensTab items={store.techniciens} dispatch={dispatch} />}
          {tab === 'prestations' && <PrestationsTab items={store.prestations} dispatch={dispatch} />}
          {tab === 'travaux'     && <TravauxTab     items={store.travaux}     dispatch={dispatch} />}
          {tab === 'equipements' && <EquipementsTab items={store.equipements} dispatch={dispatch} />}
          {tab === 'secteurs'    && <SecteursTab    items={store.secteurs}    dispatch={dispatch} />}
        </div>
      </div>
    </>
  )
}

// ── Techniciens ────────────────────────────────────────────────
function TechniciensTab({ items, dispatch }: { items: Store['techniciens']; dispatch: (a: Action) => void }) {
  const [d, setD] = useState({ nom: '', initiales: '', tel: '', email: '', secteur: '67' })
  const add = () => {
    if (!d.nom) return
    dispatch({ type: 'add', list: 'techniciens', item: { ...d, id: `t-${Date.now()}` } })
    setD({ nom: '', initiales: '', tel: '', email: '', secteur: '67' })
  }
  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-hd"><div><h3>Ajouter un technicien</h3><div className="sub">Disponible immédiatement dans les comptes-rendus</div></div></div>
        <div className="card-bd">
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 80px 1fr 1.3fr 100px auto', gap: 10, alignItems: 'end' }}>
            <Field label="Nom complet"><input className="input" placeholder="Laure Roth" value={d.nom} onChange={e => setD({ ...d, nom: e.target.value })} /></Field>
            <Field label="Initiales"><input className="input mono" placeholder="LR" value={d.initiales} onChange={e => setD({ ...d, initiales: e.target.value.toUpperCase() })} /></Field>
            <Field label="Téléphone"><input className="input" placeholder="06 …" value={d.tel} onChange={e => setD({ ...d, tel: e.target.value })} /></Field>
            <Field label="Email"><input className="input" placeholder="prenom.nom@acepi.fr" value={d.email} onChange={e => setD({ ...d, email: e.target.value })} /></Field>
            <Field label="Secteur">
              <select className="input select" value={d.secteur} onChange={e => setD({ ...d, secteur: e.target.value })}>
                <option value="67">67 Bas-Rhin</option>
                <option value="68">68 Haut-Rhin</option>
                <option value="67+68">67 + 68</option>
              </select>
            </Field>
            <button className="btn primary" onClick={add}><Icon name="plus" size={13} />Ajouter</button>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="card-hd"><h3>Équipe ({items.length})</h3></div>
        <table className="tbl">
          <thead><tr><th>Init.</th><th>Nom</th><th>Secteur</th><th>Téléphone</th><th>Email</th><th style={{ width: 40 }}></th></tr></thead>
          <tbody>
            {items.map(t => (
              <tr key={t.id}>
                <td><span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy-700)', color: '#fff', display: 'inline-grid', placeItems: 'center', fontWeight: 600, fontSize: 10.5, fontFamily: 'var(--ff-mono)' }}>{t.initiales}</span></td>
                <td className="c-name">{t.nom}</td>
                <td>{t.secteur}</td>
                <td className="mono">{t.tel || '—'}</td>
                <td>{t.email || <span className="muted">—</span>}</td>
                <td><button className="btn sm ghost" onClick={() => dispatch({ type: 'remove', list: 'techniciens', id: t.id })}><Icon name="x" size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Prestations ────────────────────────────────────────────────
function PrestationsTab({ items, dispatch }: { items: Store['prestations']; dispatch: (a: Action) => void }) {
  const COLORS = ['#D40712','#22508F','#0E2647','#E89B0B','#0F8B61','#7A3AB8','#C04306','#0B7285']
  const [d, setD] = useState({ code: '', label: '', color: '#22508F' })
  const add = () => {
    if (!d.code || !d.label) return
    dispatch({ type: 'add', list: 'prestations', item: { ...d, id: `p-${Date.now()}`, code: d.code.toUpperCase() } })
    setD({ code: '', label: '', color: '#22508F' })
  }
  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-hd"><div><h3>Nouveau type de prestation</h3></div></div>
        <div className="card-bd">
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1.5fr 1fr auto', gap: 10, alignItems: 'end' }}>
            <Field label="Code"><input className="input mono" placeholder="ALARME" value={d.code} onChange={e => setD({ ...d, code: e.target.value.toUpperCase() })} /></Field>
            <Field label="Libellé"><input className="input" placeholder="Alarme incendie Type 4" value={d.label} onChange={e => setD({ ...d, label: e.target.value })} /></Field>
            <Field label="Couleur">
              <div style={{ display: 'flex', gap: 6, padding: '4px 0' }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setD({ ...d, color: c })}
                    style={{ width: 24, height: 24, borderRadius: 4, background: c, cursor: 'pointer', border: d.color === c ? '2px solid var(--ink-900)' : '2px solid transparent' }} />
                ))}
              </div>
            </Field>
            <button className="btn primary" onClick={add}><Icon name="plus" size={13} />Créer</button>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="card-hd"><h3>Prestations actives ({items.length})</h3></div>
        <table className="tbl">
          <thead><tr><th>Code</th><th>Libellé</th><th>Badge</th><th style={{ width: 40 }}></th></tr></thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id}>
                <td className="mono" style={{ fontWeight: 600 }}>{p.code}</td>
                <td>{p.label}</td>
                <td><span className="chip" style={{ background: p.color + '22', color: p.color }}>{p.code}</span></td>
                <td><button className="btn sm ghost" onClick={() => dispatch({ type: 'remove', list: 'prestations', id: p.id })}><Icon name="x" size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Travaux ────────────────────────────────────────────────────
function TravauxTab({ items, dispatch }: { items: Store['travaux']; dispatch: (a: Action) => void }) {
  const UNITS = ['unité', 'pièce', 'm²', 'heure', 'test']
  const [d, setD] = useState({ label: '', unit: 'unité', withQty: true, withType: false })
  const add = () => {
    if (!d.label) return
    dispatch({ type: 'add', list: 'travaux', item: { ...d, id: `tr-${Date.now()}` } })
    setD({ label: '', unit: 'unité', withQty: true, withType: false })
  }
  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-hd"><div><h3>Nouveau type de travaux</h3><div className="sub">Apparaît comme case à cocher dans le compte-rendu</div></div></div>
        <div className="card-bd">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 140px 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
            <Field label="Libellé"><input className="input" placeholder="Extincteurs remplacés" value={d.label} onChange={e => setD({ ...d, label: e.target.value })} /></Field>
            <Field label="Unité">
              <select className="input select" value={d.unit} onChange={e => setD({ ...d, unit: e.target.value })}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Quantité ?"><ToggleRow on={d.withQty} onClick={() => setD({ ...d, withQty: !d.withQty })} label={d.withQty ? 'Champ quantité' : 'Sans quantité'} /></Field>
            <Field label="Sous-type ?"><ToggleRow on={d.withType} onClick={() => setD({ ...d, withType: !d.withType })} label={d.withType ? 'EP6 / CO2 / …' : 'Sans sous-type'} /></Field>
            <button className="btn primary" onClick={add}><Icon name="plus" size={13} />Ajouter</button>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="card-hd"><h3>Travaux disponibles ({items.length})</h3></div>
        <table className="tbl">
          <thead><tr><th>Libellé</th><th>Unité</th><th>Quantité</th><th>Sous-type</th><th style={{ width: 40 }}></th></tr></thead>
          <tbody>
            {items.map(t => (
              <tr key={t.id}>
                <td className="c-name">{t.label}</td>
                <td className="muted">{t.unit}</td>
                <td>{t.withQty ? <span className="chip ok"><Icon name="check" size={10} />oui</span> : <span className="muted">non</span>}</td>
                <td>{t.withType ? <span className="chip soon"><Icon name="check" size={10} />oui</span> : <span className="muted">non</span>}</td>
                <td><button className="btn sm ghost" onClick={() => dispatch({ type: 'remove', list: 'travaux', id: t.id })}><Icon name="x" size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Équipements ────────────────────────────────────────────────
function EquipementsTab({ items, dispatch }: { items: Store['equipements']; dispatch: (a: Action) => void }) {
  const [d, setD] = useState({ code: '', label: '', categorie: 'Extincteur' })
  const add = () => {
    if (!d.code || !d.label) return
    dispatch({ type: 'add', list: 'equipements', item: { ...d, id: `e-${Date.now()}`, code: d.code.toUpperCase() } })
    setD({ code: '', label: '', categorie: 'Extincteur' })
  }
  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-hd"><div><h3>Nouveau type d'équipement</h3></div></div>
        <div className="card-bd">
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1.5fr 200px auto', gap: 10, alignItems: 'end' }}>
            <Field label="Code"><input className="input mono" placeholder="MOUSSE" value={d.code} onChange={e => setD({ ...d, code: e.target.value.toUpperCase() })} /></Field>
            <Field label="Libellé"><input className="input" placeholder="Extincteur à mousse" value={d.label} onChange={e => setD({ ...d, label: e.target.value })} /></Field>
            <Field label="Catégorie">
              <select className="input select" value={d.categorie} onChange={e => setD({ ...d, categorie: e.target.value })}>
                <option>Extincteur</option><option>Hydrant</option><option>Alarme</option><option>Désenfumage</option><option>Signalisation</option>
              </select>
            </Field>
            <button className="btn primary" onClick={add}><Icon name="plus" size={13} />Ajouter</button>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="card-hd"><h3>Inventaire typé ({items.length})</h3></div>
        <table className="tbl">
          <thead><tr><th>Code</th><th>Libellé</th><th>Catégorie</th><th style={{ width: 40 }}></th></tr></thead>
          <tbody>
            {items.map(e => (
              <tr key={e.id}>
                <td className="mono" style={{ fontWeight: 600 }}>{e.code}</td>
                <td>{e.label}</td>
                <td><span className="chip neutral">{e.categorie}</span></td>
                <td><button className="btn sm ghost" onClick={() => dispatch({ type: 'remove', list: 'equipements', id: e.id })}><Icon name="x" size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Secteurs ───────────────────────────────────────────────────
function SecteursTab({ items, dispatch }: { items: Store['secteurs']; dispatch: (a: Action) => void }) {
  const [d, setD] = useState({ code: '', nom: '' })
  const add = () => {
    if (!d.code) return
    dispatch({ type: 'add', list: 'secteurs', item: { ...d, id: `s-${Date.now()}` } })
    setD({ code: '', nom: '' })
  }
  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-hd"><div><h3>Nouveau secteur géographique</h3></div></div>
        <div className="card-bd">
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 10, alignItems: 'end' }}>
            <Field label="Code dépt."><input className="input mono" placeholder="57" value={d.code} onChange={e => setD({ ...d, code: e.target.value })} /></Field>
            <Field label="Nom"><input className="input" placeholder="Moselle" value={d.nom} onChange={e => setD({ ...d, nom: e.target.value })} /></Field>
            <button className="btn primary" onClick={add}><Icon name="plus" size={13} />Ajouter</button>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="card-hd"><h3>Secteurs couverts ({items.length})</h3></div>
        <table className="tbl">
          <thead><tr><th>Code</th><th>Nom</th><th style={{ width: 40 }}></th></tr></thead>
          <tbody>
            {items.map(s => (
              <tr key={s.id}>
                <td className="mono" style={{ fontWeight: 600 }}>{s.code}</td>
                <td>{s.nom}</td>
                <td><button className="btn sm ghost" onClick={() => dispatch({ type: 'remove', list: 'secteurs', id: s.id })}><Icon name="x" size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
