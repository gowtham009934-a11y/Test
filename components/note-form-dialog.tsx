'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useSWRConfig } from 'swr'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createNote, isNotesKey, updateNote } from '@/lib/api-client'
import type { Note } from '@/lib/types'
import { CONTENT_MAX, TITLE_MAX } from '@/lib/validation'

type NoteFormDialogProps = {
  open: boolean
  note: Note | null
  onOpenChange: (open: boolean) => void
}

export function NoteFormDialog({ open, note, onOpenChange }: NoteFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Remounted on each open so the fields always start from the note being edited. */}
        <NoteForm key={note?.id ?? 'new'} note={note} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function NoteForm({ note, onDone }: { note: Note | null; onDone: () => void }) {
  const { mutate } = useSWRConfig()
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const input = { title: title.trim(), content }
      if (note) {
        await updateNote(note.id, input)
      } else {
        await createNote(input)
      }
      await mutate(isNotesKey)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{note ? 'Edit note' : 'New note'}</DialogTitle>
        <DialogDescription>
          {note ? 'Update the title or content of this note.' : 'Give your note a title and write something down.'}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="note-title">Title</Label>
        <Input
          id="note-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX}
          placeholder="Grocery list"
          required
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="note-content">Content</Label>
          <span className="text-xs text-muted-foreground">
            {content.length}/{CONTENT_MAX}
          </span>
        </div>
        <Textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={CONTENT_MAX}
          placeholder="Write your note..."
          className="min-h-40"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !title.trim()}>
          {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
          {note ? 'Save changes' : 'Create note'}
        </Button>
      </DialogFooter>
    </form>
  )
}
