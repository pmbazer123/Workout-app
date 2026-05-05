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
npm run bot:start   # Start the Telegram workout bot
```

## Telegram Workout Bot

A lightweight Telegram bot now lives in `bot/`.

### What it does
- `today` , sends the current day workout
- `done` , marks the current workout day complete
- `status` , shows progress
- daily reminder at **05:30** with the full workout
- skips **Shabbat** reminders
- auto-advances rest days after their date passes
- adds short motivational phrases for gamification

### Setup
1. Copy `.env.example` to `.env`
2. Fill in `TELEGRAM_BOT_TOKEN`
3. Set `TELEGRAM_ALLOWED_CHAT_ID` to your Telegram chat id
4. Optionally set `WORKOUT_START_DATE` if you want to force a specific Day 1 date
5. Run:

```bash
npm run bot:start
```

### Data files
- `bot/workout-plan.json` , structured workout source for the bot
- `bot-data/telegram-workout-state.json` , local persisted bot state
- `docs/telegram-bot-spec.md` , behavior spec

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with military color palette
- **Prisma ORM** + PostgreSQL (hosted on Neon)
- **Framer Motion** animations
- **Lucide** icons + **canvas-confetti** celebrations
