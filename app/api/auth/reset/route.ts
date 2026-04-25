import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

/**
 * Emergency password reset — requires the RESET_SECRET env var to be set
 * in Cloud Run and the same value sent as Bearer token.
 *
 * Usage from GCP console or curl:
 *   curl -X POST https://prevention.acepi-conseils.fr/api/auth/reset \
 *     -H "Authorization: Bearer YOUR_RESET_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d '{"username":"admin","newPassword":"nouveaumotdepasse"}'
 *
 * After reset, remove or rotate RESET_SECRET in Cloud Run env vars.
 */
export async function POST(req: Request) {
  const secret = process.env.RESET_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Reset non activé (RESET_SECRET non configuré)' }, { status: 403 })
  }

  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { username, newPassword } = await req.json()
  if (!username || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const hash = await bcrypt.hash(newPassword, 12)
  const user = await prisma.user.upsert({
    where: { username: username.toLowerCase() },
    update: { passwordHash: hash },
    create: { username: username.toLowerCase(), passwordHash: hash, displayName: username },
  })

  return NextResponse.json({ ok: true, username: user.username })
}
