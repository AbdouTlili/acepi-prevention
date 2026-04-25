'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) {
      router.push(params.get('from') ?? '/')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur de connexion')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--paper)', fontFamily: 'var(--ff-ui)',
    }}>
      <div style={{ maxWidth: 380, width: '100%', padding: '0 20px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--navy-900)', borderRadius: 12,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <img src="/logo-acepi.png" alt="ACEPI" style={{ width: 38, height: 38, objectFit: 'contain' }} />
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>
            ACEPI Prévention
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-500)' }}>
            Gestion de la maintenance incendie
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--white)', border: '1px solid var(--ink-100)',
          borderRadius: 10, padding: '28px 32px',
          boxShadow: '0 2px 4px rgba(10,26,48,0.05), 0 8px 20px rgba(10,26,48,0.07)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 6 }}>
                Identifiant
              </div>
              <input
                className="input"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 6 }}>
                Mot de passe
              </div>
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{ background: 'var(--red-50)', color: 'var(--red-700)', fontSize: 12.5, padding: '10px 12px', borderRadius: 6, border: '1px solid var(--red-600)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn primary"
              disabled={loading}
              style={{ justifyContent: 'center', padding: '10px 16px', fontSize: 13, marginTop: 4 }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-400)', marginTop: 20 }}>
          prevention.acepi-conseils.fr · ACEPI © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
