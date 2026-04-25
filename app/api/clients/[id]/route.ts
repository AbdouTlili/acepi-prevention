import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dbRowToClient, clientToDbFields } from '@/lib/helpers'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const row = await prisma.client.findUnique({ where: { id: Number(params.id) } })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(dbRowToClient(row))
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const data = clientToDbFields(body)
  const row = await prisma.client.update({ where: { id: Number(params.id) }, data })
  return NextResponse.json(dbRowToClient(row))
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.client.delete({ where: { id: Number(params.id) } })
  return new NextResponse(null, { status: 204 })
}
