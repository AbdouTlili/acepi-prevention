'use client'
import { useRef, useState } from 'react'
import Icon from './Icon'

interface Props {
  onClose: () => void
  onDone: () => void
}

interface ImportResult {
  inserted: number
  skipped: number
  errors: string[]
}

export default function ImportModal({ onClose, onDone }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const doImport = async (file: File) => {
    setLoading(true)
    setError('')
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/import', { method: 'POST', body: form })
      const data: ImportResult = await res.json()
      setResult(data)
    } catch {
      setError("Erreur lors de l'import.")
    }
    setLoading(false)
  }

  const handleFile = (file: File | null) => {
    if (!file) return
    if (!file.name.match(/\.(xlsx?|csv)$/i)) { setError('Fichier non supporté. Utiliser .xlsx ou .xls'); return }
    doImport(file)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
        <div className="card-hd">
          <div><h3>Importer depuis Excel</h3><div className="sub">Colonnes selon le format ACEPI (réf, prestation, mois, année, …)</div></div>
          <button className="btn sm ghost" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        <div className="card-bd">
          {!result ? (
            <>
              <div
                className={`import-zone ${dragging ? 'drag' : ''}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
              >
                <Icon name="upload" size={32} />
                <p style={{ margin: '12px 0 4px', fontWeight: 600, fontSize: 14 }}>
                  {loading ? 'Import en cours…' : 'Glisser le fichier Excel ici'}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-500)' }}>ou cliquer pour sélectionner</p>
                <p style={{ margin: '12px 0 0', fontSize: 11, color: 'var(--ink-400)' }}>
                  .xlsx · .xls — Import idempotent : les références existantes ne sont pas écrasées
                </p>
              </div>
              <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
              {error && <p style={{ color: 'var(--red-600)', fontSize: 12, marginTop: 8 }}>{error}</p>}
            </>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: 'var(--emerald-50)', borderRadius: 8, padding: '16px 18px' }}>
                  <div className="label" style={{ color: 'var(--emerald-600)' }}>Clients insérés</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--emerald-600)' }}>{result.inserted}</div>
                </div>
                <div style={{ background: 'var(--amber-50)', borderRadius: 8, padding: '16px 18px' }}>
                  <div className="label" style={{ color: '#A76E00' }}>Doublons ignorés</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#A76E00' }}>{result.skipped}</div>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div style={{ background: 'var(--red-50)', border: '1px solid var(--red-600)', borderRadius: 6, padding: 12, fontSize: 11.5 }}>
                  <b style={{ color: 'var(--red-700)' }}>Lignes avec erreurs :</b>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                    {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                    {result.errors.length > 5 && <li>…et {result.errors.length - 5} autres</li>}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: 14, borderTop: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: 'var(--paper-2)' }}>
          {result ? (
            <>
              <button className="btn" onClick={() => setResult(null)}>Importer un autre fichier</button>
              <button className="btn primary" onClick={() => { onDone(); onClose() }}>Terminé</button>
            </>
          ) : (
            <button className="btn" onClick={onClose}>Annuler</button>
          )}
        </div>
      </div>
    </div>
  )
}
