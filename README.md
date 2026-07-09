# ROVE Hire

Internal recruitment tool for the ROVE HR team — manage candidates from resume upload through offer letter generation.

## Stack

- **Next.js 16** — App Router (frontend + API routes)
- **MongoDB** — Mongoose ODM
- **Tailwind CSS v4** — UI
- **PDFKit** — offer letter & NDA generation
- **GridFS** — resume & PDF storage in MongoDB Atlas

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm db:seed
pnpm dev
```

Open http://localhost:3000 — sign in with `hr@rove.com` / `rovehire2026`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start Next.js (UI + API) |
| `pnpm build` | Production build |
| `pnpm db:seed` | Reset & seed MongoDB with sample data |

## Project structure

```
rove-hr/
├── src/app/           # Pages + API routes
├── src/lib/server/    # DB, auth, business logic
├── scripts/seed.ts    # Database seeder
└── package.json
```

## Deployment

Single Vercel project at the **repo root** — see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

## Demo credentials

| Email | Password |
| --- | --- |
| hr@rove.com | rovehire2026 |

Pre-seeded magic link: `/apply/seed-token-applied`
