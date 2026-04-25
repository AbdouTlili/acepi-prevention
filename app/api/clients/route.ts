import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dbRowToClient, clientToDbFields } from '@/lib/helpers'

export async function GET() {
  const rows = await prisma.client.findMany({ orderBy: { nomSociete: 'asc' } })
  return NextResponse.json(rows.map(dbRowToClient))
}

export async function POST(req: Request) {
  const body = await req.json()
  const data = clientToDbFields(body)
  try {
    const row = await prisma.client.create({ data })
    return NextResponse.json(dbRowToClient(row), { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
