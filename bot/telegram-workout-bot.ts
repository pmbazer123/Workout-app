import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

type WorkoutPlan = {
  totalDays: number
  days: WorkoutDay[]
}

type WorkoutDay = {
  dayNumber: number
  phase: string
  focus: string
  isRestDay: boolean
  notes?: string[]
  activities: { title: string; duration: string; description: string }[]
  exercises: {
    name: string
    sets: number
    reps: number | null
    durationSeconds: number | null
    restSeconds: number
    workLabel?: string | null
  }[]
}

type BotState = {
  version: number
  startDate: string
  currentDay: number
  dayQueue?: number[]
  manualRestDates?: string[]
  completedWorkoutDays: number[]
  skippedWorkoutDays?: number[]
  resolutionHistory?: ResolutionEvent[]
  undoState?: UndoState | null
  lastCompletedAt: string | null
  chatId: string | null
  reminder: {
    enabled: boolean
    time: string
    timeZone: string
    skipShabbat: boolean
    lastSentOn: string | null
  }
}

type ResolutionEvent = {
  dayNumber: number
  status: 'done' | 'skipped'
  resolvedAt: string
}

type UndoState = {
  action: 'done' | 'skip' | 'rest'
  dayNumber: number
  currentDay: number
  dayQueue: number[]
  manualRestDates: string[]
  completedWorkoutDays: number[]
  skippedWorkoutDays: number[]
  resolutionHistory: ResolutionEvent[]
  lastCompletedAt: string | null
}

type TelegramUpdate = {
  update_id: number
  message?: {
    message_id: number
    text?: string
    chat: { id: number | string; type: string }
  }
  callback_query?: {
    id: string
    data?: string
    message?: {
      message_id: number
      chat: { id: number | string; type: string }
    }
  }
}

type ParsedCommand = {
  name: 'start' | 'help' | 'today' | 'next' | 'done' | 'status' | 'swap' | 'move' | 'skip' | 'undo' | 'rest' | 'explain' | 'restart'
  args: string[]
}

type ReplyTarget = {
  messageId?: number
}

type ReplyOptions = {
  keyboard?: boolean
  replyMarkup?: {
    inline_keyboard: Array<Array<{ text: string; callback_data: string }>>
  }
}

type ExerciseGuide = {
  summary: string
  cues: string[]
  note?: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const STATE_PATH = path.join(ROOT, 'bot-data', 'telegram-workout-state.json')
const PLAN_PATH = path.join(ROOT, 'bot', 'workout-plan.json')
const ENV_PATH = path.join(ROOT, '.env')

loadEnvFile(ENV_PATH)

const BOT_TOKEN = requiredEnv('TELEGRAM_BOT_TOKEN')
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`
const ALLOWED_CHAT_ID = process.env.TELEGRAM_ALLOWED_CHAT_ID ?? null
const DEFAULT_TIME = process.env.TELEGRAM_REMINDER_TIME ?? '05:30'
const DEFAULT_TIMEZONE = process.env.WORKOUT_TIMEZONE ?? 'Asia/Jerusalem'
const DEFAULT_SKIP_SHABBAT = (process.env.TELEGRAM_SKIP_SHABBAT ?? 'true').toLowerCase() !== 'false'
const DEFAULT_START_DATE = process.env.WORKOUT_START_DATE ?? currentDateInZone(DEFAULT_TIMEZONE)

const plan = JSON.parse(fs.readFileSync(PLAN_PATH, 'utf8')) as WorkoutPlan

const MOTIVATION = {
  reminder: [
    'Mission on the board. Consistency beats motivation.',
    'Small wins stack. Today is one more brick in the wall.',
    'No drama, just execution. Finish the day.',
    'You do not need a perfect workout, you need a completed one.',
    'Show up first. Energy usually follows action.',
  ],
  workout: [
    'One session at a time. That is how campaigns are won.',
    'Do the reps in front of you. Ignore the rest of the mountain.',
    'Discipline is lighter than regret.',
    'Your only job is to finish today\'s mission.',
    'Consistency is the actual flex here.',
  ],
  done: [
    'Marked complete. Good work.',
    'Mission logged. Keep the chain alive.',
    'Nice. One more day secured.',
    'Progress saved. Forward.',
    'That is how momentum is built.',
  ],
  status: [
    'Steady beats intense and inconsistent.',
    'The scoreboard matters less than today\'s execution.',
    'Keep moving. That is the whole game.',
  ],
}

// Only filter exercises that require a genuinely optional piece of kit (the backpack).
// Chairs, sofas, and floors are always available — decline push-ups, feet-elevated
// push-ups, and Bulgarian split squats do not need to be hidden.
const EQUIPMENT_DEPENDENT_EXERCISE_PATTERNS = [
  /backpack/i,
]

const EXERCISE_GUIDES: Record<string, ExerciseGuide> = {
  'push up': {
    summary: 'Classic bodyweight press for chest, shoulders, triceps, and core.',
    cues: [
      'Hands about shoulder-width, body in one straight line',
      'Lower until chest nearly touches the floor',
      'Keep elbows about 45° from your torso, then press back up',
    ],
  },
  'feet elevated push up': {
    summary: 'A harder push-up with your feet on a chair or step, shifting more load to shoulders and upper chest.',
    cues: [
      'Put feet on a stable surface and hands on the floor',
      'Keep hips from sagging or piking',
      'Lower under control, then press to full lockout',
    ],
  },
  'decline push up': {
    summary: 'Push-up with feet elevated, similar to a lighter overhead-ish press challenge.',
    cues: [
      'Feet elevated, hands planted under shoulders',
      'Stay rigid from shoulders through ankles',
      'Control the descent and finish each rep fully',
    ],
  },
  'pike push up': {
    summary: 'A shoulder-focused push-up done in an inverted V position.',
    cues: [
      'Lift hips high so your body looks like an upside-down V',
      'Lower the crown of your head toward the floor between your hands',
      'Press back up without letting the hips collapse',
    ],
  },
  'bulgarian split squat': {
    summary: 'Single-leg squat with the back foot elevated. Great for legs, balance, and glutes.',
    cues: [
      'Rear foot on a chair or step, front foot far enough forward',
      'Lower straight down, back knee toward the floor',
      'Drive through the front heel to stand, then finish all reps before switching legs',
    ],
    note: 'The armor vest is a good optional load here if it feels stable.',
  },
  'split squat': {
    summary: 'A split-stance squat without the rear foot elevated.',
    cues: [
      'Take a long split stance and stay upright',
      'Lower straight down until the back knee nearly touches the floor',
      'Drive through the front heel to return to standing',
    ],
    note: 'The armor vest is a good optional load here if it feels stable.',
  },
  'reverse lunge': {
    summary: 'Step one leg back into a lunge, then return to standing. Easier on the knees than forward lunges for many people.',
    cues: [
      'Step straight back, not diagonally',
      'Keep the front foot flat and front knee controlled',
      'Push through the front heel to come back up',
    ],
    note: 'Optional armor vest works here too if it feels controlled.',
  },
  'standing calf raise': {
    summary: 'Simple calf strength work done by rising onto the balls of your feet.',
    cues: [
      'Stand tall and hold a wall or chair lightly if needed',
      'Rise as high as you can onto the balls of the feet',
      'Lower slowly instead of dropping',
    ],
  },
  'single leg calf raise': {
    summary: 'A harder calf raise done one leg at a time.',
    cues: [
      'Stand on one foot and use light support for balance if needed',
      'Rise high onto the ball of the foot',
      'Lower slowly and keep the ankle controlled',
    ],
  },
  'dead bug': {
    summary: 'Core stability drill done on your back. Great for teaching abs to brace while your limbs move.',
    cues: [
      'Lie on your back with lower back gently pressed into the floor',
      'Move opposite arm and leg away slowly',
      'Only go as far as you can without the lower back lifting',
    ],
  },
  'hollow body hold': {
    summary: 'A full-core tension hold on your back. Very good for abs and body control.',
    cues: [
      'Press lower back into the floor first',
      'Lift shoulders slightly and extend legs out to a manageable height',
      'If your lower back pops up, raise the legs higher or shorten the hold',
    ],
  },
  'plank shoulder tap': {
    summary: 'High-plank position where you tap one shoulder at a time without twisting the torso.',
    cues: [
      'Start in a strong push-up plank',
      'Tap one shoulder with the opposite hand',
      'Keep hips as still as possible and move slowly enough to control rotation',
    ],
  },
  'hamstring walkout': {
    summary: 'Posterior-chain drill done from a glute bridge, slowly walking the feet out and back.',
    cues: [
      'Start in a glute bridge with hips lifted',
      'Walk the feet out a little at a time while keeping hips up',
      'Walk them back in under control without letting the hips crash down',
    ],
  },
  'reverse crunch': {
    summary: 'Lower-ab focused movement where you curl the pelvis up from the floor.',
    cues: [
      'Lie on your back with knees bent',
      'Bring knees toward chest and curl the hips slightly off the floor',
      'Lower slowly instead of swinging the legs',
    ],
  },
  'backpack bent over row': {
    summary: 'Home pulling substitute. You hinge forward and row a loaded backpack toward your torso.',
    cues: [
      'Load the backpack with books or bottles so it feels challenging',
      'Hinge at the hips with a flat back and soft knees',
      'Pull elbows back toward your hips, squeeze the upper back, then lower under control',
    ],
  },
  'one arm backpack row': {
    summary: 'Single-arm row with a backpack, one side at a time. Great no-bar pulling substitute.',
    cues: [
      'Brace one hand on a chair, bench, or thigh',
      'Keep your back flat and chest open',
      'Row the backpack toward your hip, not your shoulder',
    ],
  },
  'easy run': {
    summary: 'A conversational pace run. You should be able to speak in full sentences.',
    cues: [
      'Keep the pace easy enough to breathe calmly',
      'Relax the shoulders and let arms swing naturally',
      'This is not a speed test, it is aerobic base work',
    ],
  },
  'steady run': {
    summary: 'A moderate run, harder than easy but still controlled.',
    cues: [
      'Run at a pace you can sustain steadily from start to finish',
      'You can talk a little, but you would rather not talk much',
      'Stay smooth instead of turning it into a race',
    ],
  },
  'tempo run': {
    summary: 'A comfortably hard run where you are working, but not sprinting.',
    cues: [
      'Keep the effort steady, not spiky',
      'You should only manage a few words at a time',
      'Do not blast the first minutes and fade',
    ],
  },
  'running intervals': {
    summary: 'Alternating harder running efforts with easier recovery periods.',
    cues: [
      'Push the hard intervals, but stay below all-out sprinting',
      'Use the recovery minute to truly slow down',
      'Treat each interval like a repeatable quality effort, not chaos',
    ],
  },
  'mobility warm up': {
    summary: 'A short movement prep block to loosen hips, shoulders, ankles, and spine before training.',
    cues: [
      'Move through ranges of motion smoothly, not aggressively',
      'Focus on the joints you will use in the workout',
      'The goal is to feel more ready, not tired',
    ],
  },
  'side plank': {
    summary: 'An oblique and lateral core hold done on one forearm and the side of one foot.',
    cues: [
      'Stack shoulder over elbow',
      'Lift hips so body forms a straight line',
      'Keep the neck relaxed and do not let the hips sag',
    ],
  },
  'mountain climber': {
    summary: 'Fast alternating knee drives from a plank position. It trains core control and conditioning.',
    cues: [
      'Start in a strong push-up plank',
      'Drive one knee in while keeping hips mostly level',
      'Go only as fast as you can stay tight and controlled',
    ],
  },
}

async function main() {
  const state = loadState()
  syncPlanToCalendar(state)
  saveState(state)

  void startReminderLoop()
  await startPollingLoop()
}

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env: ${name}`)
  return value
}

function loadState(): BotState {
  if (!fs.existsSync(STATE_PATH)) {
    const initial = createInitialState()
    ensureParentDir(STATE_PATH)
    fs.writeFileSync(STATE_PATH, JSON.stringify(initial, null, 2))
    return initial
  }
  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')) as BotState
  normalizeState(state)
  return state
}

function saveState(state: BotState) {
  normalizeState(state)
  ensureParentDir(STATE_PATH)
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))
}

function ensureParentDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function createInitialState(): BotState {
  return {
    version: 5,
    startDate: DEFAULT_START_DATE,
    currentDay: 1,
    dayQueue: buildDefaultDayQueue(1),
    manualRestDates: [],
    completedWorkoutDays: [],
    skippedWorkoutDays: [],
    resolutionHistory: [],
    undoState: null,
    lastCompletedAt: null,
    chatId: ALLOWED_CHAT_ID,
    reminder: {
      enabled: true,
      time: DEFAULT_TIME,
      timeZone: DEFAULT_TIMEZONE,
      skipShabbat: DEFAULT_SKIP_SHABBAT,
      lastSentOn: null,
    },
  }
}

function buildDefaultDayQueue(startDayNumber: number) {
  if (startDayNumber > plan.totalDays) return []
  const safeStart = Math.max(1, startDayNumber)
  return Array.from({ length: plan.totalDays - safeStart + 1 }, (_, index) => safeStart + index)
}

function normalizeState(state: BotState) {
  state.version = 5

  if (!Array.isArray(state.manualRestDates)) {
    state.manualRestDates = []
  }
  state.manualRestDates = [...new Set(state.manualRestDates)]
    .filter((value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))
    .sort()

  if (!Array.isArray(state.completedWorkoutDays)) {
    state.completedWorkoutDays = []
  }
  state.completedWorkoutDays = [...new Set(state.completedWorkoutDays)]
    .filter((dayNumber) => Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= plan.totalDays)
    .sort((a, b) => a - b)

  if (!Array.isArray(state.skippedWorkoutDays)) {
    state.skippedWorkoutDays = []
  }
  state.skippedWorkoutDays = [...new Set(state.skippedWorkoutDays)]
    .filter((dayNumber) => Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= plan.totalDays)
    .sort((a, b) => a - b)

  if (!Array.isArray(state.resolutionHistory)) {
    state.resolutionHistory = synthesizeResolutionHistory(state.completedWorkoutDays, state.skippedWorkoutDays)
  } else {
    state.resolutionHistory = state.resolutionHistory
      .filter((entry) => Number.isInteger(entry?.dayNumber) && entry.dayNumber >= 1 && entry.dayNumber <= plan.totalDays)
      .filter((entry) => entry?.status === 'done' || entry?.status === 'skipped')
      .map((entry) => ({
        dayNumber: entry.dayNumber,
        status: entry.status,
        resolvedAt: typeof entry.resolvedAt === 'string' && entry.resolvedAt ? entry.resolvedAt : new Date(0).toISOString(),
      }))
  }

  if (!state.undoState || typeof state.undoState !== 'object') {
    state.undoState = null
  } else {
    state.undoState = normalizeUndoState(state.undoState)
  }

  if (!Array.isArray(state.dayQueue)) {
    const startDay = Number.isInteger(state.currentDay) ? state.currentDay : 1
    state.dayQueue = buildDefaultDayQueue(startDay)
  } else {
    state.dayQueue = [...new Set(state.dayQueue)]
      .filter((dayNumber) => Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= plan.totalDays)
  }

  state.currentDay = state.dayQueue[0] ?? plan.totalDays + 1
}

function normalizeUndoState(undoState: UndoState) {
  if (!undoState || !['done', 'skip', 'rest'].includes(undoState.action)) return null

  return {
    action: undoState.action,
    dayNumber: Number.isInteger(undoState.dayNumber) ? undoState.dayNumber : 1,
    currentDay: Number.isInteger(undoState.currentDay) ? undoState.currentDay : 1,
    dayQueue: Array.isArray(undoState.dayQueue)
      ? undoState.dayQueue.filter((dayNumber) => Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= plan.totalDays)
      : [],
    manualRestDates: Array.isArray(undoState.manualRestDates)
      ? undoState.manualRestDates.filter((value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)).sort()
      : [],
    completedWorkoutDays: Array.isArray(undoState.completedWorkoutDays)
      ? undoState.completedWorkoutDays.filter((dayNumber) => Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= plan.totalDays)
      : [],
    skippedWorkoutDays: Array.isArray(undoState.skippedWorkoutDays)
      ? undoState.skippedWorkoutDays.filter((dayNumber) => Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= plan.totalDays)
      : [],
    resolutionHistory: Array.isArray(undoState.resolutionHistory)
      ? undoState.resolutionHistory
        .filter((entry) => Number.isInteger(entry?.dayNumber) && entry.dayNumber >= 1 && entry.dayNumber <= plan.totalDays)
        .filter((entry) => entry?.status === 'done' || entry?.status === 'skipped')
        .map((entry) => ({
          dayNumber: entry.dayNumber,
          status: entry.status,
          resolvedAt: typeof entry.resolvedAt === 'string' && entry.resolvedAt ? entry.resolvedAt : new Date(0).toISOString(),
        }))
      : [],
    lastCompletedAt: typeof undoState.lastCompletedAt === 'string' || undoState.lastCompletedAt === null
      ? undoState.lastCompletedAt
      : null,
  }
}

function synthesizeResolutionHistory(completedWorkoutDays: number[], skippedWorkoutDays: number[]) {
  const entries: ResolutionEvent[] = []
  for (const dayNumber of completedWorkoutDays) {
    entries.push({ dayNumber, status: 'done', resolvedAt: new Date(0).toISOString() })
  }
  for (const dayNumber of skippedWorkoutDays) {
    entries.push({ dayNumber, status: 'skipped', resolvedAt: new Date(0).toISOString() })
  }
  return entries.sort((a, b) => a.dayNumber - b.dayNumber)
}

function getDayQueue(state: BotState) {
  normalizeState(state)
  return state.dayQueue!
}

function getCurrentDayNumber(state: BotState) {
  normalizeState(state)
  return state.currentDay
}

function advanceCurrentDay(state: BotState) {
  const queue = getDayQueue(state)
  if (queue.length > 0) queue.shift()
  normalizeState(state)
}

function isEquipmentFreeExercise(exercise: WorkoutDay['exercises'][number]) {
  return !EQUIPMENT_DEPENDENT_EXERCISE_PATTERNS.some((pattern) => pattern.test(exercise.name))
}

function getDisplayExercises(day: WorkoutDay) {
  return day.exercises.filter(isEquipmentFreeExercise)
}

function completedStageCount(state: BotState) {
  return plan.totalDays - getDayQueue(state).length
}

function totalWorkoutDays() {
  return plan.days.filter((item) => !item.isRestDay).length
}

function resolvedWorkoutCount(state: BotState) {
  return state.completedWorkoutDays.length + (state.skippedWorkoutDays?.length ?? 0)
}

function recordResolution(state: BotState, dayNumber: number, status: 'done' | 'skipped') {
  if (status === 'done') {
    if (!state.completedWorkoutDays.includes(dayNumber)) state.completedWorkoutDays.push(dayNumber)
    state.completedWorkoutDays.sort((a, b) => a - b)
    state.skippedWorkoutDays = (state.skippedWorkoutDays ?? []).filter((item) => item !== dayNumber)
  } else {
    if (!state.skippedWorkoutDays?.includes(dayNumber)) {
      state.skippedWorkoutDays = [...(state.skippedWorkoutDays ?? []), dayNumber].sort((a, b) => a - b)
    }
    state.completedWorkoutDays = state.completedWorkoutDays.filter((item) => item !== dayNumber)
  }

  state.resolutionHistory = (state.resolutionHistory ?? []).filter((entry) => entry.dayNumber !== dayNumber)
  state.resolutionHistory.push({
    dayNumber,
    status,
    resolvedAt: new Date().toISOString(),
  })
}

function captureUndoState(state: BotState, action: 'done' | 'skip', dayNumber: number) {
  state.undoState = {
    action,
    dayNumber,
    currentDay: state.currentDay,
    dayQueue: [...getDayQueue(state)],
    manualRestDates: [...(state.manualRestDates ?? [])],
    completedWorkoutDays: [...state.completedWorkoutDays],
    skippedWorkoutDays: [...(state.skippedWorkoutDays ?? [])],
    resolutionHistory: (state.resolutionHistory ?? []).map((entry) => ({ ...entry })),
    lastCompletedAt: state.lastCompletedAt,
  }
}

function captureRestUndoState(state: BotState, dayNumber: number) {
  state.undoState = {
    action: 'rest',
    dayNumber,
    currentDay: state.currentDay,
    dayQueue: [...getDayQueue(state)],
    manualRestDates: [...(state.manualRestDates ?? [])],
    completedWorkoutDays: [...state.completedWorkoutDays],
    skippedWorkoutDays: [...(state.skippedWorkoutDays ?? [])],
    resolutionHistory: (state.resolutionHistory ?? []).map((entry) => ({ ...entry })),
    lastCompletedAt: state.lastCompletedAt,
  }
}

function undoLastResolution(state: BotState) {
  const undoState = state.undoState
  if (!undoState) {
    return { ok: false as const, reason: 'nothing_to_undo' }
  }

  state.currentDay = undoState.currentDay
  state.dayQueue = [...undoState.dayQueue]
  state.manualRestDates = [...undoState.manualRestDates]
  state.completedWorkoutDays = [...undoState.completedWorkoutDays]
  state.skippedWorkoutDays = [...undoState.skippedWorkoutDays]
  state.resolutionHistory = undoState.resolutionHistory.map((entry) => ({ ...entry }))
  state.lastCompletedAt = undoState.lastCompletedAt
  state.undoState = null
  normalizeState(state)

  return {
    ok: true as const,
    action: undoState.action,
    dayNumber: undoState.dayNumber,
  }
}

function calculateStreaks(state: BotState) {
  const history = (state.resolutionHistory ?? []).filter((entry) => {
    const day = getDay(entry.dayNumber)
    return day && !day.isRestDay
  })

  let currentStreak = 0
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index].status !== 'done') break
    currentStreak += 1
  }

  let longestStreak = 0
  let running = 0
  for (const entry of history) {
    if (entry.status === 'done') {
      running += 1
      longestStreak = Math.max(longestStreak, running)
    } else {
      running = 0
    }
  }

  return { currentStreak, longestStreak }
}

function formatDayList(dayNumbers: number[]) {
  if (!dayNumbers.length) return '—'
  return dayNumbers.map((dayNumber) => `Day ${dayNumber}`).join(', ')
}

function getWorkoutKind(day: WorkoutDay | null) {
  if (!day) return 'unknown' as const
  if (day.isRestDay) return 'rest' as const
  const focus = day.focus.toLowerCase()
  if (focus.includes('run') || focus.includes('interval')) return 'run' as const
  return 'strength' as const
}

function getWorkoutKindIcon(day: WorkoutDay | null, variant: 'current' | 'pending' | 'label' = 'label') {
  const kind = getWorkoutKind(day)
  if (kind === 'rest') return variant === 'current' ? '🌙' : '😴'
  if (kind === 'run') {
    if (variant === 'current') return '🏃'
    if (variant === 'pending') return '⬜'
    return '🏃'
  }
  if (kind === 'strength') {
    if (variant === 'current') return '💪'
    if (variant === 'pending') return '⬜'
    return '🏋️'
  }
  return '⬜'
}

function buildProgressBar(completed: number, skipped: number, total: number, size = 10) {
  if (total <= 0) return '░'.repeat(size)
  const doneUnits = Math.round((completed / total) * size)
  const skippedUnits = Math.round((skipped / total) * size)
  const safeDoneUnits = Math.min(size, doneUnits)
  const safeSkippedUnits = Math.min(size - safeDoneUnits, skippedUnits)
  const remainingUnits = Math.max(0, size - safeDoneUnits - safeSkippedUnits)
  return `${'🟩'.repeat(safeDoneUnits)}${'🟨'.repeat(safeSkippedUnits)}${'⬜'.repeat(remainingUnits)}`
}

function formatProgressBoard(state: BotState) {
  const lines: string[] = []
  const manualRestToday = isManualRestToday(state)
  for (let weekStart = 1; weekStart <= plan.totalDays; weekStart += 7) {
    const symbols: string[] = []
    for (let dayNumber = weekStart; dayNumber < weekStart + 7 && dayNumber <= plan.totalDays; dayNumber += 1) {
      const day = getDay(dayNumber)
      if (!day) continue

      let symbol = '⬜'
      if (state.completedWorkoutDays.includes(dayNumber)) {
        symbol = '✅'
      } else if ((state.skippedWorkoutDays ?? []).includes(dayNumber)) {
        symbol = '⏭️'
      } else if (day.isRestDay) {
        symbol = getCurrentDayNumber(state) === dayNumber ? '🌙' : '😴'
      } else if (getCurrentDayNumber(state) === dayNumber) {
        symbol = manualRestToday ? '🛌' : getWorkoutKindIcon(day, 'current')
      } else {
        symbol = getWorkoutKindIcon(day, 'pending')
      }

      symbols.push(symbol)
    }
    lines.push(`Week ${Math.ceil(weekStart / 7)}: ${symbols.join(' ')}`)
  }
  return lines.join('\n')
}

function getDay(dayNumber: number) {
  return plan.days.find((day) => day.dayNumber === dayNumber) ?? null
}

function currentScheduledDate(state: BotState, dayNumber = getCurrentDayNumber(state)) {
  const queue = getDayQueue(state)
  const queueIndex = queue.indexOf(dayNumber)
  if (queueIndex === -1) {
    return addDays(state.startDate, Math.max(0, dayNumber - 1))
  }
  return addDays(state.startDate, completedStageCount(state) + queueIndex + (state.manualRestDates?.length ?? 0))
}

function isManualRestToday(state: BotState, today = currentDateInZone(state.reminder.timeZone)) {
  const currentDay = getDay(getCurrentDayNumber(state))
  if (!currentDay || currentDay.isRestDay) return false
  return (state.manualRestDates ?? []).includes(today)
}

function addManualRestDay(state: BotState, isoDate: string) {
  state.manualRestDates = [...new Set([...(state.manualRestDates ?? []), isoDate])].sort()
}

function syncPlanToCalendar(state: BotState, today = currentDateInZone(state.reminder.timeZone)) {
  while (getCurrentDayNumber(state) <= plan.totalDays) {
    const day = getDay(getCurrentDayNumber(state))
    if (!day) break
    const scheduledDate = currentScheduledDate(state)
    if (scheduledDate >= today) break

    if (day.isRestDay) {
      advanceCurrentDay(state)
      continue
    }

    recordResolution(state, day.dayNumber, 'skipped')
    advanceCurrentDay(state)
    state.undoState = null
  }
}

function swapCurrentDayWithTomorrow(state: BotState) {
  const queue = getDayQueue(state)
  if (queue.length < 2) {
    return { ok: false as const, reason: 'no_next_day' }
  }

  const todayDayNumber = queue[0]
  const tomorrowDayNumber = queue[1]
  const today = getDay(todayDayNumber)
  const tomorrow = getDay(tomorrowDayNumber)

  if (!today || !tomorrow) {
    return { ok: false as const, reason: 'missing_day' }
  }

  ;[queue[0], queue[1]] = [queue[1], queue[0]]
  normalizeState(state)

  return {
    ok: true as const,
    oldToday: today,
    newToday: tomorrow,
    newTomorrow: today,
  }
}

function addDays(isoDate: string, days: number) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

function currentDateInZone(timeZone: string) {
  return formatNowInZone(timeZone).date
}

function formatNowInZone(timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short',
  }).formatToParts(new Date())

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value])) as Record<string, string>
  return {
    date: `${map.year}-${map.month}-${map.day}`,
    time: `${map.hour}:${map.minute}`,
    weekday: map.weekday,
  }
}

function pickPhrase(kind: keyof typeof MOTIVATION, seed: number) {
  const arr = MOTIVATION[kind]
  return arr[Math.abs(seed) % arr.length]
}

function formatDuration(seconds: number | null) {
  if (seconds == null) return null
  if (seconds % 60 === 0) {
    const minutes = seconds / 60
    return `${minutes} min`
  }
  return `${seconds} sec`
}

function formatWorkoutMessage(state: BotState, dayNumber = getCurrentDayNumber(state), intro?: string) {
  const day = getDay(dayNumber)
  if (!day) {
    return [
      '🏁 28-day challenge complete.',
      '',
      'You finished the plan. If you want, we can start a new cycle or build phase 2.',
    ].join('\n')
  }

  if (isManualRestToday(state)) {
    return formatManualRestDayMessage(state, intro)
  }

  const dateLabel = currentScheduledDate(state, day.dayNumber)
  const lines: string[] = []
  if (intro) {
    lines.push(intro)
    lines.push('')
  }

  lines.push(`💪 Day ${day.dayNumber} — ${day.focus}`)
  lines.push(`${day.phase} • ${dateLabel}`)
  lines.push('')

  if (day.isRestDay) {
    lines.push('Recovery day.')
    for (const activity of day.activities) {
      lines.push(`- ${activity.title} (${activity.duration})`)
    }
    lines.push('')
    lines.push('Rest days advance automatically. No need to send done.')
    lines.push('Use the buttons below if you want status or a swap preview.')
    lines.push('')
    lines.push(`🎯 ${pickPhrase('reminder', day.dayNumber)}`)
    return lines.join('\n')
  }

  if (day.notes?.length) {
    for (const note of day.notes) {
      lines.push(`- ${note}`)
    }
    lines.push('')
  }

  // When all exercises need a backpack, show them all rather than leaving the
  // user with an empty or near-empty workout. Add a clear note about the equipment.
  const filteredExercises = getDisplayExercises(day)
  const displayExercises = filteredExercises.length > 0 ? filteredExercises : day.exercises
  const isShowingAll = filteredExercises.length === 0 && day.exercises.length > 0

  lines.push('Today\'s workout:')
  for (const exercise of displayExercises) {
    const work = exercise.workLabel
      ? exercise.workLabel
      : exercise.reps != null
        ? `${exercise.sets} × ${exercise.reps}`
        : `${exercise.sets} × ${formatDuration(exercise.durationSeconds)}`
    const rest = exercise.restSeconds > 0 ? `, rest ${exercise.restSeconds} sec` : ''
    lines.push(`- ${exercise.name}: ${work}${rest}`)
  }
  if (isShowingAll) {
    lines.push('')
    lines.push('Note: This session uses a loaded backpack. All exercises are shown.')
  } else if (filteredExercises.length !== day.exercises.length) {
    lines.push('')
    lines.push('Note: I am only showing the equipment-free exercises for today.')
  }
  lines.push('')
  lines.push('Use the buttons below or reply with: done, rest, skip, undo, status, swap, explain')
  lines.push('')
  lines.push(`🎯 ${pickPhrase('workout', day.dayNumber)}`)
  return lines.join('\n')
}

function normalizeExerciseLookup(value: string) {
  return value
    .toLowerCase()
    .replace(/\btest\b/g, '')
    .replace(/\(each side\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getExerciseGuide(exerciseName: string) {
  return EXERCISE_GUIDES[normalizeExerciseLookup(exerciseName)] ?? null
}

function formatExerciseExplanation(exercise: WorkoutDay['exercises'][number]) {
  const guide = getExerciseGuide(exercise.name)
  const lines: string[] = []
  const work = exercise.workLabel
    ? exercise.workLabel
    : exercise.reps != null
      ? `${exercise.sets} × ${exercise.reps}`
      : `${exercise.sets} × ${formatDuration(exercise.durationSeconds)}`

  lines.push(`• ${exercise.name} (${work})`)

  if (!guide) {
    lines.push('  - I do not have a stored guide for this drill yet, but I can add one.')
    return lines.join('\n')
  }

  lines.push(`  - ${guide.summary}`)
  for (const cue of guide.cues) {
    lines.push(`  - ${cue}`)
  }
  if (guide.note) {
    lines.push(`  - Note: ${guide.note}`)
  }
  return lines.join('\n')
}

function formatExplainMessage(state: BotState, queryArgs: string[] = []) {
  const day = getDay(getCurrentDayNumber(state))
  if (!day) {
    return '🏁 No active workout day right now. The challenge is complete.'
  }

  if (isManualRestToday(state)) {
    return '🛌 Today is currently a chosen rest day. Undo it first or send today if you want to look at the active workout again.'
  }

  if (day.isRestDay) {
    return [
      `😴 Day ${day.dayNumber} is a recovery day.`,
      'There are no drills to explain today.',
      'Send today on the next training day and then use explain.',
    ].join('\n')
  }

  const query = queryArgs.join(' ').trim()
  const queryNorm = normalizeExerciseLookup(query)
  // Fall back to the full exercise list when equipment filtering removes everything
  // (e.g. pull days that are 100% backpack-based).
  const filteredForDisplay = getDisplayExercises(day)
  const visibleExercises = filteredForDisplay.length > 0 ? filteredForDisplay : day.exercises
  const exercises = !queryNorm
    ? visibleExercises
    : visibleExercises.filter((exercise) => normalizeExerciseLookup(exercise.name).includes(queryNorm))

  if (!exercises.length) {
    return [
      `I could not find "${query}" in today\'s workout.`,
      'Try just: explain',
      'Or use part of a name, for example: explain plank',
    ].join('\n')
  }

  const lines = [
    `📘 Drill guide — Day ${day.dayNumber}`,
    `${day.focus} • ${currentScheduledDate(state, day.dayNumber)}`,
    '',
  ]

  if (!queryNorm) {
    lines.push('Here is what each drill means and what to focus on:')
  } else {
    lines.push(`Here is the guide for: ${query}`)
  }
  lines.push('')

  for (const exercise of exercises) {
    lines.push(formatExerciseExplanation(exercise))
    lines.push('')
  }

  lines.push('Tip: send explain <drill> if you want just one movement next time.')
  return lines.join('\n')
}

function formatManualRestDayMessage(state: BotState, intro?: string) {
  const day = getDay(getCurrentDayNumber(state))
  const today = currentDateInZone(state.reminder.timeZone)
  const tomorrow = addDays(today, 1)
  const lines: string[] = []

  if (intro) {
    lines.push(intro)
    lines.push('')
  }

  lines.push('🛌 Chosen rest day')
  lines.push(`${today}`)
  lines.push('')
  lines.push('Today is now a recovery day that you chose.')
  lines.push('This does not count as skip, and it does not delete the workout.')
  if (day) {
    lines.push('')
    lines.push(`Workout resumes: Day ${day.dayNumber} — ${day.focus}`)
    lines.push(`Planned return: ${tomorrow}`)
  }
  lines.push('')
  lines.push('Use the buttons below or tap undo if this was a mistake.')
  lines.push('')
  lines.push(`🎯 ${pickPhrase('reminder', getCurrentDayNumber(state))}`)
  return lines.join('\n')
}

function formatStatusMessage(state: BotState) {
  const currentDayNumber = getCurrentDayNumber(state)
  const day = getDay(currentDayNumber)
  const queue = getDayQueue(state)
  const manualRestToday = isManualRestToday(state)
  const tomorrow = manualRestToday && day ? day : (queue[1] ? getDay(queue[1]) : null)
  const skipped = state.skippedWorkoutDays?.length ?? 0
  const completed = state.completedWorkoutDays.length
  const total = totalWorkoutDays()
  const remaining = Math.max(0, total - resolvedWorkoutCount(state))
  const currentLabel = day ? `${getWorkoutKindIcon(day)} Day ${day.dayNumber} — ${day.focus}` : 'Challenge complete'
  const progress = total > 0 ? Math.round((resolvedWorkoutCount(state) / total) * 100) : 0
  const streaks = calculateStreaks(state)
  const progressBar = buildProgressBar(completed, skipped, total)
  const manualRestCount = state.manualRestDates?.length ?? 0

  return [
    '📊 Workout status',
    '',
    `Current: ${currentLabel}`,
    isManualRestToday(state) ? 'Today: 🛌 chosen rest day' : null,
    day ? `Scheduled date: ${currentScheduledDate(state, currentDayNumber)}` : 'Scheduled date: complete',
    tomorrow ? `Tomorrow: ${manualRestToday && day ? getWorkoutKindIcon(day) : getWorkoutKindIcon(tomorrow)} Day ${tomorrow.dayNumber} — ${tomorrow.focus}` : 'Tomorrow: —',
    '',
    `${progressBar} ${progress}%`,
    `Progress: ${resolvedWorkoutCount(state)}/${total} resolved (${progress}%)`,
    `✅ Completed: ${completed}`,
    `⏭️ Skipped: ${skipped}`,
    `🛌 Chosen rest days: ${manualRestCount}`,
    `⬜ Remaining: ${remaining}`,
    `🔥 Current streak: ${streaks.currentStreak}`,
    `🏆 Longest streak: ${streaks.longestStreak}`,
    '',
    'Progress board:',
    formatProgressBoard(state),
    '',
    `Completed days: ${formatDayList(state.completedWorkoutDays)}`,
    `Skipped days: ${formatDayList(state.skippedWorkoutDays ?? [])}`,
    `Chosen rest dates: ${(state.manualRestDates?.length ?? 0) > 0 ? state.manualRestDates?.join(', ') : '—'}`,
    `Start date: ${state.startDate}`,
    `Reminder: ${state.reminder.enabled ? `${state.reminder.time} ${state.reminder.timeZone}` : 'off'}`,
    state.reminder.skipShabbat ? 'Shabbat reminders: skipped' : 'Shabbat reminders: on',
    '',
    'Legend: ✅ done, ⏭️ skipped, 🛌 chosen rest today, 💪 current strength, 🏃 current run, 😴 rest, 🌙 current rest, ⬜ pending',
    '',
    `🎯 ${pickPhrase('status', completed || 1)}`,
  ].filter(Boolean).join('\n')
}

function formatDoneMessage(state: BotState, completedDayNumber: number) {
  const current = getDay(getCurrentDayNumber(state))
  const lines = [
    `✅ Day ${completedDayNumber} marked complete.`,
    pickPhrase('done', completedDayNumber),
    '',
  ]

  if (!current) {
    lines.push('🏁 That was the final mission. You completed the whole 28-day challenge.')
    return lines.join('\n')
  }

  lines.push(`Next up: Day ${current.dayNumber} — ${current.focus}.`)
  if (current.isRestDay) {
    lines.push('It is a recovery day, and it will advance automatically after its date passes.')
  } else {
    lines.push('Send today or wait for the morning reminder to get the workout details.')
  }
  return lines.join('\n')
}

function formatSkipMessage(state: BotState, skippedDayNumber: number) {
  const current = getDay(getCurrentDayNumber(state))
  const lines = [
    `⏭️ Day ${skippedDayNumber} marked skipped.`,
    'No guilt spiral. We keep moving.',
    '',
  ]

  if (!current) {
    lines.push('That was the last unresolved workout day in the plan.')
    return lines.join('\n')
  }

  lines.push(`Next up: Day ${current.dayNumber} — ${current.focus}.`)
  if (current.isRestDay) {
    lines.push('It is a recovery day, and it will advance automatically after its date passes.')
  } else {
    lines.push('Open today when you are ready for the next mission.')
  }
  return lines.join('\n')
}

function formatUndoMessage(state: BotState, action: 'done' | 'skip' | 'rest', dayNumber: number) {
  const current = getDay(getCurrentDayNumber(state))
  const actionLabel = action === 'done' ? 'completion' : action === 'skip' ? 'skip' : 'rest day'
  const lines = [
    `↩️ Undid the last ${actionLabel} for Day ${dayNumber}.`,
    '',
  ]

  if (!current) {
    lines.push('The challenge is back to its previous final state.')
    return lines.join('\n')
  }

  lines.push(`Current again: Day ${current.dayNumber} — ${current.focus}.`)
  lines.push('You can choose the right action now.')
  return lines.join('\n')
}

function formatRestConfirmMessage(state: BotState, dayNumber: number) {
  const day = getDay(dayNumber)
  if (!day) return 'There is no active workout day to turn into a rest day.'

  return [
    `🛌 Confirm rest day for today instead of Day ${day.dayNumber} — ${day.focus}?`,
    '',
    'This will keep the workout in your queue, mark today as a chosen rest day, and shift the workout to tomorrow.',
    'It does not count as skip.',
    '',
    'If this was a misclick, tap Cancel.',
  ].join('\n')
}

function formatRestChosenMessage(state: BotState) {
  const day = getDay(getCurrentDayNumber(state))
  const today = currentDateInZone(state.reminder.timeZone)
  return [
    '🛌 Rest day saved.',
    '',
    `Chosen rest date: ${today}`,
    day ? `Workout kept for later: Day ${day.dayNumber} — ${day.focus}` : 'Workout kept for later.',
    'This does not count as skip.',
    '',
    'Tap today to see the recovery view, or undo if you changed your mind.',
  ].join('\n')
}

function formatSkipConfirmMessage(state: BotState, dayNumber: number) {
  const day = getDay(dayNumber)
  if (!day) return 'There is no active workout day to skip.'

  return [
    `⚠️ Confirm skip for Day ${day.dayNumber} — ${day.focus}?`,
    '',
    'This will mark the workout as intentionally skipped, move you to the next scheduled day, and break the current streak.',
    '',
    'If this was a misclick, tap Cancel.',
  ].join('\n')
}

function formatSwapMessage(state: BotState, newTodayDayNumber: number, newTomorrowDayNumber: number) {
  const today = getDay(newTodayDayNumber)
  const tomorrow = getDay(newTomorrowDayNumber)

  if (!today || !tomorrow) {
    return 'I could not swap the next two days.'
  }

  return [
    '🔄 Swapped today and tomorrow.',
    '',
    `Today: Day ${today.dayNumber} — ${today.focus} (${currentScheduledDate(state, today.dayNumber)})`,
    `Tomorrow: Day ${tomorrow.dayNumber} — ${tomorrow.focus} (${currentScheduledDate(state, tomorrow.dayNumber)})`,
    '',
    'Send today to see the updated workout.',
  ].join('\n')
}

function formatRestartConfirmMessage() {
  return [
    '⚠️ Reset cycle to Day 1?',
    '',
    'This will:',
    '- Return you to Day 1 with today as the new start date',
    '- Clear all completed, skipped, and chosen-rest history',
    '- Keep your reminder settings unchanged',
    '',
    'Training history will be wiped. This cannot be undone.',
    '',
    'If this was a misclick, tap Cancel.',
  ].join('\n')
}

function formatRestartMessage(today: string) {
  return [
    '🔄 Cycle reset to Day 1.',
    '',
    `New start date: ${today}`,
    'History cleared. Reminder settings unchanged.',
    '',
    'Send today to see your Day 1 workout.',
  ].join('\n')
}

async function startPollingLoop() {
  let offset = 0
  while (true) {
    try {
      const updates = await getUpdates(offset)
      for (const update of updates) {
        offset = update.update_id + 1
        await handleUpdate(update)
      }
    } catch (error) {
      console.error('Polling error', error)
      await sleep(3000)
    }
  }
}

async function startReminderLoop() {
  while (true) {
    try {
      const state = loadState()
      syncPlanToCalendar(state)
      const now = formatNowInZone(state.reminder.timeZone)
      const isShabbatMorning = now.weekday === 'Sat'
      const shouldSend = state.reminder.enabled
        && state.chatId
        && now.time === state.reminder.time
        && state.reminder.lastSentOn !== now.date
        && !(state.reminder.skipShabbat && isShabbatMorning)

      if (shouldSend) {
        await sendMessage(state.chatId!, formatWorkoutMessage(state, getCurrentDayNumber(state), '🌅 Good morning. Here is today\'s mission.'))
        state.reminder.lastSentOn = now.date
        saveState(state)
      } else {
        saveState(state)
      }
    } catch (error) {
      console.error('Reminder loop error', error)
    }

    await sleep(30_000)
  }
}

async function handleUpdate(update: TelegramUpdate) {
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query)
    return
  }

  const msg = update.message
  if (!msg?.text) return

  const chatId = String(msg.chat.id)
  if (ALLOWED_CHAT_ID && chatId !== ALLOWED_CHAT_ID) {
    await sendMessage(chatId, 'Unauthorized chat.', { keyboard: false })
    return
  }

  const command = parseCommand(msg.text)
  if (!command) {
    await sendMessage(chatId, 'Try: today, explain, done, rest, skip, undo, status, swap, help')
    return
  }

  await executeCommand(chatId, command)
}

async function handleCallbackQuery(callbackQuery: NonNullable<TelegramUpdate['callback_query']>) {
  const chatId = callbackQuery.message ? String(callbackQuery.message.chat.id) : null
  if (!chatId) {
    await answerCallbackQuery(callbackQuery.id)
    return
  }

  if (ALLOWED_CHAT_ID && chatId !== ALLOWED_CHAT_ID) {
    await answerCallbackQuery(callbackQuery.id, 'Unauthorized chat.')
    return
  }

  const command = parseCommand(callbackQuery.data ?? '')
  if (!command) {
    await answerCallbackQuery(callbackQuery.id, 'Unknown action.')
    return
  }

  await answerCallbackQuery(callbackQuery.id)
  await executeCommand(chatId, command, { messageId: callbackQuery.message?.message_id })
}

async function executeCommand(chatId: string, command: ParsedCommand, replyTarget?: ReplyTarget) {
  const state = loadState()
  if (!state.chatId) state.chatId = chatId
  syncPlanToCalendar(state)

  switch (command.name) {
    case 'start':
    case 'help':
      await respond(chatId, [
        '🤖 Workout bot ready.',
        '',
        'Commands:',
        '- today',
        '- done',
        '- rest',
        '- skip',
        '- undo',
        '- status',
        '- swap (switch today and tomorrow)',
        '- explain (show drill explanations for today)',
        '- explain row (show one drill only)',
        '- restart (reset the 28-day cycle to Day 1)',
        '- help',
        '',
        'Use the inline buttons if you do not want to type.',
        'I will also send the daily workout every morning at 05:30.',
      ].join('\n'), replyTarget)
      break

    case 'today':
    case 'next':
      await respond(chatId, formatWorkoutMessage(state), replyTarget)
      break

    case 'status':
      await respond(chatId, formatStatusMessage(state), replyTarget)
      break

    case 'explain':
      await respond(chatId, formatExplainMessage(state, command.args), replyTarget)
      break

    case 'done': {
      const day = getDay(getCurrentDayNumber(state))
      if (!day) {
        await respond(chatId, '🏁 You already finished the 28-day challenge.', replyTarget)
        break
      }
      if (isManualRestToday(state)) {
        await respond(chatId, 'Today is currently marked as a chosen rest day. Use undo first if you want to train today instead.', replyTarget)
        break
      }
      if (day.isRestDay) {
        await respond(chatId, [
          `Day ${day.dayNumber} is a rest day.`,
          'No need to press done here.',
          'I will move you forward automatically after the rest day passes.',
        ].join('\n'), replyTarget)
        break
      }

      captureUndoState(state, 'done', day.dayNumber)
      recordResolution(state, day.dayNumber, 'done')
      state.lastCompletedAt = new Date().toISOString()
      advanceCurrentDay(state)
      syncPlanToCalendar(state)
      await respond(chatId, formatDoneMessage(state, day.dayNumber), replyTarget)
      break
    }

    case 'rest': {
      const mode = command.args[0] ?? 'prompt'
      const day = getDay(getCurrentDayNumber(state))
      if (!day) {
        await respond(chatId, '🏁 There is no active workout day to turn into a rest day.', replyTarget)
        break
      }
      if (day.isRestDay) {
        await respond(chatId, 'Today is already a built-in recovery day.', replyTarget)
        break
      }

      const today = currentDateInZone(state.reminder.timeZone)
      if (mode === 'cancel') {
        await respond(chatId, `Rest-day choice canceled. Day ${day.dayNumber} stays active for today.`, replyTarget)
        break
      }

      if (mode !== 'confirm') {
        await respond(chatId, formatRestConfirmMessage(state, day.dayNumber), replyTarget, {
          replyMarkup: buildRestConfirmKeyboard(),
        })
        break
      }

      if (isManualRestToday(state)) {
        await respond(chatId, 'Today is already saved as a chosen rest day.', replyTarget)
        break
      }

      captureRestUndoState(state, day.dayNumber)
      addManualRestDay(state, today)
      await respond(chatId, formatRestChosenMessage(state), replyTarget)
      break
    }

    case 'skip': {
      const mode = command.args[0] ?? 'prompt'
      const day = getDay(getCurrentDayNumber(state))
      if (!day) {
        await respond(chatId, '🏁 There is nothing left to skip. The challenge is complete.', replyTarget)
        break
      }
      if (isManualRestToday(state)) {
        await respond(chatId, 'Today is already marked as a chosen rest day. Undo it first if you want to skip the workout instead.', replyTarget)
        break
      }
      if (day.isRestDay) {
        await respond(chatId, 'This is already a recovery day, no need to skip it. I will advance it automatically when its date passes.', replyTarget)
        break
      }

      if (mode === 'cancel') {
        await respond(chatId, `Skip canceled. Day ${day.dayNumber} is still your active workout.`, replyTarget)
        break
      }

      if (mode !== 'confirm') {
        await respond(chatId, formatSkipConfirmMessage(state, day.dayNumber), replyTarget, {
          replyMarkup: buildSkipConfirmKeyboard(),
        })
        break
      }

      captureUndoState(state, 'skip', day.dayNumber)
      recordResolution(state, day.dayNumber, 'skipped')
      advanceCurrentDay(state)
      syncPlanToCalendar(state)
      await respond(chatId, formatSkipMessage(state, day.dayNumber), replyTarget)
      break
    }

    case 'undo': {
      const result = undoLastResolution(state)
      if (!result.ok) {
        await respond(chatId, 'Nothing to undo right now.', replyTarget)
        break
      }

      await respond(chatId, formatUndoMessage(state, result.action, result.dayNumber), replyTarget)
      break
    }

    case 'swap':
    case 'move': {
      const target = command.args[0] ?? 'tomorrow'
      if (isManualRestToday(state)) {
        await respond(chatId, 'Today is already a chosen rest day. Undo it first if you want to swap workouts instead.', replyTarget)
        break
      }
      if (!['tomorrow', 'next'].includes(target)) {
        await respond(chatId, 'Use: swap, swap tomorrow, or move tomorrow', replyTarget)
        break
      }

      const result = swapCurrentDayWithTomorrow(state)
      if (!result.ok) {
        await respond(chatId, 'There is no tomorrow workout/day left to swap with.', replyTarget)
        break
      }

      state.undoState = null
      await respond(chatId, formatSwapMessage(state, result.newToday.dayNumber, result.newTomorrow.dayNumber), replyTarget)
      break
    }

    case 'restart': {
      const mode = command.args[0] ?? 'prompt'

      if (mode === 'cancel') {
        await respond(chatId, 'Restart canceled. Current cycle continues as normal.', replyTarget)
        break
      }

      if (mode !== 'confirm') {
        await respond(chatId, formatRestartConfirmMessage(), replyTarget, {
          replyMarkup: buildRestartConfirmKeyboard(),
        })
        break
      }

      const today = currentDateInZone(state.reminder.timeZone)
      const prevReminder = { ...state.reminder, lastSentOn: null }
      const prevChatId = state.chatId ?? chatId

      state.version = 5
      state.startDate = today
      state.currentDay = 1
      state.dayQueue = buildDefaultDayQueue(1)
      state.manualRestDates = []
      state.completedWorkoutDays = []
      state.skippedWorkoutDays = []
      state.resolutionHistory = []
      state.undoState = null
      state.lastCompletedAt = null
      state.chatId = prevChatId
      state.reminder = prevReminder

      await respond(chatId, formatRestartMessage(today), replyTarget)
      break
    }

    default:
      await respond(chatId, 'Try: today, explain, done, rest, skip, undo, status, swap, help', replyTarget)
      break
  }

  saveState(state)
}

function parseCommand(text: string): ParsedCommand | null {
  const cleaned = text.trim().toLowerCase().replace(/^\//, '')
  if (!cleaned) return null
  const parts = cleaned.split(/\s+/).filter(Boolean)
  const first = parts[0]
  if (['start', 'help', 'today', 'next', 'done', 'status', 'swap', 'move', 'skip', 'undo', 'rest', 'explain', 'restart'].includes(first)) {
    return {
      name: first as ParsedCommand['name'],
      args: parts.slice(1),
    }
  }
  return null
}

function buildInlineKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '💪 Today', callback_data: 'today' },
        { text: '✅ Done', callback_data: 'done' },
      ],
      [
        { text: '🛌 Rest', callback_data: 'rest' },
        { text: '⏭️ Skip', callback_data: 'skip' },
      ],
      [
        { text: '🔄 Swap', callback_data: 'swap' },
        { text: '↩️ Undo', callback_data: 'undo' },
      ],
      [
        { text: '📘 Explain', callback_data: 'explain' },
        { text: '📊 Status', callback_data: 'status' },
      ],
      [
        { text: '❓ Help', callback_data: 'help' },
      ],
    ],
  }
}

function buildSkipConfirmKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '⚠️ Confirm skip', callback_data: 'skip confirm' },
        { text: '❌ Cancel', callback_data: 'skip cancel' },
      ],
      [
        { text: '📊 Status', callback_data: 'status' },
      ],
    ],
  }
}

function buildRestConfirmKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🛌 Confirm rest day', callback_data: 'rest confirm' },
        { text: '❌ Cancel', callback_data: 'rest cancel' },
      ],
      [
        { text: '📊 Status', callback_data: 'status' },
      ],
    ],
  }
}

function buildRestartConfirmKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🔄 Yes, reset to Day 1', callback_data: 'restart confirm' },
        { text: '❌ Cancel', callback_data: 'restart cancel' },
      ],
    ],
  }
}

async function getUpdates(offset: number) {
  const url = new URL(`${API_BASE}/getUpdates`)
  url.searchParams.set('offset', String(offset))
  url.searchParams.set('timeout', '50')
  const res = await fetch(url, { method: 'GET' })
  const json = await res.json() as { ok: boolean; result: TelegramUpdate[] }
  if (!json.ok) throw new Error('getUpdates failed')
  return json.result
}

async function sendMessage(chatId: string, text: string, options?: ReplyOptions) {
  const res = await fetch(`${API_BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: options?.keyboard === false ? undefined : (options?.replyMarkup ?? buildInlineKeyboard()),
    }),
  })
  const json = await res.json() as { ok: boolean; description?: string }
  if (!json.ok) throw new Error(`sendMessage failed: ${json.description ?? 'unknown error'}`)
}

async function editMessage(chatId: string, messageId: number, text: string, options?: ReplyOptions) {
  const res = await fetch(`${API_BASE}/editMessageText`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      reply_markup: options?.keyboard === false ? undefined : (options?.replyMarkup ?? buildInlineKeyboard()),
    }),
  })
  const json = await res.json() as { ok: boolean; description?: string }
  if (!json.ok) throw new Error(`editMessageText failed: ${json.description ?? 'unknown error'}`)
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const res = await fetch(`${API_BASE}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  })
  const json = await res.json() as { ok: boolean; description?: string }
  if (!json.ok) throw new Error(`answerCallbackQuery failed: ${json.description ?? 'unknown error'}`)
}

async function respond(chatId: string, text: string, replyTarget?: ReplyTarget, options?: ReplyOptions) {
  if (replyTarget?.messageId) {
    try {
      await editMessage(chatId, replyTarget.messageId, text, options)
      return
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (message.includes('message is not modified')) {
        return
      }
      console.error('Edit message failed, falling back to sendMessage', error)
    }
  }

  await sendMessage(chatId, text, options)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}

export {
  captureUndoState,
  createInitialState,
  currentScheduledDate,
  formatStatusMessage,
  formatWorkoutMessage,
  getDisplayExercises,
  normalizeState,
  parseCommand,
  recordResolution,
  syncPlanToCalendar,
  swapCurrentDayWithTomorrow,
  undoLastResolution,
}
