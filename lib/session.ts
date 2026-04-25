import type { SessionOptions } from 'iron-session'

export interface SessionData {
  userId: number
  username: string
  displayName: string
}

export const SESSION_OPTIONS: SessionOptions = {
  cookieName: 'acepi_session',
  password: process.env.SESSION_SECRET ?? 'acepi-default-secret-change-me-in-production-32ch',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}
