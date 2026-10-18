import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { notes } from '@/lib/db/schema'
import { noteIdSchema, noteInputSchema } from '@/lib/validation'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: RouteContext) {
  const id = noteIdSchema.safeParse((await params).id)
  if (!id.success) {
    return NextResponse.json({ error: 'Invalid note id' }, { status: 400 })
  }

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
    const [updated] = await db
      .update(notes)
      .set(parsed.data)
      .where(eq(notes.id, id.data))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/notes/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const id = noteIdSchema.safeParse((await params).id)
  if (!id.success) {
    return NextResponse.json({ error: 'Invalid note id' }, { status: 400 })
  }

  try {
    const [deleted] = await db
      .delete(notes)
      .where(eq(notes.id, id.data))
      .returning({ id: notes.id })

    if (!deleted) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    return NextResponse.json({ id: deleted.id })
  } catch (error) {
    console.error('DELETE /api/notes/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
