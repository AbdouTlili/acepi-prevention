'use client'
import Topbar from './Topbar'
import Icon from './Icon'
import type { Client } from '@/lib/types'
import { totalEquip, MOIS_COURT } from '@/lib/helpers'

interface Props { clients: Client[] }

export default function Insights({ clients }: Props) {
  const today = new Date()

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1)
    const count = clients.filter(c => c.moisIntervention - 1 === d.getMonth()).length
    return { m: d.getMonth(), y: d.getFullYear(), count }
  })
  const maxCount = Math.max(...monthlyData.map(m => m.count), 1)

  const types = [
    { k: 'EXTINCTION',  c: 'var(--red-600)'     },
    { k: 'SSI',         c: 'var(--navy-700)'     },
    { k: 'DESENFUMAGE', c: 'var(--amber-500)'    },
    { k: 'ALARME',      c: 'var(--emerald-600)'  },
  ]
  const donutCounts = types.map(t => clients.reduce((n, c) => n + (c.prestation.includes(t.k) ? 1 : 0), 0))
  const donutTotal = donutCounts.reduce((a, b) => a + b, 0) || 1

  let angle = -Math.PI / 2
  const arcs = types.map((t, i) => {
    const frac = donutCounts[i] / donutTotal
    const a0 = angle; const a1 = angle + frac * Math.PI * 2; angle = a1
    const r = 60, r2 = 38, cx = 70, cy = 70
    const large = (a1 - a0) > Math.PI ? 1 : 0
    const p = (ang: number, rr: number) => [cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr]
    const [x0, y0] = p(a0, r), [x1, y1] = p(a1, r), [x2, y2] = p(a1, r2), [x3, y3] = p(a0, r2)
    return { d: `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r2},${r2} 0 ${large} 0 ${x3},${y3} Z`, c: t.c, k: t.k, count: donutCounts[i], frac }
  })

  const dept67 = clients.filter(c => c.dept === '67').length
  const dept68 = clients.filter(c => c.dept === '68').length
  const totalClients = clients.length || 1

  const cityMap: Record<string, number> = {}
  clients.forEach(c => { cityMap[c.ville] = (cityMap[c.ville] || 0) + 1 })
  const cities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const totalEquipCount = clients.reduce((n, c) => n + totalEquip(c), 0)
  const conformRate = clients.length > 0
    ? Math.round(((clients.length - clients.filter(c => { const d = new Date(c.anneeDerniere + 1, c.moisIntervention - 1, 15); return d < today }).length) / clients.length) * 100)
    : 100

  return (
    <>
      <Topbar
        title="Analyses"
        right={<>
          <div className="seg">
            <button className="active">12 mois</button>
            <button>6 mois</button>
            <button>Année civile</button>
          </div>
          <button className="btn"><Icon name="download" size={14} />Export</button>
        </>}
      />
      <div className="content">
        <div className="kpi-grid">
          <div className="kpi info">
            <div className="accent" />
            <div className="label">Clients actifs</div>
            <div className="value">{clients.length}</div>
            <div className="delta">Base totale enregistrée</div>
          </div>
          <div className="kpi ok">
            <div className="accent" />
            <div className="label">Taux de conformité</div>
            <div className="value">{conformRate}<span style={{ fontSize: 18, color: 'var(--ink-500)' }}>%</span></div>
            <div className="delta">Visites à jour / total</div>
          </div>
          <div className="kpi warn">
            <div className="accent" />
            <div className="label">Équipements en parc</div>
            <div className="value">{totalEquipCount}</div>
            <div className="delta">Extincteurs <b>EP6</b> majoritaires</div>
          </div>
          <div className="kpi">
            <div className="accent" style={{ background: 'var(--navy-600)' }} />
            <div className="label">Prestations distinctes</div>
            <div className="value">{donutTotal}</div>
            <div className="delta">Sur {clients.length} clients</div>
          </div>
        </div>

        <div className="insights-grid">
          <div className="card">
            <div className="card-hd">
              <div>
                <h3>Interventions par mois</h3>
                <div className="sub">12 derniers mois · toutes prestations</div>
              </div>
            </div>
            <div className="card-bd">
              <div className="chart-wrap">
                {monthlyData.map((d, i) => {
                  const h = (d.count / maxCount) * 180
                  return (
                    <div key={i} className="chart-bar" style={{
                      height: Math.max(h, 2),
                      background: i === 11 ? 'linear-gradient(180deg, var(--red-600), var(--red-700))' : undefined,
                    }}>
                      {d.count > 0 && <span className="v">{d.count}</span>}
                    </div>
                  )
                })}
              </div>
              <div className="chart-xaxis">
                {monthlyData.map((d, i) => <span key={i}>{MOIS_COURT[d.m]}</span>)}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hd"><h3>Répartition par prestation</h3></div>
            <div className="card-bd">
              <div className="donut">
                <svg className="donut-svg" viewBox="0 0 140 140">
                  {arcs.map((a, i) => a.count > 0 && <path key={i} d={a.d} fill={a.c} />)}
                  <circle cx="70" cy="70" r="36" fill="var(--white)" />
                  <text x="70" y="66" textAnchor="middle" style={{ fontSize: 22, fontWeight: 700 }} fill="var(--ink-900)">{donutTotal}</text>
                  <text x="70" y="82" textAnchor="middle" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }} fill="var(--ink-500)">prestations</text>
                </svg>
                <div className="donut-legend">
                  {arcs.map((a, i) => (
                    <div key={i} className="legend-row">
                      <span className="lbl"><span className="sw" style={{ background: a.c }} />{a.k}</span>
                      <span className="cnt">{a.count} · {Math.round(a.frac * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="insights-grid" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="card-hd">
              <h3>Clients par département & ville</h3>
              <div className="sub">Bas-Rhin (67) · Haut-Rhin (68)</div>
            </div>
            <div className="card-bd">
              <div className="dept-bars">
                <div className="dept-row">
                  <span className="dn">67</span>
                  <div className="track"><div className="fill" style={{ width: `${(dept67 / totalClients) * 100}%` }} /></div>
                  <span className="cnt">{dept67}</span>
                </div>
                <div className="dept-row">
                  <span className="dn">68</span>
                  <div className="track"><div className="fill r" style={{ width: `${(dept68 / totalClients) * 100}%` }} /></div>
                  <span className="cnt">{dept68}</span>
                </div>
              </div>
              <div className="divider" style={{ margin: '14px 0' }} />
              <div className="label" style={{ marginBottom: 8 }}>Top villes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cities.map(([v, n]) => (
                  <div key={v} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--ink-100)', fontSize: 12.5 }}>
                    <span><Icon name="mapPin" size={12} /> {v}</span>
                    <span className="mono muted">{n} client{n > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hd">
              <h3>Couverture géographique</h3>
              <div className="sub">Alsace (67 · 68)</div>
            </div>
            <div className="card-bd">
              <div className="map-placeholder">
                [ carte interactive Alsace ]<br />
                <span style={{ opacity: 0.7 }}>Pin par client · zoom dép. 67 / 68</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
