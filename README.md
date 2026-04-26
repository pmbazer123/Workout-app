# 28-DAY CHALLENGE | COMBAT FITNESS

A personal military-style 28-day workout challenge web app. Dark theme, tactical vibes, satisfying micro-interactions.

## Deployed (Vercel + Neon)

The app is hosted on Vercel with a Neon PostgreSQL database. Every push to the main branch auto-deploys.

**One-time setup:**
1. Create a free project at [neon.tech](https://neon.tech) and copy the connection string
2. Import this repo at [vercel.com](https://vercel.com) and add `DATABASE_URL` as an environment variable
3. Deploy — the build command handles schema creation and seeding automatically

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env and set a local DATABASE_URL
cp .env.example .env
# Edit .env — for local dev you can use a local Postgres or a Neon dev branch

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and complete onboarding to generate your 28-day program.

## Other Commands

```bash
npm run db:push     # Push schema changes to the database
npm run db:seed     # Re-seed exercise library (idempotent)
npm run db:studio   # Open Prisma Studio to inspect data
npm run db:reset    # Wipe and re-seed (start fresh)
```

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with military color palette
- **Prisma ORM** + PostgreSQL (hosted on Neon)
- **Framer Motion** animations
- **Lucide** icons + **canvas-confetti** celebrations
