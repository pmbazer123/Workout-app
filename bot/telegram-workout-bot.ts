import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type WorkoutPlan = {
  totalDays: number
  days: WorkoutDay[]
}

type WorkoutDay = {
  dayNumber: number
  phase: string
  focus: string
  isRestDay: boolean
  activities: { title: string; duration: string; description: string }[]
  exercises: {
    name: string
    sets: number
    reps: number | null
    durationSeconds: number | null
    restSeconds: number
  }[]
}

type BotState = {
  version: 1
  startDate: string
  currentDay: number
  completedWorkoutDays: number[]
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

type TelegramUpdate = {
  update_id: number
  message?: {
    message_id: number
    text?: string
    chat: { id: number | string; type: string }
  }
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

async function main() {
  const state = loadState()
  syncExpiredRestDays(state)
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
    const initial: BotState = {
      version: 1,
      startDate: DEFAULT_START_DATE,
      currentDay: 1,
      completedWorkoutDays: [],
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
    ensureParentDir(STATE_PATH)
    fs.writeFileSync(STATE_PATH, JSON.stringify(initial, null, 2))
    return initial
  }
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')) as BotState
}

function saveState(state: BotState) {
  ensureParentDir(STATE_PATH)
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))
}

function ensureParentDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function getDay(dayNumber: number) {
  return plan.days.find((day) => day.dayNumber === dayNumber) ?? null
}

function currentScheduledDate(state: BotState, dayNumber = state.currentDay) {
  return addDays(state.startDate, dayNumber - 1)
}

function syncExpiredRestDays(state: BotState, today = currentDateInZone(state.reminder.timeZone)) {
  while (state.currentDay <= plan.totalDays) {
    const day = getDay(state.currentDay)
    if (!day?.isRestDay) break
    const scheduledDate = currentScheduledDate(state)
    if (scheduledDate >= today) break
    state.currentDay += 1
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

function formatWorkoutMessage(state: BotState, dayNumber = state.currentDay, intro?: string) {
  const day = getDay(dayNumber)
  if (!day) {
    return [
      '🏁 28-day challenge complete.',
      '',
      'You finished the plan. If you want, we can start a new cycle or build phase 2.',
    ].join('\n')
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
    lines.push('')
    lines.push(`🎯 ${pickPhrase('reminder', day.dayNumber)}`)
    return lines.join('\n')
  }

  lines.push('Today\'s workout:')
  for (const exercise of day.exercises) {
    const work = exercise.reps != null
      ? `${exercise.sets} × ${exercise.reps}`
      : `${exercise.sets} × ${formatDuration(exercise.durationSeconds)}`
    const rest = exercise.restSeconds > 0 ? `, rest ${exercise.restSeconds} sec` : ''
    lines.push(`- ${exercise.name}: ${work}${rest}`)
  }
  lines.push('')
  lines.push('Reply with: done')
  lines.push('')
  lines.push(`🎯 ${pickPhrase('workout', day.dayNumber)}`)
  return lines.join('\n')
}

function formatStatusMessage(state: BotState) {
  const day = getDay(state.currentDay)
  const completed = state.completedWorkoutDays.length
  const totalWorkoutDays = plan.days.filter((item) => !item.isRestDay).length
  const remaining = Math.max(0, totalWorkoutDays - completed)
  const currentLabel = day ? `Day ${day.dayNumber} — ${day.focus}` : 'Challenge complete'

  return [
    '📊 Workout status',
    '',
    `Current: ${currentLabel}`,
    `Completed workouts: ${completed}/${totalWorkoutDays}`,
    `Remaining workouts: ${remaining}`,
    `Start date: ${state.startDate}`,
    `Reminder: ${state.reminder.enabled ? `${state.reminder.time} ${state.reminder.timeZone}` : 'off'}`,
    state.reminder.skipShabbat ? 'Shabbat reminders: skipped' : 'Shabbat reminders: on',
    '',
    `🎯 ${pickPhrase('status', completed || 1)}`,
  ].join('\n')
}

function formatDoneMessage(state: BotState, completedDayNumber: number) {
  const current = getDay(state.currentDay)
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
      syncExpiredRestDays(state)
      const now = formatNowInZone(state.reminder.timeZone)
      const isShabbatMorning = now.weekday === 'Sat'
      const shouldSend = state.reminder.enabled
        && state.chatId
        && now.time === state.reminder.time
        && state.reminder.lastSentOn !== now.date
        && !(state.reminder.skipShabbat && isShabbatMorning)

      if (shouldSend) {
        await sendMessage(state.chatId!, formatWorkoutMessage(state, state.currentDay, '🌅 Good morning. Here is today\'s mission.'))
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
  const msg = update.message
  if (!msg?.text) return

  const chatId = String(msg.chat.id)
  if (ALLOWED_CHAT_ID && chatId !== ALLOWED_CHAT_ID) {
    await sendMessage(chatId, 'Unauthorized chat.')
    return
  }

  const state = loadState()
  if (!state.chatId) {
    state.chatId = chatId
  }
  syncExpiredRestDays(state)

  const command = normalizeCommand(msg.text)
  if (!command) {
    await sendMessage(chatId, 'Try: today, done, status, help')
    saveState(state)
    return
  }

  switch (command) {
    case 'start':
    case 'help':
      await sendMessage(chatId, [
        '🤖 Workout bot ready.',
        '',
        'Commands:',
        '- today',
        '- done',
        '- status',
        '- help',
        '',
        'I will also send the daily workout every morning at 05:30.',
      ].join('\n'))
      break

    case 'today':
    case 'next':
      await sendMessage(chatId, formatWorkoutMessage(state))
      break

    case 'status':
      await sendMessage(chatId, formatStatusMessage(state))
      break

    case 'done': {
      const day = getDay(state.currentDay)
      if (!day) {
        await sendMessage(chatId, '🏁 You already finished the 28-day challenge.')
        break
      }
      if (day.isRestDay) {
        await sendMessage(chatId, [
          `Day ${day.dayNumber} is a rest day.`,
          'No need to press done here.',
          'I will move you forward automatically after the rest day passes.',
        ].join('\n'))
        break
      }
      if (!state.completedWorkoutDays.includes(day.dayNumber)) {
        state.completedWorkoutDays.push(day.dayNumber)
      }
      state.completedWorkoutDays.sort((a, b) => a - b)
      state.lastCompletedAt = new Date().toISOString()
      state.currentDay += 1
      syncExpiredRestDays(state)
      await sendMessage(chatId, formatDoneMessage(state, day.dayNumber))
      break
    }

    default:
      await sendMessage(chatId, 'Try: today, done, status, help')
      break
  }

  saveState(state)
}

function normalizeCommand(text: string) {
  const cleaned = text.trim().toLowerCase().replace(/^\//, '')
  if (!cleaned) return null
  const first = cleaned.split(/\s+/)[0]
  if (['start', 'help', 'today', 'next', 'done', 'status'].includes(first)) return first
  return null
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

async function sendMessage(chatId: string, text: string) {
  const res = await fetch(`${API_BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
  const json = await res.json() as { ok: boolean; description?: string }
  if (!json.ok) throw new Error(`sendMessage failed: ${json.description ?? 'unknown error'}`)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
