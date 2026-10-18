import { desc, ilike } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { notes } from '@/lib/db/schema'
import { noteInputSchema } from '@/lib/validation'

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, '\\$&')
}

export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams.get('q')?.trim().slice(0, 100)

    const rows = await db
      .select()
      .from(notes)
      .where(q ? ilike(notes.title, `%${escapeLike(q)}%`) : undefined)
      .orderBy(desc(notes.createdAt))

    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/notes failed:', error)
    return NextResponse.json({ error: 'Failed to load notes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
  }

  const parsed = noteInputSchema.safeParse(body)
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error)
    const message = Object.values(fieldErrors).flat()[0] ?? 'Invalid input'
    return NextResponse.json({ error: message, fields: fieldErrors }, { status: 400 })
  }

  try {
    const [created] = await db.insert(notes).values(parsed.data).returning()
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('POST /api/notes failed:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
