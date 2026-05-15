# frontend-lynue3

A modern 2026-grade Next.js frontend built from scratch with a backend-first architecture.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript strict mode
- Tailwind CSS v4
- TanStack Query v5
- Zod runtime API validation
- Vitest + Testing Library
- ESLint + Prettier

## Architecture

The app is intentionally thin. Backend services remain the source of truth for data.

- `src/app`: Routes, layout shell, metadata routes, global boundaries
- `src/features`: Feature modules (domain logic + API mapping + UI)
- `src/shared`: Cross-cutting libs, configs, reusable UI primitives
- `src/queries`: React Query hooks per backend endpoint group
- `src/widgets`: Composed page sections (header, footer)
- `src/test`: Test bootstrap

## Environment

Copy `.env.example` values into your real environment.

- `NEXT_PUBLIC_APP_URL`: Frontend public URL (example: `http://localhost:3000`)
- `NEXT_PUBLIC_API_URL`: Backend base URL (example: `http://localhost:8080`)

## Scripts

- `npm run dev`: Start dev server
- `npm run lint`: Run ESLint
- `npm run typecheck`: Run TypeScript checks
- `npm run test`: Run unit tests
- `npm run build`: Build for production
- `npm run check`: Run lint + typecheck + test + build
- `npm run format`: Format all files

## Backend-first contract

Primary integration endpoints currently used:

- `GET /api/listings`
- `GET /api/listings/:slug`
- `GET /api/listings/sitemap`

Responses are validated with Zod before entering the UI layer.

## Production standards included

- Route-level error/loading boundaries
- Robots, sitemap, and web app manifest
- Open Graph and Twitter metadata
- CI workflow (`.github/workflows/ci.yml`)
- Typed HTTP client with timeout + consistent API errors

## Local run

1. Install dependencies:

```bash
npm install
```

2. Start app:

```bash
npm run dev
```

3. Verify full project quality:

```bash
npm run check
```
