# ROVE Hire

Internal recruitment tool for the ROVE HR team — manage candidates from resume upload through offer letter generation.

**Live app:** [https://rive-hr.vercel.app](https://rive-hr.vercel.app)

## Hosting

ROVE Hire is deployed as a single Next.js application on [Vercel](https://vercel.com), with MongoDB Atlas as the managed database. One deploy serves both the HR dashboard and the public candidate application pages — no separate backend service to maintain.

## Tech stack and why

| Layer | Choice | Why |
| --- | --- | --- |
| **Frontend** | Next.js 16 (App Router) | The assignment calls for Next.js, and App Router lets us ship the HR UI and API in one codebase. Server-side route handlers keep auth and file logic off the client without standing up a second service. |
| **Backend** | Next.js Route Handlers (`/api/*`) | Same-origin API routes simplify deployment (one Vercel project), avoid CORS, and match the scale of an internal HR tool. Business logic lives in `src/lib/server/`. |
| **Database** | MongoDB Atlas + Mongoose | Hiring data is document-shaped — candidates embed timelines, interviews, and job references naturally. MongoDB's flexible schema made iterating on the take-home fast, and Atlas gives a free tier with zero local-DB friction for evaluators. |
| **File storage** | GridFS (inside MongoDB) | Resumes and generated PDFs are stored in the same Atlas cluster via GridFS. This avoids a second storage provider, works on Vercel's read-only filesystem, and keeps metadata (`StoredDocument`) and file bytes in one place. |
| **Auth** | Email + password, JWT | Simple and appropriate for a single internal HR team. No OAuth setup overhead for a demo tool. |
| **Styling** | Tailwind CSS v4 | Fast iteration on a polished internal-tool UI without a component library lock-in. |
| **PDF generation** | PDFKit | See [PDF generation](#pdf-generation) below. |

## PDF generation

Offer letters and NDAs are generated server-side with [PDFKit](https://pdfkit.org/). Templates are built programmatically in `src/lib/server/pdf.ts` — header, body copy, offer details list, and signature blocks — so HR fills a short form and gets consistent, professional-looking documents.

**Why PDFKit:** It runs entirely in Node.js with no headless browser, which keeps Vercel serverless functions fast and predictable. For a handful of hires per week, programmatic PDFs are simpler than HTML-to-PDF pipelines.

**At scale:** I'd move templates to HTML/CSS (or a dedicated doc service like DocRaptor or Puppeteer in a background worker), add versioning per offer revision, and queue PDF generation so large batches don't block API responses. Watermarks and audit logs would come before any real legal use.

## What I'd do next (another 2 days)

- **Email notifications** — magic link and status-change emails via Resend or SendGrid so HR doesn't copy links manually.
- **Richer job descriptions** — markdown editor with preview for job postings.
- **Audit log** — who changed candidate status, when, and from which action.
- **Role-based access** — separate hiring manager vs. HR admin permissions.
- **Better PDF templates** — designed HTML templates with company branding, not programmatic layout.
- **E2E tests** — Playwright flows for the full hire pipeline (add candidate → apply → interview → offer → hired).
- **Seed polish** — use the real `pdf.ts` templates in the seed script so pre-generated Chris Morgan PDFs match production quality.

## Known limitations (not production-ready yet)

- **No real email delivery** — magic links are copy-paste only (per assignment scope).
- **Single HR user model** — one shared login; no per-user accounts or permissions.
- **JWT in localStorage** — fine for a demo; production would use httpOnly cookies and refresh tokens.
- **No rate limiting or virus scanning** on resume uploads — only PDF type and 10 MB size checks.
- **GridFS at scale** — works well for this scope; very large files or high volume would warrant S3 + CDN.
- **Magic link URL** — requires `WEB_URL` env var on Vercel so links always point at the production domain, not preview deploy URLs.
- **No automated tests** — flows were verified manually.

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

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for Vercel env vars and seed instructions.

## Demo credentials

| Email | Password |
| --- | --- |
| hr@rove.com | rovehire2026 |

Pre-seeded magic link: [https://rive-hr.vercel.app/apply/seed-token-applied](https://rive-hr.vercel.app/apply/seed-token-applied)

Seeded pipeline includes 3 job openings and 5 candidates (Applied, Form Submitted, Interview Scheduled with feedback, Offer Sent with PDFs, Rejected).
