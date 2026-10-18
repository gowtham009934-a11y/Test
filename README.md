# QuickNotes

A small full-stack notes app built with Next.js (App Router), Tailwind CSS, shadcn/ui, Drizzle ORM and Neon Postgres.

## Features

- Create, edit and delete notes (delete asks for confirmation)
- Card grid, newest first, with search by title
- Loading skeletons, empty state and error messages
- Responsive layout with light and dark mode
- Input validated on the server with Zod (title required, max 100 chars; content max 2000 chars)

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a Postgres database (the v0 Neon integration provisions one for you) and set the environment variable below.

3. Create the table by running this SQL against your database:

   ```sql
   CREATE TABLE IF NOT EXISTS notes (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     title text NOT NULL,
     content text,
     created_at timestamptz DEFAULT now()
   );
   ```

   In v0 this has already been run for you through the Neon integration.

4. Start the dev server:

   ```bash
   pnpm dev
   ```

## Environment variables

| Variable       | Description                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Postgres connection string (added automatically by the Neon integration), e.g. `postgres://user:pass@host/db?sslmode=require` |

No credentials are hardcoded; the app reads `DATABASE_URL` at runtime.

## API

| Method   | Path              | Body                  | Success         | Errors                    |
| -------- | ----------------- | --------------------- | --------------- | ------------------------- |
| `GET`    | `/api/notes`      | optional `?q=` search | `200` note list | `500`                     |
| `POST`   | `/api/notes`      | `{ title, content }`  | `201` note      | `400` invalid, `500`      |
| `PUT`    | `/api/notes/[id]` | `{ title, content }`  | `200` note      | `400`, `404`, `500`       |
| `DELETE` | `/api/notes/[id]` | none                  | `200 { id }`    | `400`, `404`, `500`       |

Errors are returned as JSON: `{ "error": "message" }` (validation errors also include a `fields` object).

## Project structure

```
app/
  api/notes/route.ts          GET, POST
  api/notes/[id]/route.ts     PUT, DELETE
  page.tsx                    renders <NotesApp />
components/                   UI (notes grid, dialogs, theme toggle)
lib/
  db/                         Drizzle client + table schema
  validation.ts               Zod schemas
  api-client.ts               fetch helpers used with SWR
```
