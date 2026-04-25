import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { frenchMonthToNumber, excelSerialToDate } from '@/lib/helpers'

// POST multipart/form-data with field "file" (Excel .xlsx/.xls)
export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  // Dynamic import so xlsx is only loaded server-side
  const XLSX = await import('xlsx')
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

  const results = { inserted: 0, skipped: 0, errors: [] as string[] }

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] as unknown[]
    const ref = String(r[0] ?? '').trim()
    if (!ref) continue

    const moisRaw = String(r[2] ?? '').trim()
    const anneeRaw = r[3]
    const dateRaw = r[4]

    let moisIntervention = frenchMonthToNumber(moisRaw)
    let anneeDerniere = parseInt(String(anneeRaw), 10) || new Date().getFullYear()

    // If date is an Excel serial number, derive month/year from it
    if (typeof dateRaw === 'number' && dateRaw > 40000) {
      const d = excelSerialToDate(dateRaw)
      moisIntervention = d.getUTCMonth() + 1
      anneeDerniere = d.getUTCFullYear()
    }

    const prestation = String(r[1] ?? '').trim()

    try {
      await prisma.client.upsert({
        where: { refClient: ref },
        update: {},
        create: {
          refClient: ref,
          typePrestation: prestation,
          nomSociete: String(r[5] ?? '').trim(),
          contactNom: String(r[6] ?? '').trim(),
          contactTitre: String(r[7] ?? '').trim(),
          telephone: String(r[8] ?? '').trim(),
          adresse: String(r[9] ?? '').trim(),
          ville: String(r[10] ?? '').trim(),
          departement: String(r[11] ?? '67').trim(),
          codePostal: String(r[12] ?? '').trim(),
          email: String(r[13] ?? '').trim(),
          nbrEp6: parseInt(String(r[14]), 10) || 0,
          nbrCo2: parseInt(String(r[15]), 10) || 0,
          nbrPoudre: parseInt(String(r[16]), 10) || 0,
          nbrRia: parseInt(String(r[17]), 10) || 0,
          nbrAlarmeT4: parseInt(String(r[18]), 10) || 0,
          nbrSsi: 0,
          desenfumage: String(r[19] ?? '').trim() ? 1 : 0,
          observations: String(r[20] ?? '').trim(),
          moisIntervention,
          anneeDerniere,
        },
      })
      results.inserted++
    } catch (e: unknown) {
      results.skipped++
      results.errors.push(`Ligne ${i + 1} (${ref}): ${e instanceof Error ? e.message : 'Erreur'}`)
    }
  }

  return NextResponse.json(results)
}
