'use client'
import { useState } from 'react'
import Topbar from './Topbar'
import Icon from './Icon'
import type { Client } from '@/lib/types'
import { computeNextDue, computeStatus, formatDateLong, MOIS, JOURS } from '@/lib/helpers'

interface Props {
  clients: Client[]
  onPickClient: (c: Client) => void
}

type EventKind = 'done' | 'future' | 'overdue'
interface CalEvent { date: Date; c: Client; kind: EventKind }

export default function CalendarView({ clients, onPickClient }: Props) {
  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [picked, setPicked] = useState<Date | null>(null)

  const year  = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay  = new Date(year, month, 1)
  const startDay  = (firstDay.getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: { date: Date; other: boolean }[] = []
  for (let i = 0; i < startDay; i++) cells.push({ date: new Date(year, month, -startDay + i + 1), other: true })
  for (let i = 1; i <= daysInMonth; i++) cells.push({ date: new Date(year, month, i), other: false })
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month, daysInMonth + (cells.length - daysInMonth - startDay + 1)), other: true })
  }

  const events: CalEvent[] = []
  clients.forEach((c, idx) => {
    const s = computeStatus(c, today)
    const next = computeNextDue(c)
    const lastDay = 6 + (idx % 20)
    events.push({ date: new Date(c.anneeDerniere, c.moisIntervention - 1, lastDay), c, kind: 'done' })
    const futureKind: EventKind = s.code === 'overdue' ? 'overdue' : 'future'
    events.push({ date: new Date(next.getFullYear(), next.getMonth(), lastDay), c, kind: futureKind })
  })

  const eventsOn = (d: Date) => events.filter(e =>
    e.date.getFullYear() === d.getFullYear() &&
    e.date.getMonth() === d.getMonth() &&
    e.date.getDate() === d.getDate()
  )

  const pickedEvents = picked ? eventsOn(picked) : eventsOn(today)

  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()

  return (
    <>
      <Topbar
        title="Calendrier"
        right={<>
          <button className="btn sm ghost" onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}>
            Aujourd'hui
          </button>
          <button className="btn primary"><Icon name="plus" size={14} />Planifier</button>
        </>}
      />
      <div className="content">
        <div className="cal-hd">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn sm" onClick={() => setCursor(new Date(year, month - 1, 1))}>
              <Icon name="arrowLeft" size={12} />
            </button>
            <h2>{MOIS[month]} {year}</h2>
            <button className="btn sm" onClick={() => setCursor(new Date(year, month + 1, 1))} style={{ transform: 'rotate(180deg)' }}>
              <Icon name="arrowLeft" size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: 'var(--ink-500)', flexWrap: 'wrap' }}>
            <span><span className="dot" style={{ background: 'var(--navy-500)' }} /> Planifié</span>
            <span><span className="dot" style={{ background: 'var(--emerald-600)' }} /> Réalisé</span>
            <span><span className="dot" style={{ background: 'var(--red-600)' }} /> En retard</span>
          </div>
        </div>

        <div className="cal-layout">
          <div>
            <div className="cal-grid">
              {JOURS.map(j => <div key={j} className="cal-dow">{j}</div>)}
              {cells.map((cell, i) => {
                const dayEvents = eventsOn(cell.date)
                const isPicked = picked && cell.date.getTime() === picked.getTime()
                return (
                  <div key={i}
                    className={`cal-cell ${cell.other ? 'other' : ''} ${isToday(cell.date) ? 'today' : ''}`}
                    style={isPicked ? { boxShadow: 'inset 0 0 0 2px var(--red-600)' } : {}}
                    onClick={() => setPicked(cell.date)}
                  >
                    <div className="dn">{cell.date.getDate()}</div>
                    {dayEvents.slice(0, 3).map((e, j) => (
                      <span key={j} className={`cal-event ${e.kind}`}>{e.c.nom}</span>
                    ))}
                    {dayEvents.length > 3 && <span className="cal-event past">+{dayEvents.length - 3}</span>}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="cal-side">
            <div className="card-hd" style={{ padding: '12px 16px' }}>
              <div>
                <h3>{picked ? formatDateLong(picked) : formatDateLong(today)}</h3>
                <div className="sub">{pickedEvents.length} événement(s)</div>
              </div>
            </div>
            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {pickedEvents.length === 0 && (
                <div className="muted" style={{ padding: 16, fontSize: 12, textAlign: 'center' }}>
                  Aucune visite planifiée.
                </div>
              )}
              {pickedEvents.map((e, i) => (
                <div key={i} onClick={() => onPickClient(e.c)}
                  style={{ padding: 10, borderRadius: 6, background: 'var(--paper-2)', cursor: 'pointer', border: '1px solid var(--ink-100)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{e.c.ref}</span>
                    <span className={`chip ${e.kind === 'done' ? 'ok' : e.kind === 'overdue' ? 'overdue' : 'soon'}`} style={{ fontSize: 9.5, padding: '2px 6px' }}>
                      {e.kind === 'done' ? 'Réalisé' : e.kind === 'overdue' ? 'En retard' : 'Planifié'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 12.5 }}>{e.c.nom}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>
                    {e.c.ville} · {e.c.prestation.join(' + ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
