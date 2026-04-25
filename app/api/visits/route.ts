import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const where = clientId ? { clientId: Number(clientId) } : {}
  const rows = await prisma.visit.findMany({ where, orderBy: { dateVisite: 'desc' } })
  return NextResponse.json(rows.map(r => ({
    id: r.id,
    clientId: r.clientId,
    dateVisite: r.dateVisite,
    technicien: r.technicien,
    travaux: JSON.parse(r.travauxJson || '[]'),
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
  })))
}

export async function POST(req: Request) {
  const body = await req.json()
  const row = await prisma.visit.create({
    data: {
      clientId: Number(body.clientId),
      dateVisite: body.dateVisite,
      technicien: body.technicien ?? '',
      travauxJson: JSON.stringify(body.travaux ?? []),
      notes: body.notes ?? '',
    },
  })
  // Update the client's anneeDerniere / moisIntervention to match this visit
  const dateParts = body.dateVisite.split('/')
  if (dateParts.length === 3) {
    const month = parseInt(dateParts[1], 10)
    const year  = parseInt(dateParts[2], 10)
    if (!isNaN(month) && !isNaN(year)) {
      await prisma.client.update({
        where: { id: Number(body.clientId) },
        data: { moisIntervention: month, anneeDerniere: year },
      })
    }
  }
  return NextResponse.json({ id: row.id }, { status: 201 })
}
