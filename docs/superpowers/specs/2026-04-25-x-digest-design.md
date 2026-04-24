# x-digest — Design Spec

**Date:** 2026-04-25  
**Status:** Approved

---

## Overview

A personal Next.js application that automatically fetches daily posts from specific X (Twitter) accounts via a self-hosted RSSHub instance, processes them with DeepSeek AI, stores the results in Supabase, displays the digest on a frontend page, and sends a daily email summary via Resend.

**Scope:** Single-user personal tool. No authentication required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| AI | Vercel AI SDK + OpenRouter (DeepSeek) |
| Email | Resend + React Email |
| RSS | rss-parser |
| Hosting | Vercel |
| Package manager | pnpm |

---

## Architecture

```
[Vercel Cron / Admin UI (Server Action)]
        ↓ POST /api/digest/run?secret=CRON_SECRET
[Next.js Route Handler]
        ↓ 1. Validate secret
        ↓ 2. Check for duplicate (today's digest already exists → 409)
        ↓ 3. Fetch active accounts from Supabase
        ↓ 4. Fetch RSS feeds from self-hosted RSSHub (parallel)
        ↓ 5. Process with DeepSeek via OpenRouter
        ↓ 6. Save digest to Supabase
        ↓ 7. Send email via Resend
[Next.js Frontend]
        └─ Reads digests from Supabase and displays them
```

**External services:**
- **RSSHub** — self-hosted (Railway or VPS), converts X/Twitter profiles to RSS feeds
- **OpenRouter** — API gateway to DeepSeek model
- **Supabase** — PostgreSQL database (no Auth used)
- **Resend** — transactional email

---

## Database Schema

### `x_accounts`
Stores the X accounts to monitor.

```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
username     text NOT NULL UNIQUE   -- e.g. "elonmusk"
display_name text
rss_url      text NOT NULL          -- Full RSSHub URL for this account
active       boolean DEFAULT true
created_at   timestamptz DEFAULT now()
```

### `digests`
One record per day. Stores the AI-generated overall summary.

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
date            date NOT NULL UNIQUE
overall_summary text NOT NULL
created_at      timestamptz DEFAULT now()
```

### `digest_entries`
Per-account summaries for each digest.

```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
digest_id     uuid REFERENCES digests(id)
x_account_id  uuid REFERENCES x_accounts(id)
summary       text NOT NULL
post_count    int
created_at    timestamptz DEFAULT now()
```

**Note:** Raw posts are not stored. If AI produces bad output on a given day, that day's digest cannot be regenerated — acceptable trade-off for a personal tool.

---

## Digest Pipeline

`POST /api/digest/run?secret=<CRON_SECRET>`

```
Step 1 — Validate secret
  └─ Compare ?secret query param to process.env.CRON_SECRET
  └─ Mismatch → 401

Step 2 — Duplicate check
  └─ Query digests WHERE date = today
  └─ Exists → 409 (skip all subsequent steps, no API calls wasted)

Step 3 — Fetch active accounts
  └─ SELECT * FROM x_accounts WHERE active = true

Step 4 — Fetch RSS feeds (parallel)
  └─ rss-parser fetches each account's rss_url
  └─ Filter items published in the last 24 hours
  └─ Accounts with 0 posts → skipped

Step 5 — AI processing (DeepSeek via OpenRouter)
  ├─ Per account: prompt with that account's posts → user summary
  └─ All accounts combined: prompt → overall highlights

Step 6 — Save to Supabase
  ├─ INSERT INTO digests (date, overall_summary)
  └─ INSERT INTO digest_entries for each account

Step 7 — Send email (Resend)
  └─ overall_summary highlights + per-account one-liners + link to digest page

Step 8 — Return { success: true, date, accountsProcessed }
```

**Error handling:**
- Single account RSS fetch failure → skip that account, continue pipeline
- DeepSeek failure → log error, return 500, do not send email
- Duplicate date → 409, no downstream calls made

---

## Pages & Routes

### Frontend Pages

| Route | Description |
|---|---|
| `/` | Latest digest: overall_summary + per-account summaries |
| `/digest/[date]` | Digest for a specific past date |
| `/admin` | Manage X accounts (add/remove/toggle active), manual run button |

### API Routes

| Route | Method | Description |
|---|---|---|
| `/api/digest/run` | POST | Full pipeline execution |
| `/api/accounts` | GET | List all accounts |
| `/api/accounts` | POST | Add a new account |
| `/api/accounts/[id]` | PATCH | Toggle active |
| `/api/accounts/[id]` | DELETE | Remove account |

### Admin Manual Trigger

The `/admin` page uses a Server Action to call the pipeline. `CRON_SECRET` is read server-side only — never exposed to the browser.

```typescript
// Server Action
const secret = process.env.CRON_SECRET
await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/digest/run?secret=${secret}`, {
  method: 'POST'
})
```

### Vercel Cron (`vercel.json`)

```json
{
  "crons": [{
    "path": "/api/digest/run?secret=<paste-actual-CRON_SECRET-value-here>",
    "schedule": "0 0 * * *"
  }]
}
```

Runs daily at UTC 00:00 (JST 09:00).

**Important:** `vercel.json` does not support environment variable interpolation. The actual secret value must be hardcoded in the path. Set the same value as `CRON_SECRET` in Vercel project environment variables so the API route can validate it. Keep this repo private, or add `vercel.json` to `.gitignore` and maintain it locally only.

---

## Email Design

**Subject:** `[x-digest] 2026-04-25 のダイジェスト`

**Body structure:**
1. Overall highlights — 3–5 bullet points from `overall_summary`
2. Per-account one-liners — `@username — {one-line summary}`
3. Link to full digest page

Both HTML (React Email) and plain text versions sent.

---

## Environment Variables

`.env.local.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenRouter (DeepSeek)
OPENROUTER_API_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_TO_EMAIL=

# RSSHub (self-hosted)
RSSHUB_BASE_URL=

# Security
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Out of Scope

- User authentication / multi-user support
- Storing raw post content
- Mobile app
- Multi-language UI
