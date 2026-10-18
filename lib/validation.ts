import { z } from 'zod'

export const TITLE_MAX = 100
export const CONTENT_MAX = 2000

export const noteInputSchema = z.object({
  title: z
    .string('Title is required')
    .trim()
    .min(1, 'Title is required')
    .max(TITLE_MAX, `Title must be ${TITLE_MAX} characters or fewer`),
  content: z
    .string('Content must be text')
    .max(CONTENT_MAX, `Content must be ${CONTENT_MAX} characters or fewer`)
    .default(''),
})

export const noteIdSchema = z.uuid('Invalid note id')

export type NoteInput = z.infer<typeof noteInputSchema>
