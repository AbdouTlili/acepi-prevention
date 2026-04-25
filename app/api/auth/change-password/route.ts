import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { SESSION_OPTIONS, type SessionData } from '@/lib/session'

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(cookies(), SESSION_OPTIONS)
  if (!session.userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Mot de passe invalide (6 caractères minimum)' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user || !await bcrypt.compare(currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 })
  }

  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: session.userId }, data: { passwordHash: hash } })

  return NextResponse.json({ ok: true })
}
