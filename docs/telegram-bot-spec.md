# Telegram Workout Bot Spec

## Goal
A very small Telegram bot that helps Moshe follow the 28-day workout plan without depending on the web app.

The bot should do four things well:
1. Track the current workout day
2. Mark a workout day as done
3. Show current status
4. Send a morning reminder with today's workout

## Core Principle
This is an accountability bot, not a full fitness platform.
It should stay extremely simple and reliable.

## Challenge Source
The bot uses the workout plan in:
- `docs/28-day-workout-plan.md`
- or a structured JSON version derived from the same plan

## Version 1 Scope

### Commands / actions
#### 1. `today`
Returns the current active workout day and its details.

Example response:
- Day number
- Date label (optional)
- Focus
- Exercise list
- Sets / reps / duration / rest
- Short call to action: `Reply with done when you finish it.`

#### 2. `done`
Marks the current workout day as completed and advances to the next day.

Behavior:
- If current day is a workout day, mark it complete and move forward
- If the next day is a rest day, the bot should still advance into it normally
- If the current day was already marked done, do not double-advance
- Reply with confirmation and show what comes next

Example:
- `✅ Day 3 marked complete.`
- `Next up: Day 4, Legs + Core.`

#### 3. `status`
Shows progress summary.

Example fields:
- Current day
- Last completed day
- Number of completed days
- Number of remaining days
- Whether today is a workout day or rest day

#### 4. Automatic daily reminder
At **05:30 Asia/Jerusalem**, the bot sends the current day's workout.

Reminder content should contain the full daily workout, not just a short summary.

Reminder shape:
- `Good morning. Today's workout is Day X.`
- Focus
- Full exercise list
- `Reply with done when you finish.`
- A short motivational / gamified phrase

## Progress Model
The bot should use **sequential manual progression**.

Meaning:
- The user moves forward only when they send `done`
- The bot does **not** auto-advance based on calendar dates
- The daily reminder always sends the current unfinished day

This keeps the system forgiving if a day is skipped.

## Rest Days
Rest days are part of the plan.

When the current day is a rest day:
- `today` should show a recovery / rest message
- `done` should mark the rest day as completed too, if we want strict full-plan progression
- The reminder should still send the rest-day message

## Data to Persist
For version 1, save only:
- Telegram user id
- Current day
- Completed day list or completed day count
- Last completed timestamp
- Reminder enabled/disabled
- Reminder time (default 05:30)
- Time zone (default `Asia/Jerusalem`)

## Recommended Tech Shape
Keep it tiny:
- Node.js or Python bot
- one JSON or SQLite state store
- read workout data from a static file
- no heavy UI
- no complex onboarding

## Suggested Message Format
### Workout day
**Day 4 — Legs + Core**
- Bodyweight Squat: 3 × 20
- Reverse Lunge: 3 × 12
- Glute Bridge: 3 × 15
- Mountain Climber: 3 × 30 sec

Reply: `done`

### Rest day
**Day 7 — Rest / Recovery**
Today's mission is recovery.
- Light walk
- Mobility
- Stretching
- Hydration

Rest days advance automatically. No need to send `done`.

## Out of Scope for V1
- editing the workout plan from Telegram
- free-text workout notes
- analytics dashboards
- streak gamification
- multiple concurrent workout programs
- admin panel
- AI coaching

## Locked Decisions
- reminders at **05:30 Asia/Jerusalem**
- commands stay in English: `today`, `done`, `status`
- automatic reminders should **skip Shabbat**
- reminders should contain the **full daily workout**
- rest days do **not** require `done`
- motivational / gamified phrases should be included in daily messages

## Progression Rule
- workout days advance only when Moshe sends `done`
- rest days advance automatically once their calendar date has passed
- if Moshe is behind on a workout day, the bot stays on that workout day until it is marked done
