'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useSWRConfig } from 'swr'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteNote, isNotesKey } from '@/lib/api-client'
import type { Note } from '@/lib/types'

type DeleteNoteDialogProps = {
  note: Note | null
  onClose: () => void
}

export function DeleteNoteDialog({ note, onClose }: DeleteNoteDialogProps) {
  return (
    <AlertDialog open={note !== null} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        {note && <DeleteBody key={note.id} note={note} onClose={onClose} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function DeleteBody({ note, onClose }: { note: Note; onClose: () => void }) {
  const { mutate } = useSWRConfig()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await deleteNote(note.id)
      await mutate(isNotesKey)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this note?</AlertDialogTitle>
        <AlertDialogDescription>
          &ldquo;{note.title}&rdquo; will be permanently deleted. This can&apos;t be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting && <Loader2 className="animate-spin" aria-hidden="true" />}
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}
