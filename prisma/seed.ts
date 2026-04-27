// Uses relative imports (not @/ alias) — tsx doesn't resolve Next.js path aliases.
import { PrismaClient } from '@prisma/client'
import { EXERCISES } from '../src/lib/exercises-data'

const prisma = new PrismaClient()

// ── REST DAYS ─────────────────────────────────────────────────────────────────
// Sat + Sun each week → 8 rest days, 20 workout days
const REST_DAYS = new Set([6, 7, 13, 14, 20, 21, 27, 28])

// ── 28-DAY PLAN ───────────────────────────────────────────────────────────────
// Tailored for: 37M, decent shape, pull-up bar + bodyweight only
// Goals: strength + muscle + endurance
// Schedule: Mon Push+Core | Tue Run | Wed Pull+Core | Thu Legs+Core | Fri Full Body

type Slot = { name: string; sets: number; reps: number | null; dur: number | null; rest: number }

const PLAN: Record<number, Slot[]> = {
  // ── WEEK 1 · FOUNDATION ──────────────────────────────────────────────────
  1: [
    { name: 'Push-Up',            sets: 3, reps: 12,   dur: null, rest: 45 },
    { name: 'Pike Push-Up',       sets: 3, reps: 8,    dur: null, rest: 45 },
    { name: 'Tricep Dip (Floor)', sets: 3, reps: 10,   dur: null, rest: 45 },
    { name: 'Plank',              sets: 3, reps: null,  dur: 30,  rest: 30 },
  ],
  2: [
    { name: 'Easy Run',           sets: 1, reps: null,  dur: 1200, rest: 0 },
  ],
  3: [
    { name: 'Inverted Row',       sets: 3, reps: 8,    dur: null, rest: 60 },
    { name: 'Pull-Up',            sets: 3, reps: 4,    dur: null, rest: 90 },
    { name: 'Hanging Knee Raise', sets: 3, reps: 8,    dur: null, rest: 45 },
    { name: 'Superman Hold',      sets: 3, reps: null,  dur: 20,  rest: 30 },
  ],
  4: [
    { name: 'Bodyweight Squat',   sets: 3, reps: 20,   dur: null, rest: 30 },
    { name: 'Reverse Lunge',      sets: 3, reps: 12,   dur: null, rest: 45 },
    { name: 'Glute Bridge',       sets: 3, reps: 15,   dur: null, rest: 30 },
    { name: 'Mountain Climber',   sets: 3, reps: null,  dur: 30,  rest: 30 },
  ],
  5: [
    { name: 'Push-Up',            sets: 3, reps: 10,   dur: null, rest: 30 },
    { name: 'Bodyweight Squat',   sets: 3, reps: 15,   dur: null, rest: 30 },
    { name: 'Pull-Up',            sets: 3, reps: 4,    dur: null, rest: 60 },
    { name: 'Plank',              sets: 3, reps: null,  dur: 30,  rest: 30 },
  ],

  // ── WEEK 2 · BUILDING ────────────────────────────────────────────────────
  8: [
    { name: 'Push-Up',            sets: 3, reps: 15,   dur: null, rest: 45 },
    { name: 'Decline Push-Up',    sets: 3, reps: 10,   dur: null, rest: 45 },
    { name: 'Tricep Dip (Floor)', sets: 3, reps: 12,   dur: null, rest: 45 },
    { name: 'Hollow Body Hold',   sets: 3, reps: null,  dur: 20,  rest: 30 },
  ],
  9: [
    { name: 'Running Intervals',  sets: 5, reps: null,  dur: 120, rest: 60 },
  ],
  10: [
    { name: 'Inverted Row',       sets: 3, reps: 10,   dur: null, rest: 60 },
    { name: 'Pull-Up',            sets: 3, reps: 5,    dur: null, rest: 90 },
    { name: 'Chin-Up',            sets: 3, reps: 4,    dur: null, rest: 90 },
    { name: 'Hanging Knee Raise', sets: 3, reps: 10,   dur: null, rest: 45 },
  ],
  11: [
    { name: 'Bodyweight Squat',      sets: 3, reps: 25,  dur: null, rest: 30 },
    { name: 'Bulgarian Split Squat', sets: 3, reps: 8,   dur: null, rest: 60 },
    { name: 'Glute Bridge',          sets: 3, reps: 20,  dur: null, rest: 30 },
    { name: 'Mountain Climber',      sets: 3, reps: null, dur: 40,  rest: 30 },
  ],
  12: [
    { name: 'Push-Up',            sets: 4, reps: 12,   dur: null, rest: 30 },
    { name: 'Reverse Lunge',      sets: 4, reps: 10,   dur: null, rest: 30 },
    { name: 'Pull-Up',            sets: 4, reps: 5,    dur: null, rest: 60 },
    { name: 'Plank',              sets: 4, reps: null,  dur: 30,  rest: 30 },
  ],

  // ── WEEK 3 · INTENSITY ───────────────────────────────────────────────────
  15: [
    { name: 'Diamond Push-Up',    sets: 3, reps: 10,   dur: null, rest: 60 },
    { name: 'Pike Push-Up',       sets: 4, reps: 10,   dur: null, rest: 45 },
    { name: 'Tricep Dip (Floor)', sets: 4, reps: 12,   dur: null, rest: 45 },
    { name: 'Hollow Body Hold',   sets: 4, reps: null,  dur: 25,  rest: 30 },
  ],
  16: [
    { name: 'Tempo Run',          sets: 1, reps: null,  dur: 900, rest: 0 },
  ],
  17: [
    { name: 'Pull-Up',            sets: 4, reps: 5,    dur: null, rest: 90 },
    { name: 'Chin-Up',            sets: 4, reps: 6,    dur: null, rest: 90 },
    { name: 'Inverted Row',       sets: 3, reps: 12,   dur: null, rest: 60 },
    { name: 'Hanging Knee Raise', sets: 4, reps: 10,   dur: null, rest: 45 },
  ],
  18: [
    { name: 'Bulgarian Split Squat', sets: 4, reps: 10,  dur: null, rest: 60 },
    { name: 'Step-Up',               sets: 3, reps: 15,  dur: null, rest: 45 },
    { name: 'Glute Bridge',          sets: 4, reps: 20,  dur: null, rest: 30 },
    { name: 'Mountain Climber',      sets: 4, reps: null, dur: 40,  rest: 30 },
  ],
  19: [
    { name: 'Push-Up',            sets: 4, reps: 15,   dur: null, rest: 30 },
    { name: 'Bodyweight Squat',   sets: 4, reps: 20,   dur: null, rest: 30 },
    { name: 'Pull-Up',            sets: 4, reps: 5,    dur: null, rest: 60 },
    { name: 'Plank',              sets: 4, reps: null,  dur: 40,  rest: 30 },
  ],

  // ── WEEK 4 · PEAK ────────────────────────────────────────────────────────
  22: [
    { name: 'Diamond Push-Up',    sets: 4, reps: 12,   dur: null, rest: 60 },
    { name: 'Decline Push-Up',    sets: 4, reps: 12,   dur: null, rest: 60 },
    { name: 'Pike Push-Up',       sets: 4, reps: 10,   dur: null, rest: 60 },
    { name: 'Tricep Dip (Floor)', sets: 4, reps: 15,   dur: null, rest: 60 },
  ],
  23: [
    { name: 'Steady Run',         sets: 1, reps: null,  dur: 1500, rest: 0 },
  ],
  24: [
    { name: 'Pull-Up',            sets: 5, reps: 5,    dur: null, rest: 90 },
    { name: 'Chin-Up',            sets: 5, reps: 6,    dur: null, rest: 90 },
    { name: 'Hanging Knee Raise', sets: 4, reps: 12,   dur: null, rest: 45 },
    { name: 'Superman Hold',      sets: 4, reps: null,  dur: 30,  rest: 30 },
  ],
  25: [
    { name: 'Bulgarian Split Squat', sets: 4, reps: 12,  dur: null, rest: 60 },
    { name: 'Step-Up',               sets: 4, reps: 15,  dur: null, rest: 45 },
    { name: 'Glute Bridge',          sets: 4, reps: 20,  dur: null, rest: 30 },
    { name: 'Mountain Climber',      sets: 4, reps: null, dur: 45,  rest: 30 },
  ],
  26: [  // FINAL MISSION
    { name: 'Push-Up',            sets: 5, reps: 20,   dur: null, rest: 60 },
    { name: 'Pull-Up',            sets: 5, reps: 8,    dur: null, rest: 90 },
    { name: 'Bodyweight Squat',   sets: 5, reps: 25,   dur: null, rest: 60 },
    { name: 'Plank',              sets: 5, reps: null,  dur: 45,  rest: 45 },
  ],
}

async function main() {
  // ── 1. Seed exercises ─────────────────────────────────────────────────────
  console.log('🌱  Seeding exercise library…')
  let created = 0, skipped = 0
  for (const ex of EXERCISES) {
    const existing = await prisma.exercise.findUnique({ where: { name: ex.name } })
    if (existing) { skipped++; continue }
    await prisma.exercise.create({
      data: {
        name:            ex.name,
        category:        ex.category,
        description:     ex.description,
        musclesTargeted: JSON.stringify(ex.musclesTargeted),
        formCues:        JSON.stringify(ex.formCues),
        equipment:       JSON.stringify(ex.equipment),
        fitnessLevels:   JSON.stringify(ex.fitnessLevels),
      },
    })
    created++
  }
  console.log(`   ${created} exercises created, ${skipped} already existed.`)

  // ── 2. Build name → id map ────────────────────────────────────────────────
  const allExercises = await prisma.exercise.findMany({ select: { id: true, name: true } })
  const idMap = new Map(allExercises.map((e) => [e.name, e.id]))

  // ── 3. Skip if user profile already exists (protects live data on redeploy) ─
  const existingProfile = await prisma.userProfile.findFirst()
  if (existingProfile) {
    console.log('✅  Profile already exists — skipping plan creation (data is safe).')
    return
  }

  // ── 4. Create user profile ────────────────────────────────────────────────
  console.log('👤  Creating user profile…')
  const profile = await prisma.userProfile.create({
    data: {
      ageRange:     '36-45',
      fitnessLevel: 'Soldier',
      goals:        JSON.stringify(['strength', 'endurance']),
      equipment:    JSON.stringify(['pull_up_bar']),
    },
  })

  // ── 5. Create challenge ───────────────────────────────────────────────────
  console.log('🎯  Creating 28-day challenge…')
  const challenge = await prisma.challenge.create({
    data: {
      userId:    profile.id,
      startDate: new Date(),
      currentDay: 1,
      isActive:  true,
    },
  })

  // ── 6. Create all 28 daily workouts ──────────────────────────────────────
  console.log('📅  Building 28-day plan…')
  for (let day = 1; day <= 28; day++) {
    const isRestDay = REST_DAYS.has(day)

    if (isRestDay) {
      await prisma.dailyWorkout.create({
        data: {
          challengeId: challenge.id,
          dayNumber:   day,
          exercises:   JSON.stringify([]),
          isRestDay:   true,
        },
      })
      continue
    }

    const slots = PLAN[day]
    if (!slots) {
      console.warn(`   ⚠️  No plan defined for day ${day} — creating empty workout`)
      await prisma.dailyWorkout.create({
        data: {
          challengeId: challenge.id,
          dayNumber:   day,
          exercises:   JSON.stringify([]),
        },
      })
      continue
    }

    const exercises = slots.map((s) => {
      const exerciseId = idMap.get(s.name)
      if (!exerciseId) throw new Error(`Exercise not found in DB: "${s.name}"`)
      return {
        exerciseId,
        exerciseName:    s.name,
        sets:            s.sets,
        reps:            s.reps,
        durationSeconds: s.dur,
        restSeconds:     s.rest,
        isCompleted:     false,
        completedSets:   0,
      }
    })

    await prisma.dailyWorkout.create({
      data: {
        challengeId: challenge.id,
        dayNumber:   day,
        exercises:   JSON.stringify(exercises),
      },
    })
  }

  console.log('✅  Profile created. Challenge created. 28 workouts seeded.')
  console.log('')
  console.log('   Ready. Run:  npm run dev')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
