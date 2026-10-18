import type { Note } from '@/lib/types'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`)
  }
  return data as T
}

export const notesKey = (query: string) =>
  query ? `/api/notes?q=${encodeURIComponent(query)}` : '/api/notes'

export const isNotesKey = (key: unknown) =>
  typeof key === 'string' && key.startsWith('/api/notes')

export const fetchNotes = (url: string) => request<Note[]>(url)

export const createNote = (input: { title: string; content: string }) =>
  request<Note>('/api/notes', { method: 'POST', body: JSON.stringify(input) })

export const updateNote = (id: string, input: { title: string; content: string }) =>
  request<Note>(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteNote = (id: string) =>
  request<{ id: string }>(`/api/notes/${id}`, { method: 'DELETE' })
