# 28-DAY CHALLENGE | COMBAT FITNESS

A personal military-style 28-day workout challenge web app. Dark theme, tactical vibes, satisfying micro-interactions. Built to run locally and be accessible from your phone via Tailscale.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create the SQLite database and apply the schema
npm run db:push

# 3. Seed exercise library and 28-day workout program
npm run db:seed

# 4. Start the dev server (binds to all interfaces for Tailscale access)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Complete the onboarding to generate your 28-day program.

## Tailscale Access (Phone)

1. Find your PC's Tailscale IP:
   ```bash
   tailscale ip -4
   ```
2. On your phone (connected to Tailscale), open:
   ```
   http://<YOUR-TAILSCALE-IP>:3000
   ```

The dev server binds to `0.0.0.0:3000` so it's reachable on all interfaces including Tailscale.

## Environment

Copy `.env.example` to `.env` (already done by setup):

```
DATABASE_URL="file:./dev.db"
```

The SQLite database file lives at `prisma/dev.db` (path relative to the schema) — it is git-ignored.

## Other Commands

```bash
npm run db:studio   # Open Prisma Studio to inspect data
npm run db:reset    # Wipe and re-seed (start fresh)
npm run build       # Production build
npm run start       # Production server (also binds to 0.0.0.0:3000)
```

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with military color palette
- **Prisma ORM** + SQLite (single-user, local)
- **Framer Motion** animations
- **Lucide** icons + **canvas-confetti** celebrations
