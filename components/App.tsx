'use client'
import { useEffect, useState, useCallback } from 'react'
import Sidebar from './Sidebar'
import Icon from './Icon'
import Dashboard from './Dashboard'
import ClientList from './ClientList'
import ClientDetail from './ClientDetail'
import CalendarView from './CalendarView'
import Report from './Report'
import Insights from './Insights'
import Settings from './Settings'
import NewClientModal from './NewClientModal'
import ImportModal from './ImportModal'
import type { Client, Store } from '@/lib/types'

const DEFAULT_STORE: Store = {
  techniciens: [],
  prestations: [],
  travaux: [],
  equipements: [],
  secteurs: [],
}

type View = 'dashboard' | 'clients' | 'client' | 'calendar' | 'report' | 'insights' | 'settings'

export default function App() {
  const [clients, setClients] = useState<Client[]>([])
  const [store, setStore] = useState<Store>(DEFAULT_STORE)
  const [view, setView] = useState<View>('dashboard')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [reminder, setReminder] = useState('2w')
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchClients = useCallback(async () => {
    const res = await fetch('/api/clients')
    const data = await res.json()
    setClients(Array.isArray(data) ? data : [])
  }, [])

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/settings')
    const data = await res.json()
    setStore(s => ({
      techniciens: data.techniciens ?? s.techniciens,
      prestations: data.prestations ?? s.prestations,
      travaux:     data.travaux     ?? s.travaux,
      equipements: data.equipements ?? s.equipements,
      secteurs:    data.secteurs    ?? s.secteurs,
    }))
  }, [])

  useEffect(() => {
    Promise.all([fetchClients(), fetchSettings()]).finally(() => setLoading(false))
  }, [fetchClients, fetchSettings])

  const handleCreateClient = async (c: Omit<Client, 'id'>) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    })
    if (res.ok) {
      const newClient: Client = await res.json()
      setClients(prev => [...prev, newClient])
      setSelectedClient(newClient)
      setView('client')
    }
    setNewClientOpen(false)
  }

  const handleDeleteClient = async (id: number) => {
    setClients(prev => prev.filter(c => c.id !== id))
    setView('clients')
    setSelectedClient(null)
  }

  const handlePickClient = (c: Client) => {
    setSelectedClient(c)
    setView('client')
  }

  const handleNavigation = (v: string) => {
    // If navigating away from client detail, don't lose selected client
    if (v !== 'client') {
      setView(v as View)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--ink-100)', borderTopColor: 'var(--red-600)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>Chargement…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div className="app">
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Menu"
      >
        <Icon name="menu" size={20} />
      </button>

      <Sidebar
        view={view}
        setView={handleNavigation}
        onNewClient={() => { setNewClientOpen(true); setSidebarOpen(false) }}
        clientCount={clients.length}
        technicien={store.techniciens[0]}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="main">
        {view === 'dashboard' && (
          <Dashboard
            clients={clients}
            reminder={reminder}
            setReminder={setReminder}
            onPickClient={handlePickClient}
            onNewClient={() => setNewClientOpen(true)}
          />
        )}

        {(view === 'clients' || (view === 'client' && !selectedClient)) && (
          <ClientList
            clients={clients}
            selected={selectedClient}
            onPickClient={handlePickClient}
            onNewClient={() => setNewClientOpen(true)}
            onImport={() => setImportOpen(true)}
          />
        )}

        {view === 'client' && selectedClient && (
          <ClientDetail
            client={selectedClient}
            onBack={() => setView('clients')}
            onReport={() => setView('report')}
            onDelete={handleDeleteClient}
          />
        )}

        {view === 'calendar' && (
          <CalendarView clients={clients} onPickClient={handlePickClient} />
        )}

        {view === 'report' && selectedClient && (
          <Report
            client={selectedClient}
            store={store}
            onBack={() => setView('client')}
            onSaved={fetchClients}
          />
        )}

        {view === 'report' && !selectedClient && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, color: 'var(--ink-500)' }}>
            <p>Sélectionnez d'abord un client pour créer un compte-rendu.</p>
            <button className="btn primary" onClick={() => setView('clients')}>Aller aux clients</button>
          </div>
        )}

        {view === 'insights' && <Insights clients={clients} />}

        {view === 'settings' && (
          <Settings initialStore={store} onStoreChange={setStore} />
        )}
      </div>

      {newClientOpen && store.secteurs.length > 0 && (
        <NewClientModal
          store={store}
          onClose={() => setNewClientOpen(false)}
          onCreate={handleCreateClient}
        />
      )}

      {importOpen && (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onDone={fetchClients}
        />
      )}
    </div>
  )
}
