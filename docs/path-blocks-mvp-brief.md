# Path Blocks MVP Brief

Status: draft for product-spec handoff, not a build spec yet.

## Why This Exists

The Telegram 28-day workout bot failed the real test: it marked the challenge complete even though only a few workouts actually happened. The core failure was not reminders. The core failure was that the plan stopped being relevant after missed days, and when Moshe had time to exercise he still had to decide what to do.

The new product should be a small personal training app that answers one question:

> What is the next right workout for me now?

It should show a coherent path toward strength, muscle tone, and basic running fitness, while recovering gracefully after missed days.

## Product Thesis

Build a mobile-first PWA, not a Telegram-first bot.

The app should open directly to a single recommended workout. Telegram can later send reminders or quick-log commands, but the PWA owns state, context, progress, and the explanation for why today's workout matters.

## Target User

Primary user: Moshe.

Constraints:

- Busy 37-year-old father.
- Irregular available time.
- Wants short, realistic sessions.
- Wants visible progress in strength, muscle tone, and general fitness.
- Needs less decision friction at the moment of exercise.
- Needs restart logic after lapses, not guilt or backlog.

## Weekly Training Shape

The default target is:

- 3 short home strength sessions per week.
- 2 running/cardio sessions per week.

This should not be presented as a brittle checklist.

App interpretation:

- Full week: 3 strength + 2 cardio.
- Good week: 3 strength, cardio optional if life is crowded.
- Preserved week: 2 strength + 1 cardio.
- Restart week: 1 short strength session counts as re-entry, not failure.

## Content Contract Before Code

Before implementation, the app must have a training-content contract that proves the program is not random movement.

The content contract must define:

- 3 strength session templates: `S1`, `S2`, `S3`.
- Movement patterns covered by each session.
- Weekly set exposure per movement pattern.
- Stable anchor exercises that repeat enough to measure progress.
- Normal and minimum versions for every session.
- Simple progression rules.
- Missed-day and restart rules.
- Day-1 and week-4 benchmark tests.

The full 4-week table can be generated during detailed spec work, but the rules above must be settled before code.

## Movement Pattern Coverage

The app should track movement patterns, not bodybuilding body-part splits.

Patterns:

- `push`: chest, shoulders, triceps.
- `pull`: upper back, lats, biceps.
- `squat_lunge`: quads, glutes, single-leg control.
- `hinge`: hamstrings, glutes, posterior chain.
- `core`: trunk stability.
- `cardio`: aerobic/running capacity.

Target v0 weekly exposure:

- Push: 6-9 sets/week.
- Pull: 6-9 sets/week.
- Squat/Lunge: 5-8 sets/week.
- Hinge/Glutes: 4-6 sets/week.
- Core: 4-6 short exposures/week.
- Cardio: 1-2 sessions/week.

These are practical targets, not medical promises.

## Required Equipment

Minimum:

- Floor space.
- Stable chair/bench.
- Resistance band.

Optional:

- Adjustable dumbbells.

Product note: do not pretend home pull training is good with no equipment. A resistance band should be recommended during onboarding.

## Strength Session Templates

Default session length: 15-25 minutes.

Default volume: 2 sets per anchor exercise.

Optional expansion: add a third set when time and energy allow.

### S1: Squat + Push + Row

Purpose: lower-body squat pattern, upper-body pushing, upper-body pulling.

Normal:

- Squat or goblet squat: 2 sets.
- Incline push-up or push-up variation: 2 sets.
- Band or dumbbell row: 2 sets.
- Short plank: 1-2 sets.

Minimum:

- Squat: 1-2 sets.
- Push-up variation: 1-2 sets.
- Row: 1-2 sets.

### S2: Hinge + Pull + Push

Purpose: posterior chain, upper-body pull, repeated push practice.

Normal:

- Romanian deadlift, hip hinge, or glute bridge: 2 sets.
- Band or dumbbell row: 2 sets.
- Push-up variation: 2 sets.
- Dead bug: 1-2 sets.

Minimum:

- Hinge/glute movement: 1-2 sets.
- Row: 1-2 sets.
- Push-up variation: 1-2 sets.

### S3: Lunge + Push + Row

Purpose: single-leg lower-body work, repeated push/pull exposure, lateral core.

Normal:

- Reverse lunge or split squat: 2 sets.
- Push-up variation: 2 sets.
- Band or dumbbell row: 2 sets.
- Side plank: 1-2 sets.

Minimum:

- Lunge/split squat: 1-2 sets.
- Push-up variation: 1-2 sets.
- Row: 1-2 sets.

## Cardio Templates

Cardio should remain flexible.

Normal:

- 30-40 minutes easy run, walk-run, or aerobic session.

Short:

- 20 minutes easy run/walk-run.

Minimum:

- 10 minutes walk or easy run/walk.

Rules:

- Do not punish missed cardio.
- Do not make cardio block strength re-entry.
- Avoid hard intervals in v0 unless the user has built consistency.

## Progression Rules

Use simple, explainable progression.

For strength anchors:

- Start each exercise at a version that allows 8-12 clean reps.
- Stop most sets with 1-3 reps in reserve.
- If the user completes 2 sets of 12 clean reps twice in a row, increase difficulty.
- Difficulty can increase by:
  - adding a third set,
  - using a harder variation,
  - increasing band tension,
  - adding dumbbell load,
  - slowing tempo.
- If the user cannot complete 8 clean reps, reduce difficulty.

For the app:

- Track exercise variation, reps, sets, effort, and completion type.
- Prefer progression clarity over precision.
- Avoid asking for too much logging inside a short workout.

## Benchmarks

Run on day 1 and at the end of week 4.

Strength:

- Push-up benchmark using the current safe variation.
- Bodyweight squats in 60 seconds.
- Plank hold, capped to a sensible max.

Cardio:

- 10-minute walk/run benchmark: distance or perceived effort.

The app should show progress as:

- more reps at the same difficulty,
- same reps with lower effort,
- harder exercise variation,
- longer hold,
- better 10-minute run/walk result.

## Missed-Day Logic

Core principle: no backlog.

The app never says "you owe 4 workouts."

Rules:

- Missed 1 day: serve the next best session.
- Missed 3+ days: serve a restart version with reduced volume.
- Missed 1 week: restart the current micro-cycle with 2-set defaults and easier progression.
- Missed 2+ weeks: restart from baseline variations while preserving history.

Restart copy should feel normal, not apologetic:

> Welcome back. Today is a light restart block. It keeps the path alive.

## V1 UX

### First Screen: Next Workout

The first screen should show only the next recommended workout.

Required elements:

- Workout name, e.g. `S1: Squat + Push + Row`.
- Duration: normal and minimum.
- Why this workout: one plain sentence.
- What it advances: movement patterns and goal.
- Primary button: `Start`.
- Secondary: `I only have 10 minutes`.
- Secondary: `Not today`.

### During Workout

Keep interaction minimal.

- Show one exercise at a time or a compact checklist.
- Show sets/reps.
- Allow marking sets done.
- Allow finish without perfect logging.

### After Workout

Ask only:

- Completed: normal / minimum / partial.
- Effort: easy / ok / hard.
- Pain: no / some / yes.

### Progress Screen

Keep it simple.

- This week: strength count and cardio count.
- Movement pattern coverage.
- Current anchor progress.
- Current block goal: strength base + basic running fitness.

## Explicit Non-Goals for V1

Do not include in v1:

- AI workout generation.
- Large exercise library.
- Apple Health integration.
- Telegram as the primary app.
- Social/accountability features.
- Complex charts.
- Nutrition.
- Paid SaaS/multi-user support.
- Perfect periodization.

## Handoff Prompt For Deep Spec

Use this prompt for Claude Code / Yos before implementation:

```text
You are helping spec a small personal fitness adherence PWA called Path Blocks.

Do not build code yet.

Your task is to turn the attached product brief into a detailed build-ready spec, while keeping the product minimal and focused.

Context:
- The previous Telegram workout bot failed because it marked progress without real adherence and became irrelevant after missed days.
- The user needs one clear "next right workout" when he opens the app.
- The product is for one person first, not a general SaaS.
- The goal is strength, muscle tone, and basic running fitness.
- The weekly target is 3 short home strength sessions and 2 flexible cardio/running sessions.
- The app must recover after missed days without backlog or guilt.

Important constraints:
- Mobile-first PWA.
- V1 should be local/simple if possible.
- No AI workout generation in v1.
- No Apple Health in v1.
- No huge exercise library.
- Telegram is optional later for reminders/quick logging only.
- Keep workouts short enough to actually start: strength sessions should fit 15-25 minutes.
- Workout content must not be random. It must satisfy the movement-pattern coverage and progression rules in the brief.

Please produce:

1. Product summary.
2. User stories.
3. Screen-by-screen UX spec.
4. Data model.
5. Workout content model.
6. The first 4-week content table generated from the content contract.
7. Movement-pattern coverage table showing weekly set counts.
8. Next-workout selection algorithm.
9. Missed-day/restart state machine.
10. Minimal logging flow.
11. Progress display spec.
12. Build phases with acceptance criteria.
13. Test plan.
14. Risks and questions.

Guardrails:
- If the brief is overcomplicated, simplify it.
- If the workout content is too heavy for 15-25 minutes, reduce it.
- If the app starts looking like a generic fitness tracker, push back.
- Prefer deterministic rules over AI.
- Prefer a tiny useful v1 over a broad incomplete app.
```

## Build Phases To Validate Later

Phase 0: spec only.

Phase 1: static PWA prototype with hardcoded content and local state.

Phase 2: next-workout rule engine.

Phase 3: minimal workout logging and progress display.

Phase 4: restart logic.

Phase 5: optional Telegram reminder/quick-log integration.
