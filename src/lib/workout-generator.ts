import type { FitnessLevel, Equipment, WorkoutExerciseSlot, WeekPhase } from '@/types'

// ── REST DAYS (1-indexed) ─────────────────────────────────────────────────────
// Sat + Sun every week (5 active days, 2 rest days per week)
// Total: 8 rest days → 20 workout days
export const REST_DAYS = new Set([6, 7, 13, 14, 20, 21, 27, 28])

// ── PHASE MAP ─────────────────────────────────────────────────────────────────
export function getPhase(day: number): { phase: WeekPhase; week: number; label: string } {
  if (day <= 7)  return { phase: 'Foundation', week: 1, label: 'WEEK 1 · FOUNDATION' }
  if (day <= 14) return { phase: 'Building',   week: 2, label: 'WEEK 2 · BUILDING'   }
  if (day <= 21) return { phase: 'Intensity',  week: 3, label: 'WEEK 3 · INTENSITY'  }
  return              { phase: 'Peak',        week: 4, label: 'WEEK 4 · PEAK'        }
}

// ── VOLUME SCALING PER PHASE ─────────────────────────────────────────────────
const VOLUME: Record<WeekPhase, { sets: number; reps: number }> = {
  Foundation: { sets: 1.0,  reps: 1.0  },
  Building:   { sets: 1.2,  reps: 1.15 },
  Intensity:  { sets: 1.4,  reps: 1.3  },
  Peak:       { sets: 1.6,  reps: 1.5  },
}

// ── WORKOUT TYPE ROTATION ─────────────────────────────────────────────────────
// Indexed by day number (1-28), rest days excluded (value doesn't matter for those)
type WorkoutType = 'push_core' | 'pull_legs' | 'full_body' | 'cardio_core' | 'strength_circuit'

const WORKOUT_TYPE: Record<number, WorkoutType> = {
  1:  'push_core',
  2:  'pull_legs',
  3:  'full_body',
  5:  'cardio_core',
  6:  'push_core',
  8:  'strength_circuit',
  9:  'pull_legs',
  10: 'full_body',
  12: 'cardio_core',
  13: 'push_core',
  14: 'strength_circuit',
  15: 'pull_legs',
  16: 'push_core',
  17: 'full_body',
  19: 'cardio_core',
  20: 'strength_circuit',
  21: 'pull_legs',
  22: 'full_body',
  23: 'push_core',
  24: 'cardio_core',
  26: 'strength_circuit',
  27: 'full_body',
  28: 'push_core', // FINAL MISSION
}

// ── EXERCISE TEMPLATES ────────────────────────────────────────────────────────
// Each entry: name (must match Exercise.name exactly), sets, reps|null, durationSeconds|null, restSeconds
interface ExTemplate {
  name: string
  sets: number
  reps: number | null
  dur: number | null   // durationSeconds
  rest: number
}

const T: Record<FitnessLevel, Record<WorkoutType, ExTemplate[]>> = {
  Recruit: {
    push_core: [
      { name: 'Push-Up',          sets: 3, reps: 10, dur: null, rest: 60 },
      { name: 'Tricep Dip (Floor)', sets: 3, reps: 10, dur: null, rest: 60 },
      { name: 'Plank',            sets: 3, reps: null, dur: 30, rest: 60 },
      { name: 'Superman Hold',    sets: 3, reps: null, dur: 20, rest: 45 },
    ],
    pull_legs: [
      { name: 'Bodyweight Squat', sets: 3, reps: 15, dur: null, rest: 60 },
      { name: 'Reverse Lunge',    sets: 3, reps: 10, dur: null, rest: 60 },
      { name: 'Glute Bridge',     sets: 3, reps: 15, dur: null, rest: 45 },
      { name: 'Superman Hold',    sets: 2, reps: null, dur: 20, rest: 45 },
    ],
    full_body: [
      { name: 'Jumping Jack',     sets: 2, reps: 30, dur: null, rest: 30 },
      { name: 'Push-Up',          sets: 2, reps: 10, dur: null, rest: 60 },
      { name: 'Bodyweight Squat', sets: 2, reps: 15, dur: null, rest: 60 },
      { name: 'Plank',            sets: 2, reps: null, dur: 30, rest: 60 },
      { name: 'Glute Bridge',     sets: 2, reps: 15, dur: null, rest: 45 },
    ],
    cardio_core: [
      { name: 'Jumping Jack',     sets: 3, reps: 40, dur: null, rest: 30 },
      { name: 'Mountain Climber', sets: 3, reps: null, dur: 30, rest: 45 },
      { name: 'Plank',            sets: 3, reps: null, dur: 30, rest: 60 },
      { name: 'Superman Hold',    sets: 2, reps: null, dur: 20, rest: 45 },
    ],
    strength_circuit: [
      { name: 'Push-Up',          sets: 4, reps: 12, dur: null, rest: 45 },
      { name: 'Bodyweight Squat', sets: 4, reps: 20, dur: null, rest: 45 },
      { name: 'Glute Bridge',     sets: 3, reps: 15, dur: null, rest: 45 },
      { name: 'Plank',            sets: 3, reps: null, dur: 40, rest: 60 },
    ],
  },

  Soldier: {
    push_core: [
      { name: 'Push-Up',     sets: 4, reps: 15, dur: null, rest: 60 },
      { name: 'Pike Push-Up',sets: 3, reps: 10, dur: null, rest: 60 },
      { name: 'Dip',         sets: 3, reps: 10, dur: null, rest: 60 },
      { name: 'Hollow Body Hold', sets: 3, reps: null, dur: 30, rest: 60 },
      { name: 'Plank',       sets: 2, reps: null, dur: 45, rest: 45 },
    ],
    pull_legs: [
      { name: 'Pull-Up',     sets: 4, reps: 8,  dur: null, rest: 90 },
      { name: 'Inverted Row',sets: 3, reps: 12, dur: null, rest: 60 },
      { name: 'Jump Squat',  sets: 3, reps: 12, dur: null, rest: 60 },
      { name: 'Reverse Lunge', sets: 3, reps: 12, dur: null, rest: 60 },
      { name: 'Hanging Knee Raise', sets: 3, reps: 12, dur: null, rest: 60 },
    ],
    full_body: [
      { name: 'Burpee',      sets: 3, reps: 10, dur: null, rest: 90 },
      { name: 'Push-Up',     sets: 3, reps: 15, dur: null, rest: 60 },
      { name: 'Pull-Up',     sets: 3, reps: 8,  dur: null, rest: 90 },
      { name: 'Jump Squat',  sets: 3, reps: 12, dur: null, rest: 60 },
      { name: 'Hollow Body Hold', sets: 2, reps: null, dur: 30, rest: 60 },
    ],
    cardio_core: [
      { name: 'Burpee',      sets: 4, reps: 10, dur: null, rest: 60 },
      { name: 'Mountain Climber', sets: 3, reps: null, dur: 45, rest: 45 },
      { name: 'Hollow Body Hold', sets: 3, reps: null, dur: 30, rest: 60 },
      { name: 'Hanging Knee Raise', sets: 3, reps: 15, dur: null, rest: 60 },
    ],
    strength_circuit: [
      { name: 'Pull-Up',     sets: 5, reps: 8,  dur: null, rest: 90 },
      { name: 'Dip',         sets: 4, reps: 12, dur: null, rest: 90 },
      { name: 'Burpee',      sets: 3, reps: 10, dur: null, rest: 60 },
      { name: 'Hollow Body Hold', sets: 3, reps: null, dur: 45, rest: 60 },
      { name: 'Jump Squat',  sets: 3, reps: 15, dur: null, rest: 60 },
    ],
  },

  Operator: {
    push_core: [
      { name: 'Archer Push-Up',   sets: 4, reps: 8,  dur: null, rest: 90 },
      { name: 'Plyometric Push-Up', sets: 3, reps: 10, dur: null, rest: 90 },
      { name: 'Handstand Hold',   sets: 3, reps: null, dur: 30, rest: 90 },
      { name: 'Dragon Flag Negative', sets: 3, reps: 5, dur: null, rest: 90 },
      { name: 'L-Sit',            sets: 3, reps: null, dur: 20, rest: 60 },
    ],
    pull_legs: [
      { name: 'Muscle-Up',        sets: 4, reps: 5,  dur: null, rest: 120 },
      { name: 'Pistol Squat',     sets: 3, reps: 6,  dur: null, rest: 90  },
      { name: 'Hanging Knee Raise', sets: 4, reps: 15, dur: null, rest: 60 },
      { name: 'L-Sit',            sets: 3, reps: null, dur: 20, rest: 60 },
      { name: 'Pull-Up',          sets: 4, reps: 12, dur: null, rest: 90 },
    ],
    full_body: [
      { name: 'Burpee',           sets: 5, reps: 15, dur: null, rest: 60 },
      { name: 'Muscle-Up',        sets: 3, reps: 5,  dur: null, rest: 120 },
      { name: 'Pistol Squat',     sets: 3, reps: 8,  dur: null, rest: 90 },
      { name: 'Dragon Flag Negative', sets: 3, reps: 5, dur: null, rest: 90 },
      { name: 'Plyometric Push-Up', sets: 3, reps: 12, dur: null, rest: 60 },
    ],
    cardio_core: [
      { name: 'Burpee',           sets: 5, reps: 15, dur: null, rest: 45 },
      { name: 'Mountain Climber', sets: 4, reps: null, dur: 60, rest: 45 },
      { name: 'L-Sit',            sets: 4, reps: null, dur: 30, rest: 60 },
      { name: 'Dragon Flag Negative', sets: 3, reps: 6, dur: null, rest: 90 },
    ],
    strength_circuit: [
      { name: 'Muscle-Up',        sets: 5, reps: 6,  dur: null, rest: 120 },
      { name: 'Pistol Squat',     sets: 4, reps: 8,  dur: null, rest: 90 },
      { name: 'Archer Push-Up',   sets: 4, reps: 10, dur: null, rest: 90 },
      { name: 'Handstand Hold',   sets: 3, reps: null, dur: 45, rest: 90 },
      { name: 'L-Sit',            sets: 3, reps: null, dur: 30, rest: 60 },
    ],
  },
}

// ── EQUIPMENT SUBSTITUTIONS ───────────────────────────────────────────────────
// When the user lacks a required piece of equipment, swap the exercise.
const SUBS: Record<string, string> = {
  'Pull-Up':           'Inverted Row',
  'Muscle-Up':         'Burpee',
  'Dip':               'Tricep Dip (Floor)',
  'Hanging Knee Raise':'Hollow Body Hold',
  'L-Sit':             'Hollow Body Hold',
  'Inverted Row':      'Plank', // last-resort fallback
}

// Exercise → required equipment (empty means bodyweight only)
const EXERCISE_EQUIPMENT: Record<string, Equipment[]> = {
  'Pull-Up':           ['pull_up_bar'],
  'Muscle-Up':         ['pull_up_bar'],
  'Dip':               ['dip_bars'],
  'Hanging Knee Raise':['pull_up_bar'],
  'L-Sit':             ['dip_bars'],
  'Inverted Row':      ['pull_up_bar'],
}

function needsEquipment(name: string, available: Equipment[]): boolean {
  const required = EXERCISE_EQUIPMENT[name]
  if (!required || required.length === 0) return false
  return !required.some((eq) => available.includes(eq))
}

function resolve(name: string, available: Equipment[]): string {
  let current = name
  const visited = new Set<string>()
  while (needsEquipment(current, available)) {
    if (visited.has(current)) break
    visited.add(current)
    current = SUBS[current] ?? current
  }
  return current
}

// ── MAIN GENERATOR ────────────────────────────────────────────────────────────
export function generateWorkoutForDay(
  day: number,
  fitnessLevel: FitnessLevel,
  equipment: Equipment[],
  exerciseIdMap: Map<string, string>,  // name → DB id
): { exercises: WorkoutExerciseSlot[] } | { isRestDay: true } {
  if (REST_DAYS.has(day)) return { isRestDay: true }

  const { phase } = getPhase(day)
  const scale = VOLUME[phase]
  const workoutType = WORKOUT_TYPE[day] ?? 'full_body'
  const template = T[fitnessLevel][workoutType]

  // Effective equipment list: always include 'none'
  const avail: Equipment[] = equipment.includes('none') ? equipment : ['none', ...equipment]

  const slots: WorkoutExerciseSlot[] = template.map((ex) => {
    const resolvedName = resolve(ex.name, avail)
    const id = exerciseIdMap.get(resolvedName) ?? exerciseIdMap.get(ex.name) ?? ''

    const sets = Math.max(1, Math.round(ex.sets * scale.sets))
    const reps = ex.reps !== null ? Math.max(1, Math.round(ex.reps * scale.reps)) : null
    const dur  = ex.dur  !== null ? Math.max(10, Math.round(ex.dur * scale.reps)) : null

    return {
      exerciseId:   id,
      exerciseName: resolvedName,
      sets,
      reps,
      durationSeconds: dur,
      restSeconds: ex.rest,
      isCompleted: false,
      completedSets: 0,
    }
  })

  // Day 28 final mission: extra two sets and +5 reps on everything
  if (day === 28) {
    return {
      exercises: slots.map((s) => ({
        ...s,
        sets: s.sets + 2,
        reps: s.reps !== null ? s.reps + 5 : null,
      })),
    }
  }

  return { exercises: slots }
}

// ── REST DAY RECOVERY SUGGESTIONS ─────────────────────────────────────────────
export const REST_DAY_ACTIVITIES = [
  { title: 'Mobility Flow', duration: '20 min', description: 'Hip flexors, thoracic spine, and shoulder circles. Move slow, breathe deep.' },
  { title: 'Cold Shower Protocol', duration: '5 min', description: 'Finish with 90 seconds cold. Reduces inflammation. No excuses.' },
  { title: 'Recovery Walk', duration: '30 min', description: 'Steady pace, no rush. Active blood flow without taxing the muscles.' },
  { title: 'Foam Roll + Stretch', duration: '15 min', description: 'Focus on whatever ached most during the last workout. Work it out.' },
  { title: 'Breathing Drill', duration: '10 min', description: 'Box breathing: 4 in, 4 hold, 4 out, 4 hold. Repeat 20 rounds. Control your mind.' },
]
