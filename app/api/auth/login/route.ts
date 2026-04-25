import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { SESSION_OPTIONS, type SessionData } from '@/lib/session'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Identifiants manquants' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { username: username.toLowerCase().trim() } })

  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect' }, { status: 401 })
  }

  const session = await getIronSession<SessionData>(cookies(), SESSION_OPTIONS)
  session.userId = user.id
  session.username = user.username
  session.displayName = user.displayName || user.username
  await session.save()

  return NextResponse.json({ ok: true })
}
