import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rows = await prisma.setting.findMany()
  const settings: Record<string, unknown> = {}
  for (const row of rows) {
    try { settings[row.key] = JSON.parse(row.value) } catch { settings[row.key] = row.value }
  }
  return NextResponse.json(settings)
}

export async function POST(req: Request) {
  const body = await req.json()  // { key, value }
  const row = await prisma.setting.upsert({
    where: { key: body.key },
    update: { value: JSON.stringify(body.value) },
    create: { key: body.key, value: JSON.stringify(body.value) },
  })
  return NextResponse.json({ key: row.key })
}
