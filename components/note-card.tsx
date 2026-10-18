import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { Note } from '@/lib/types'

type NoteCardProps = {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (note: Note) => void
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const created = new Date(note.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-balance break-words text-base">{note.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {note.content ? (
          <p className="line-clamp-6 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
            {note.content}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">No content</p>
        )}
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <time dateTime={note.createdAt} className="text-xs text-muted-foreground">
          {created}
        </time>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(note)}
            aria-label={`Edit ${note.title}`}
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(note)}
            aria-label={`Delete ${note.title}`}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
