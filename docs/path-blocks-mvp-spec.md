# Path Blocks MVP Product Spec

## 1. Product Objective And Non-Goals

### Objective

Path Blocks is a small personal mobile-first PWA that answers one question when Moshe opens it:

> What is the next right workout for me now?

The app should remove decision friction, keep the plan coherent after missed days, and create visible progress across:

- strength
- muscle tone
- basic running/cardio fitness
- consistency after life interruptions

The winning UX is:

> open app -> see one recommended workout -> start -> do the work -> log minimal completion

This is not a fitness platform. It is a personal adherence and progression tool.

### V1 Non-Goals

Do not build these in v1:

- AI workout generation
- Apple Health / HealthKit
- large exercise library
- Telegram-first product
- social/accountability features
- nutrition
- paid SaaS / multi-user support
- complex periodization
- complex charts
- trainer marketplace
- generalized program builder

Telegram can come later as reminder/quick-log support only. The PWA owns state and recommendations.

## 2. User Stories / Core Workflows

### Primary Stories

1. As Moshe, I open the app and immediately see the workout I should do next.
2. As Moshe, I can start the workout without choosing from a library.
3. As Moshe, I can choose a 10-minute/minimum version when time is tight.
4. As Moshe, I can complete a workout without perfect set-by-set logging.
5. As Moshe, I can miss days and return without seeing a backlog.
6. As Moshe, I can see whether this week is still alive.
7. As Moshe, I can see simple strength/cardio progress after 4 weeks.

### Core Workflows

#### Open App

- App computes current training state.
- App shows one recommended workout.
- User chooses:
  - `Start`
  - `I only have 10 minutes`
  - `Not today`

#### Do Workout

- User sees either one exercise at a time or a compact checklist.
- User marks sets done.
- User can finish even if some sets are incomplete.
- App avoids over-logging.

#### Finish Workout

Ask only:

- Completion: `normal` / `minimum` / `partial`
- Effort: `easy` / `ok` / `hard`
- Pain: `no` / `some` / `yes`

Optional but useful:

- reps per anchor set, prefilled from target
- load/band/variation only when changed

#### Return After Missed Days

- App never shows debt.
- App recommends a reduced restart version when needed.
- Copy is normal and practical:
  - `Welcome back. Today is a light restart block. It keeps the path alive.`

## 3. First-Screen UX And State Behavior

### First Screen: Next Workout

The home screen is the product. No dashboard before the recommendation.

The recommended layout is one large primary workout card plus small adjacent variant cards the user can swipe or tap into. The primary card remains the decision. The side cards are escape hatches for real life, not a workout library.

Required content:

- workout name
  - example: `S1: Squat + Push + Row`
- duration
  - example: `18-25 min`
  - minimum: `10 min`
- why this workout
  - one sentence, plain language
- what it advances
  - movement patterns and goal
- primary CTA:
  - `Start`
- secondary CTAs:
  - `I only have 10 minutes`
  - `Not today`

### Home Variant Cards

The first screen may show:

- one large main card:
  - `Recommended today`
  - the next right workout
  - default normal duration
- small side cards:
  - `Short version`
  - `Bonus set / longer version`
  - `Easy cardio / recovery option`, only when appropriate

Rules:

- There is always one primary recommendation.
- The short version is always the same workout pattern, reduced in volume.
- The longer version only adds optional third sets or a small lower-body/hinge bonus when recent effort was `easy` or `ok` and pain was `no`.
- The alternate workout cannot become an open-ended choice list.
- A different workout type should appear only when the engine already considers it acceptable, for example easy cardio after strength was completed recently.
- Variant cards must not advance the program until the user completes/logs them.

### Example Normal State

**S1: Squat + Push + Row**

`18-25 min | minimum 10 min`

Why: `This restarts the strength sequence with squat, push, and row exposure.`

Advances: `Push, pull, squat/lunge, core`

Actions:

- `Start`
- `I only have 10 minutes`
- `Not today`

### Example Restart State

**Light Restart: S1 Minimum**

`10-15 min`

Why: `You have been away for a few days, so today keeps the path alive without forcing full volume.`

Advances: `Push, pull, squat/lunge`

Actions:

- `Start`
- `Not today`

### State Behavior

The first screen changes based on:

- whether baseline benchmark exists
- last completed workout
- days since last workout
- strength count this week
- cardio count this week
- current 4-week block position
- whether week-4 benchmark is due
- pain/effort from recent logs

It should not require a calendar schedule. The app advances by completed sessions, not by pretending missed sessions happened.

## 4. Data Model, Kept Simple

Use deterministic local data first. V1 can use local storage or a tiny local DB. No backend unless explicitly approved.

### Core Entities

#### `UserSettings`

```ts
{
  id: "moshe",
  weekStartsOn: "sunday" | "monday",
  equipment: {
    chair: true,
    resistanceBand: boolean,
    dumbbells: boolean
  },
  baselineVariations: {
    pushup: string,
    squat: string,
    row: string,
    hinge: string,
    lunge: string,
    core: string
  },
  createdAt: string
}
```

#### `ProgramBlock`

```ts
{
  id: string,
  startedAt: string,
  blockNumber: number,
  goal: "strength_base_basic_running",
  status: "active" | "complete"
}
```

#### `WorkoutTemplate`

```ts
{
  id: "S1" | "S2" | "S3" | "C1" | "BENCHMARK",
  type: "strength" | "cardio" | "benchmark",
  name: string,
  normalDurationMin: number,
  minimumDurationMin: number,
  purpose: string,
  patterns: MovementPattern[],
  exercises: TemplateExercise[]
}
```

#### `TemplateExercise`

```ts
{
  id: string,
  name: string,
  pattern: MovementPattern,
  secondaryPatterns?: MovementPattern[],
  normalSets: number,
  minimumSets: number,
  repTarget?: "8-12" | string,
  holdTargetSeconds?: number,
  progressionAnchor: boolean
}
```

#### `WorkoutLog`

```ts
{
  id: string,
  templateId: string,
  startedAt: string,
  completedAt: string,
  completionType: "normal" | "minimum" | "partial",
  effort: "easy" | "ok" | "hard",
  pain: "no" | "some" | "yes",
  mode: "normal" | "minimum" | "restart",
  exerciseLogs?: ExerciseLog[]
}
```

#### `ExerciseLog`

```ts
{
  exerciseId: string,
  variation: string,
  setsCompleted: number,
  reps?: number[],
  holdSeconds?: number[],
  load?: string,
  band?: string
}
```

#### `BenchmarkLog`

```ts
{
  id: string,
  type: "day_1" | "week_4",
  completedAt: string,
  pushupVariation: string,
  pushupReps: number,
  squatReps60s: number,
  plankSeconds: number,
  cardio10MinDistance?: number,
  cardio10MinEffort?: "easy" | "ok" | "hard"
}
```

### Derived State

Do not store if it can be derived:

- current week count
- next strength template
- days since last workout
- restart level
- movement pattern coverage
- benchmark due
- progression recommendation

## 5. Next-Workout Decision Engine / State Machine

### Product Rule

The app recommends exactly one primary next workout.

No backlog. No calendar guilt. No “you owe 4 sessions.”

### Inputs

- current date/time
- workout logs
- benchmark logs
- current block start date
- last strength template completed
- days since last completed workout
- strength sessions this week
- cardio sessions this week
- recent pain/effort
- equipment settings

### Recommendation Priority

Use this order.

#### 1. Baseline Benchmark Due

If no day-1 benchmark exists:

Recommend:

- `Day 1 Benchmark`

Keep it short:

- push-up benchmark using safe current variation
- bodyweight squats in 60 seconds
- plank hold capped
- 10-minute walk/run result

After baseline, next recommendation is `S1`.

#### 2. Week-4 Benchmark Due

If block age is at least 4 weeks and week-4 benchmark is missing:

Recommend:

- `Week 4 Benchmark`

This should not require perfect completion of every workout. Trigger by time plus some participation, not ideal adherence.

Suggested trigger:

- at least 26 days since baseline, and
- either 6+ strength logs or user manually chooses `Run benchmark now`

#### 3. Restart Logic

If days since last workout is:

- `0-2 days`: normal engine
- `3-6 days`: light restart version of next strength session
- `7-13 days`: restart current micro-cycle from `S1` with reduced volume
- `14+ days`: restart from baseline variations, preserving history

Cardio never blocks strength re-entry.

#### 4. Strength Bias

Strength is the backbone.

Weekly interpretation:

- full week: 3 strength + 2 cardio
- good week: 3 strength, cardio optional
- preserved week: 2 strength + 1 cardio
- restart week: 1 short strength counts

Rules:

- If strength count this week is `0`, recommend next strength.
- If strength count is `< 3`, recommend next strength unless strength was completed very recently.
- If strength was completed today or within roughly 18 hours, recommend short/easy cardio.
- If strength count is `>= 3` and cardio count is `< 2`, recommend cardio.
- If full week is already satisfied, recommend next strength only if recovery gap is reasonable; otherwise recommend easy cardio or show “week preserved” with optional cardio.

#### 5. Strength Sequence

Strength templates rotate:

`S1 -> S2 -> S3 -> S1`

Do not skip forward because days were missed.

If restart level is weekly or baseline restart:

- restart at `S1`

#### 6. Pain/Effort Modifier

If last workout pain was `yes`:

- do not increase difficulty
- recommend minimum or easier variation
- show caution copy
- keep logging simple

If last workout pain was `some`:

- hold progression
- allow normal session if restart logic does not downgrade

If last effort was `hard`:

- hold progression
- do not add optional third set

### State Machine

```text
UNINITIALIZED
  -> BASELINE_DUE
  -> ACTIVE_NORMAL
  -> ACTIVE_RESTART_LIGHT
  -> ACTIVE_RESTART_WEEK
  -> ACTIVE_RESTART_BASELINE
  -> WEEK4_BENCHMARK_DUE
  -> BLOCK_COMPLETE
```

### Session State

```text
RECOMMENDED
  -> STARTED_NORMAL
  -> STARTED_MINIMUM
  -> COMPLETION_PROMPT
  -> LOGGED
  -> RECOMMEND_NEXT
```

`Not today` records a defer event at most. It does not advance the program.

## 6. Training Content Contract And Representation

### Contract Requirements

V1 must include:

- 3 strength session templates:
  - `S1`
  - `S2`
  - `S3`
- cardio template
- day-1 benchmark
- week-4 benchmark
- movement pattern tagging
- weekly set exposure calculation
- stable anchor movements
- normal and minimum versions
- deterministic progression rules
- missed-day/restart rules

### Movement Patterns

```ts
type MovementPattern =
  | "push"
  | "pull"
  | "squat_lunge"
  | "hinge"
  | "core"
  | "cardio"
```

### Strength Anchors

Use stable anchors, not a big library.

Recommended v1 anchors:

- squat/goblet squat
- incline push-up / push-up
- band row / dumbbell row
- Romanian deadlift / hip hinge / glute bridge
- reverse lunge / split squat
- plank
- dead bug
- side plank

### Session Templates

#### S1: Squat + Push + Row

Purpose: lower-body squat pattern, upper-body pushing, upper-body pulling.

Normal:

- squat or goblet squat: 2 sets, 8-12 reps
- incline push-up or push-up: 2 sets, 8-12 reps
- band or dumbbell row: 2 sets, 8-12 reps
- plank: 1-2 short sets

Minimum:

- squat: 1-2 sets
- push-up variation: 1-2 sets
- row: 1-2 sets

#### S2: Hinge + Pull + Push

Purpose: posterior chain, upper-body pull, repeated push practice.

Normal:

- Romanian deadlift, hip hinge, or glute bridge: 2 sets, 8-12 reps
- band or dumbbell row: 2 sets, 8-12 reps
- push-up variation: 2 sets, 8-12 reps
- dead bug: 1-2 short sets

Minimum:

- hinge/glute movement: 1-2 sets
- row: 1-2 sets
- push-up variation: 1-2 sets

#### S3: Lunge + Push + Row

Purpose: single-leg work, repeated push/pull exposure, lateral core.

Normal:

- reverse lunge or split squat: 2 sets, 8-12 reps each side
- push-up variation: 2 sets, 8-12 reps
- band or dumbbell row: 2 sets, 8-12 reps
- side plank: 1-2 short sets

Minimum:

- lunge/split squat: 1-2 sets
- push-up variation: 1-2 sets
- row: 1-2 sets

### Optional Third Set

V1 may offer a third set only as an expansion.

Rules:

- never required for completion
- offered only when recent effort is `easy` or `ok`
- not offered after restart or pain
- used to reach weekly exposure targets when time allows

### Weekly Set Exposure

Normal 3-strength week, required sets only:

| Pattern | Required Weekly Sets | Target | Notes |
|---|---:|---:|---|
| push | 6 | 6-9 | Meets target |
| pull | 6 | 6-9 | Meets target if band/dumbbell row exists |
| squat_lunge | 4 | 5-8 | Slightly low unless one optional lower set is added |
| hinge/glutes | 2 primary + secondary glute exposure | 4-6 | Needs approved counting rule |
| core | 3-6 | 4-6 | Meets target if at least one session uses 2 core sets |
| cardio | 1-2 sessions | 1-2 | Flexible |

Opinionated product call:

- Approve v1 as “good enough” if the normal week delivers 6 push, 6 pull, 4 lower, 2 hinge, and 3-6 core.
- To satisfy the written target more strictly, add one optional lower-body set to S1 or S3 and count lunge/squat as secondary glute exposure.
- Do not add more exercises just to make the table pretty.

### First 4-Week Content Table

This is ordered content, not a rigid calendar.

| Block Week | Strength Path | Cardio Path | Benchmark |
|---|---|---|---|
| Week 1 | Baseline, S1, S2, S3 | 1 short easy cardio, optional second | Day-1 benchmark first |
| Week 2 | S1, S2, S3 | 1-2 easy cardio sessions | none |
| Week 3 | S1, S2, S3, optional third sets if earned | 1-2 easy cardio sessions | none |
| Week 4 | S1, S2, S3 with no forced volume jump | 1 easy cardio optional | Week-4 benchmark at end |

Cardio remains easy. No intervals in v1.

## 7. Missed-Day / Restart Rules

### Core Principle

No backlog.

The app should never say:

- `You missed 4 workouts`
- `You owe S2 and S3`
- `Catch up today`

### Rules

#### Missed 1 Day

Serve the next best session.

No special copy required.

#### Missed 3+ Days

Serve a restart version with reduced volume.

Use:

- next strength template
- minimum or 1-2 set version
- no optional third sets
- no progression increase

Copy:

`Welcome back. Today is a light restart block. It keeps the path alive.`

#### Missed 1 Week

Restart current micro-cycle.

Use:

- `S1`
- 2-set defaults
- easier progression
- preserve history

Do not erase progress.

#### Missed 2+ Weeks

Restart from baseline variations.

Use:

- `S1`
- baseline/easier variations
- minimum available if needed
- preserve history and previous benchmarks

Do not require new onboarding.

### Restart Week Definition

A restart week is successful if Moshe completes one short strength session.

The app should show:

- `Restart week preserved`
- not failure language

## 8. Logging And Progress / Benchmark Rules

### Minimal Completion Logging

At finish, required fields only:

- completion type:
  - `normal`
  - `minimum`
  - `partial`
- effort:
  - `easy`
  - `ok`
  - `hard`
- pain:
  - `no`
  - `some`
  - `yes`

### Set/Reps Logging

Set logging should be optional and lightweight.

Recommended behavior:

- prefill target reps
- user can tap set done
- user can adjust reps only if needed
- app can finish without every field complete

### Progression Rules

For strength anchors:

- start at a variation that allows 8-12 clean reps
- stop most sets with 1-3 reps in reserve
- if 2 sets of 12 clean reps are completed twice in a row, suggest harder difficulty
- if fewer than 8 clean reps are completed, suggest easier difficulty
- if effort is `hard`, hold difficulty
- if pain is `some`, hold difficulty
- if pain is `yes`, reduce difficulty next time

Progression options:

- add a third set
- harder variation
- more band tension
- dumbbell load
- slower tempo

V1 should suggest progression. It does not need a complex progression editor.

### Benchmarks

Run:

- day 1
- end of week 4

Strength benchmark:

- push-up benchmark using current safe variation
- bodyweight squats in 60 seconds
- plank hold, capped

Cardio benchmark:

- 10-minute walk/run
- track distance if user knows it
- otherwise track perceived effort

Progress display should support:

- more reps at same difficulty
- same reps with lower effort
- harder variation
- longer plank
- better 10-minute walk/run result

### Motivation And Progress Honesty

Two failure modes to avoid, both equally:

1. Never show a workout as completed when it was not done. The app must never inflate the record to look good.
2. Never frame missed days as an owed backlog (`you owe 4 sessions`, `catch up`). No debt, no guilt.

Between those two, positive motivation is welcome and wanted:

- **Absence nudge (motivator, not guilt):** it is fine to surface `You haven't trained in 5 days` or `10 days since your last session` as a gentle re-engagement prompt. This is a nudge to come back, not a tally of debt. Frame it forward (`ready when you are`), never as failure.
- **Streak / consistency stat (motivator):** show what he is building toward, e.g.:
  - current streak: `You've trained 5x/week for the last 5 weeks`
  - cumulative count: `16 workouts done`
  - rolling frequency: `5 sessions in the last 7 days`
- These stats reflect only real completed sessions, and they degrade honestly (a real streak breaks when he stops), but they never turn into a backlog or a scold.

The line: reflect reality honestly, motivate forward, never manufacture completion, never manufacture debt.

### Pain Handling

V1 is not medical software.

If pain is `yes`, app should:

- stop progression
- suggest easier next version
- use plain safety copy
- not diagnose anything

## 9. Suggested MVP Screens Only

### 1. Home / Next Workout

Required.

This is the main app.

Recommended layout:

- one large primary recommendation card
- small swipeable/tappable variant cards for:
  - short version
  - bonus longer version
  - occasional easy cardio/recovery option

Guardrail: the user should feel guided, not asked to browse options.

### 2. Workout Screen

Required.

Two acceptable layouts:

- one exercise at a time
- compact checklist

Pick the simpler implementation. Compact checklist is probably enough for v1.

### 3. Completion Sheet

Required.

Shows after finish.

Fields:

- completed: normal/minimum/partial
- effort
- pain
- optional notes/reps only if already captured

### 4. Progress Screen

Required but small.

Show:

- this week:
  - strength count
  - cardio count
- movement pattern coverage
- current anchors
- benchmark comparison if available
- current block goal:
  - `Strength base + basic running fitness`
- motivation stats (real data only, per Section 8 honesty rules):
  - current streak / rolling frequency (e.g. `5x/week for 5 weeks`)
  - cumulative workouts done
  - absence nudge when relevant (e.g. `10 days since your last session`), framed forward

No complex charts. No owed-workout backlog. No fake completions.

### 5. Settings / Setup

Required but tiny.

Fields:

- equipment:
  - resistance band
  - dumbbells
- week start
- baseline exercise variations
- reset/export data, if easy

### Not MVP Screens

Do not build:

- calendar screen
- exercise library
- social feed
- trainer/admin area
- analytics dashboard
- nutrition
- Telegram control panel

## 10. Build Phases

Each phase should be small enough for Claude Code / Betz.

### Phase 0: Spec Approval

Output:

- approved product spec
- approved content contract
- approved open questions

Acceptance:

- Moshe/Josh agree on scope
- no code started

### Phase 1: Static PWA Skeleton

Build:

- mobile-first app shell
- Home / Workout / Progress / Settings routes
- hardcoded recommendation

Acceptance:

- app opens to next-workout screen
- no backend needed
- installable PWA basics if cheap

### Phase 2: Hardcoded Content Model

Build:

- S1/S2/S3 templates
- cardio template
- benchmark template
- movement pattern metadata

Acceptance:

- app can render all templates
- minimum and normal versions exist
- content is not pulled from a huge library

### Phase 3: Local State And Logs

Build:

- local workout logs
- completion flow
- minimal local persistence

Acceptance:

- completing a workout changes next recommendation
- reload preserves history
- `Not today` does not advance workout state

### Phase 4: Next-Workout Engine

Build:

- strength rotation
- weekly strength/cardio counts
- strength-biased recommendation
- benchmark due detection

Acceptance:

- S1/S2/S3 rotate correctly
- cardio appears only when useful
- baseline and week-4 benchmarks trigger correctly

### Phase 5: Restart Logic

Build:

- 3+ day light restart
- 1-week restart from S1
- 2+ week baseline-variation restart
- restart copy

Acceptance:

- no backlog appears
- reduced-volume sessions are recommended after lapses
- history is preserved

### Phase 6: Progress Display

Build:

- weekly counts
- movement coverage
- anchor progress
- benchmark comparison

Acceptance:

- progress screen is useful but small
- no complex charts
- benchmark delta is understandable

### Phase 7: Polish / QA

Build:

- mobile layout fixes
- empty states
- manual data reset/export if approved
- copy pass

Acceptance:

- open app -> start workout takes one tap
- minimum workout path works
- completion logging takes under 15 seconds
- no AI, HealthKit, Telegram dependency, or large library sneaks in

## 11. Risks, Open Questions, And Required Approvals

### Risks

1. Scope creep into a generic fitness tracker.
2. Over-logging kills the short-workout promise.
3. Weekly exposure targets conflict with the intentionally tiny S1/S2/S3 design.
4. No equipment makes pull training weak; resistance band should be strongly recommended.
5. Restart logic may become too clever. Keep it deterministic.
6. Benchmarking may feel like friction if shown before any workout. Keep it short.
7. Local-only storage can lose data unless export/backup is added.

### Open Questions

1. Week start: Sunday or Monday?
2. Does Moshe currently have a resistance band?
3. Are adjustable dumbbells available now or future-only?
4. What is the safest starting push-up variation?
5. Should day-1 benchmark happen before S1, or after first successful workout?
6. Should cardio distance be manually entered or just effort/time in v1?
7. Is local-only storage acceptable for the first build?
8. Should the app include data export/reset in v1?
9. Should optional third sets be included in v1 UI or hidden until later?

### Moshe/Josh Must Approve Before Build

1. PWA owns the experience; Telegram is out of v1.
2. No AI, HealthKit, large library, or social/accountability features in v1.
3. Exact S1/S2/S3 content.
4. Whether the weekly set exposure contract is acceptable with small sessions.
5. Restart thresholds:
   - 3+ days
   - 1 week
   - 2+ weeks
6. Baseline and week-4 benchmark contents.
7. Local-first persistence choice.
8. MVP screens:
   - Home
   - Workout
   - Completion
   - Progress
   - Settings only

Final product stance: build the smallest thing that reliably gives Moshe the next right workout and makes returning after missed days feel normal.
