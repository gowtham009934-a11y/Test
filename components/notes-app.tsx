'use client'

import { AlertCircle, NotebookPen, Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { DeleteNoteDialog } from '@/components/delete-note-dialog'
import { NoteCard } from '@/components/note-card'
import { NoteFormDialog } from '@/components/note-form-dialog'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchNotes, notesKey } from '@/lib/api-client'
import type { Note } from '@/lib/types'

function useDebounced(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function NotesApp() {
  const [search, setSearch] = useState('')
  const query = useDebounced(search.trim())
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [deleting, setDeleting] = useState<Note | null>(null)

  const { data: notes, error, isLoading, mutate } = useSWR(notesKey(query), fetchNotes, {
    keepPreviousData: true,
  })

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(note: Note) {
    setEditing(note)
    setFormOpen(true)
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex flex-1 items-center gap-2 sm:flex-none">
            <NotebookPen className="size-5 text-primary" aria-hidden="true" />
            <h1 className="text-lg font-semibold tracking-tight">QuickNotes</h1>
          </div>

          <div className="relative order-last w-full sm:order-none sm:ml-auto sm:max-w-xs sm:flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title"
              aria-label="Search notes by title"
              className="pl-8"
            />
          </div>

          <ThemeToggle />
          <Button onClick={openCreate}>
            <Plus aria-hidden="true" />
            New Note
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {error && !notes ? (
          <ErrorState message={error.message} onRetry={() => mutate()} />
        ) : isLoading && !notes ? (
          <LoadingGrid />
        ) : notes && notes.length === 0 ? (
          <EmptyState searching={query.length > 0} onCreate={openCreate} />
        ) : (
          <>
            {error && (
              <p role="alert" className="mb-4 text-sm text-destructive">
                Couldn&apos;t refresh notes: {error.message}
              </p>
            )}
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notes?.map((note) => (
                <li key={note.id}>
                  <NoteCard note={note} onEdit={openEdit} onDelete={setDeleting} />
                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      <NoteFormDialog open={formOpen} note={editing} onOpenChange={setFormOpen} />
      <DeleteNoteDialog note={deleting} onClose={() => setDeleting(null)} />
    </div>
  )
}

function LoadingGrid() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading notes"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-44 rounded-xl" />
      ))}
    </div>
  )
}

function EmptyState({ searching, onCreate }: { searching: boolean; onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
      <NotebookPen className="size-8 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-lg font-medium">{searching ? 'No matching notes' : 'No notes yet'}</h2>
      <p className="max-w-sm text-pretty text-sm text-muted-foreground">
        {searching
          ? 'Try a different title, or clear the search to see all your notes.'
          : 'Capture your first thought. Your notes are saved to the database and will be here when you come back.'}
      </p>
      {!searching && (
        <Button onClick={onCreate}>
          <Plus aria-hidden="true" />
          Create your first note
        </Button>
      )}
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-destructive/40 px-6 py-16 text-center"
    >
      <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
      <h2 className="text-lg font-medium">Couldn&apos;t load your notes</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
