# How to Deploy Your Workout App (Step-by-Step)

No coding required. This guide takes about 15 minutes.

You will end up with a live URL like `https://workout-app-xxx.vercel.app` that works on any device, anywhere.

---

## What You'll Need

- A **GitHub account** (you probably already have this since the code is there)
- A **Neon account** (free database hosting) — you'll create one below
- A **Vercel account** (free app hosting) — you'll create one below

---

## Part 1 — Set Up Your Database (Neon)

Neon hosts your database for free. This replaces the local SQLite file on your PC.

**Step 1.** Go to [https://neon.tech](https://neon.tech) and click **Sign Up**. Sign up with your GitHub account — it's the easiest option.

**Step 2.** After signing in, Neon will ask you to create a project. Fill it in:
- **Project name:** anything you like, e.g. `workout-app`
- **Database name:** leave it as the default (`neondb`)
- **Region:** pick the one closest to you
- Click **Create project**

**Step 3.** Once the project is created, Neon will show you a connection string. It looks like this:

```
postgresql://alex:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Copy this entire string and paste it somewhere safe** (like a text file on your desktop). You'll need it in Part 2. Don't share it with anyone — it's your database password.

> **Can't find it?** On the Neon dashboard, click your project → **Connection Details** → make sure the dropdown says **Prisma** → copy the `DATABASE_URL` value.

---

## Part 2 — Deploy Your App (Vercel)

Vercel hosts your app for free and automatically re-deploys it every time you push code to GitHub.

**Step 1.** Go to [https://vercel.com](https://vercel.com) and click **Sign Up**. Sign up with your GitHub account.

**Step 2.** After signing in, you'll land on your Vercel dashboard. Click **Add New…** → **Project**.

**Step 3.** Vercel will ask to connect your GitHub. Click **Install**, approve access, and come back to Vercel.

**Step 4.** You'll see a list of your GitHub repositories. Find **workout-app** (or whatever you named it) and click **Import**.

**Step 5.** On the next screen, Vercel shows you deploy settings. You don't need to change anything here **except one thing** — scroll down to the **Environment Variables** section.

Add a new variable:
- **Name:** `DATABASE_URL`
- **Value:** paste the connection string you copied from Neon in Part 1

Click **Add** to confirm the variable.

**Step 6.** Click the big **Deploy** button.

Vercel will now:
1. Pull your code from GitHub
2. Install dependencies
3. Set up your database schema on Neon
4. Seed your exercise library
5. Build the app

This takes about 2–4 minutes. You'll see a live progress log.

**Step 7.** When it finishes, Vercel shows a **Congratulations** screen with a preview of your app. Click **Visit** (or the URL it shows) to open your live app.

---

## Part 3 — Use Your App

Open the URL Vercel gave you (something like `https://workout-app-xxx.vercel.app`) and complete the onboarding — pick your age range, fitness level, goals, and equipment. Your 28-day program will be generated and saved to the cloud.

You can bookmark this URL on your phone and it works like a normal website.

---

## Part 4 — Future Updates (Optional)

Whenever you make changes to the code and push to GitHub, Vercel will automatically detect the push and re-deploy within a couple of minutes. You don't have to do anything — just push and wait.

---

## Troubleshooting

**The build failed with a database error**
- Double-check that the `DATABASE_URL` environment variable in Vercel matches exactly what Neon gave you (no extra spaces, no missing characters)
- In Vercel: go to your project → **Settings** → **Environment Variables** → edit and re-paste the value → then go to **Deployments** → click the three dots on the latest deploy → **Redeploy**

**I can't find my Neon connection string**
- Log in to [neon.tech](https://neon.tech) → click your project → **Connection Details** panel on the right → change the dropdown to **Prisma** → copy the `DATABASE_URL` line (just the value in quotes, not the `DATABASE_URL=` part)

**The app loads but onboarding doesn't save**
- This usually means the database wasn't seeded. Go to Vercel → **Deployments** → click the latest deploy → check the build log for errors during the seed step

**I want to reset my progress and start fresh**
- Go to your Neon dashboard → your project → **Tables** → delete all rows from `UserProfile` → next time you visit the app it will send you back to onboarding

---

That's it. You've got a fully hosted workout app. 🎖️
