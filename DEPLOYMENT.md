# Deploying ROVE Hire on Vercel

Everything runs as **one Next.js app** at the repo root — frontend and API routes together.

## Prerequisites

- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier)
- [Vercel](https://vercel.com) account
- GitHub repo pushed

## 1. Seed production database

Run once from your machine with your Atlas connection string:

```bash
MONGODB_URI="mongodb+srv://..." pnpm db:seed
```

## 2. Deploy to Vercel

1. Import repo at [vercel.com/new](https://vercel.com/new)
2. Leave **Root Directory** empty (project root)
3. Add environment variables:

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string |

Resumes and generated PDFs are stored in MongoDB via GridFS — no separate blob storage needed.

4. Deploy

## 3. Verify

- Sign in: `hr@rove.com` / `rovehire2026`
- 5 seeded candidates visible in pipeline
- Download offer PDFs for Chris Morgan
- Test magic link: `https://YOUR-APP.vercel.app/apply/seed-token-applied`

## Local development

```bash
cp .env.example .env.local
pnpm install
pnpm db:seed
pnpm dev
```

Open http://localhost:3000 — API routes are at `/api/*` on the same origin.
