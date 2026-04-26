'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, CheckCircle2, Flame, BedDouble, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { CalendarDayData, DayState, WeekPhase } from '@/types'

// ── phase accent colour ───────────────────────────────────────────────────────
const PHASE_COLOR: Record<WeekPhase, string> = {
  Foundation: 'text-olive-light',
  Building:   'text-olive-drab',
  Intensity:  'text-blaze-light',
  Peak:       'text-desert-tan',
}

// ── tile background + border by state ────────────────────────────────────────
const TILE_BG: Record<DayState, string> = {
  locked:    'bg-off-black border-dark-border opacity-50',
  today:     'bg-olive-dark border-blaze',
  completed: 'bg-olive-dark border-olive-drab',
  rest:      'bg-dark-surface border-dark-border',
  missed:    'bg-off-black border-mission-red/60 opacity-75',
}

// ── week rows ─────────────────────────────────────────────────────────────────
const WEEKS: { week: number; phase: WeekPhase; days: number[] }[] = [
  { week: 1, phase: 'Foundation', days: [1,  2,  3,  4,  5,  6,  7]  },
  { week: 2, phase: 'Building',   days: [8,  9,  10, 11, 12, 13, 14] },
  { week: 3, phase: 'Intensity',  days: [15, 16, 17, 18, 19, 20, 21] },
  { week: 4, phase: 'Peak',       days: [22, 23, 24, 25, 26, 27, 28] },
]

// ── props ─────────────────────────────────────────────────────────────────────
interface Props {
  days: CalendarDayData[]
  currentDay: number
}

export function CalendarGrid({ days, currentDay }: Props) {
  const router = useRouter()
  const dayMap = new Map(days.map((d) => [d.dayNumber, d]))

  function go(dayNum: number, state: DayState) {
    if (state === 'locked') return
    router.push(`/workout/${dayNum}`)
  }

  return (
    <section className="space-y-5">
      {WEEKS.map(({ week, phase, days: weekDays }) => (
        <div key={week}>
          {/* Week header */}
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('text-stencil text-[9px] tracking-[0.25em]', PHASE_COLOR[phase])}>
              W{week}
            </span>
            <div className="h-px flex-1 bg-dark-border" />
            <span className="text-[9px] text-text-muted font-body uppercase tracking-widest">
              {phase}
            </span>
          </div>

          {/* 7-tile row */}
          <div className="grid grid-cols-7 gap-1.5">
            {weekDays.map((dayNum) => {
              const day = dayMap.get(dayNum)
              if (!day) return <div key={dayNum} className="aspect-square" />
              return (
                <DayTile
                  key={dayNum}
                  day={day}
                  onClick={() => go(dayNum, day.state)}
                />
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}

// ── individual tile ───────────────────────────────────────────────────────────
function DayTile({ day, onClick }: { day: CalendarDayData; onClick: () => void }) {
  const { dayNumber, state, isRestDay } = day
  const interactive = state !== 'locked'
  const isToday = state === 'today'

  return (
    <motion.button
      onClick={onClick}
      whileTap={interactive ? { scale: 0.86 } : {}}
      whileHover={interactive ? { scale: 1.08 } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className={cn(
        'relative clip-dogtag-xs aspect-square border',
        'flex flex-col items-center justify-center gap-0.5',
        'focus:outline-none select-none',
        TILE_BG[state],
        interactive ? 'cursor-pointer' : 'cursor-default',
      )}
    >
      {/* Pulsing border ring for today */}
      {isToday && (
        <motion.div
          className="absolute inset-0 border border-blaze clip-dogtag-xs"
          animate={{ opacity: [0.9, 0.15, 0.9] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Day number */}
      <span
        className={cn(
          'absolute top-0.5 left-1 font-heading leading-none',
          'text-[8px]',
          isToday     ? 'text-blaze'
          : state === 'completed' ? 'text-olive-light'
          : state === 'missed'    ? 'text-mission-red/70'
          : 'text-text-muted',
        )}
      >
        {dayNumber}
      </span>

      {/* Centre icon / label */}
      {isRestDay && state !== 'completed' ? (
        <span className="text-[7px] font-heading text-text-muted tracking-widest leading-none mt-1">
          REST
        </span>
      ) : state === 'locked' ? (
        <Lock size={10} className="text-text-muted mt-1" />
      ) : state === 'completed' ? (
        <CheckCircle2 size={11} className="text-olive-light mt-1" />
      ) : state === 'today' ? (
        <Flame size={12} className="text-blaze mt-1" />
      ) : state === 'missed' ? (
        <AlertCircle size={10} className="text-mission-red/70 mt-1" />
      ) : (
        <BedDouble size={10} className="text-text-muted mt-1" />
      )}
    </motion.button>
  )
}
