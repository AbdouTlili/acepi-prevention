'use client'
import Topbar from './Topbar'
import Icon from './Icon'
import type { Client } from '@/lib/types'
import { computeStatus, computeNextDue, MOIS_COURT, MOIS } from '@/lib/helpers'

interface Props {
  clients: Client[]
  reminder: string
  setReminder: (r: string) => void
  onPickClient: (c: Client) => void
  onNewClient: () => void
}

const REMINDER_OPTS = [
  { id: '1w', label: '1 semaine avant',  hint: 'Alerte rapprochée pour planification de dernière minute' },
  { id: '2w', label: '2 semaines avant', hint: "Équilibre recommandé — laisse le temps de caler la tournée" },
  { id: '1m', label: '1 mois avant',     hint: 'Idéal pour les clients en secteur éloigné (68-sud)' },
]

export default function Dashboard({ clients, reminder, setReminder, onPickClient, onNewClient }: Props) {
  const today = new Date()
  const withStatus = clients.map(c => ({ c, s: computeStatus(c, today) }))
  const overdue  = withStatus.filter(x => x.s.code === 'overdue')
  const due      = withStatus.filter(x => x.s.code === 'due')
  const soon     = withStatus.filter(x => x.s.code === 'soon')
  const upcoming = withStatus
    .filter(x => x.s.days >= -60 && x.s.days <= 45)
    .sort((a, b) => a.s.days - b.s.days)
    .slice(0, 8)

  const types = ['EXTINCTION', 'SSI', 'DESENFUMAGE', 'ALARME']
  const counts = types.map(t => clients.filter(c => c.prestation.includes(t)).length)
  const maxCount = Math.max(...counts, 1)
  const barColors = ['var(--red-600)', 'var(--navy-700)', 'var(--amber-500)', 'var(--emerald-600)']

  return (
    <>
      <Topbar
        title="Tableau de bord"
        right={<>
          <button className="btn"><Icon name="printer" size={14} />Tournée de la semaine</button>
          <button className="btn primary" onClick={onNewClient}><Icon name="plus" size={14} />Nouveau client</button>
        </>}
      />
      <div className="content">
        <div className="kpi-grid">
          <div className="kpi alert">
            <div className="accent" />
            <div className="label"><Icon name="flame" size={12} />Clients en retard</div>
            <div className="value">{overdue.length}</div>
            <div className="delta"><Icon name="trendUp" size={12} /> <b>{overdue.length}</b> intervention{overdue.length !== 1 ? 's' : ''} urgente{overdue.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="kpi warn">
            <div className="accent" />
            <div className="label"><Icon name="clock" size={12} />À intervenir (14 j)</div>
            <div className="value">{due.length}</div>
            <div className="delta">À planifier cette semaine</div>
          </div>
          <div className="kpi info">
            <div className="accent" />
            <div className="label"><Icon name="calendar" size={12} />Bientôt (45 j)</div>
            <div className="value">{soon.length}</div>
            <div className="delta">Planifier la prochaine tournée</div>
          </div>
          <div className="kpi ok">
            <div className="accent" />
            <div className="label"><Icon name="users" size={12} />Clients actifs</div>
            <div className="value">{clients.length}</div>
            <div className="delta"><b>{clients.length > 0 ? Math.round(((clients.length - overdue.length) / clients.length) * 100) : 0}%</b> à jour de leur maintenance</div>
          </div>
        </div>

        <div className="dash-grid">
          <div className="card">
            <div className="card-hd">
              <div>
                <h3>Maintenances à venir</h3>
                <div className="sub">Prochaines visites · triées par urgence</div>
              </div>
              <button className="btn sm ghost">Voir tout <Icon name="chevron" size={12} /></button>
            </div>
            <div className="upcoming">
              {upcoming.length === 0 && (
                <div className="muted" style={{ padding: 24, textAlign: 'center', fontSize: 12 }}>
                  Aucune intervention à venir.
                </div>
              )}
              {upcoming.map(({ c, s }) => {
                const d = computeNextDue(c)
                return (
                  <div className="up-row" key={c.ref} onClick={() => onPickClient(c)}>
                    <div className="up-date">
                      <div className="d">{d.getDate()}</div>
                      <div className="m">{MOIS_COURT[d.getMonth()]}</div>
                    </div>
                    <div className="up-main">
                      <div className="name">{c.nom}</div>
                      <div className="sub">
                        <span className="mono">{c.ref}</span>
                        <span>·</span>
                        <span><Icon name="mapPin" size={11} /> {c.ville} ({c.dept})</span>
                        <span>·</span>
                        <span>{c.contact}</span>
                      </div>
                    </div>
                    <div className="up-tags">
                      {c.prestation.map(p => <span key={p} className="chip neutral">{p}</span>)}
                    </div>
                    <span className={`chip ${s.code}`}>
                      <span className={`dot ${s.code}`} />
                      {s.code === 'overdue' ? `${Math.abs(s.days)} j en retard` :
                       s.code === 'due'     ? `Dans ${s.days} j` :
                       s.code === 'soon'    ? `Dans ${s.days} j` : 'OK'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-hd"><h3>Rappel automatique</h3></div>
              <div className="card-bd">
                <div className="reminder">
                  {REMINDER_OPTS.map(o => (
                    <div key={o.id} className={`reminder-opt ${reminder === o.id ? 'active' : ''}`} onClick={() => setReminder(o.id)}>
                      <div className="radio" />
                      <div className="txt">
                        <b>{o.label}</b>
                        <span>{o.hint}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-hd">
                <h3>Répartition par prestation</h3>
                <div className="sub">Actif</div>
              </div>
              <div className="card-bd">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {types.map((t, i) => (
                    <div key={t} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 28px', alignItems: 'center', gap: 10, fontSize: 12 }}>
                      <span style={{ fontWeight: 600 }}>{t}</span>
                      <div style={{ height: 10, background: 'var(--ink-100)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(counts[i] / maxCount) * 100}%`, background: barColors[i], borderRadius: 3 }} />
                      </div>
                      <span className="mono" style={{ textAlign: 'right', color: 'var(--ink-500)' }}>{counts[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
