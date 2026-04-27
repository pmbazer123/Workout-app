import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getPhase } from '@/lib/workout-generator'
import { getDailyQuote } from '@/lib/drill-quotes'
import { CalendarGrid } from '@/components/dashboard/CalendarGrid'
import { StreakCounter } from '@/components/dashboard/StreakCounter'
import { cn } from '@/lib/cn'
import type { CalendarDayData, DayState } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'DASHBOARD | COMBAT FITNESS' }

// Total workout days in the 28-day program (28 - 8 rest days)
const TOTAL_WORKOUT_DAYS = 20

export default async function DashboardPage() {
  const profile = await prisma.userProfile.findFirst()

  const challenge = await prisma.challenge.findFirst({
    where: { userId: profile?.id, isActive: true },
    include: { dailyWorkouts: { orderBy: { dayNumber: 'asc' } } },
  })
  if (!challenge) redirect('/dashboard')

  const { currentDay, dailyWorkouts: workouts } = challenge

  // ── streak ─────────────────────────────────────────────────────────────────
  let streak = 0
  for (let d = currentDay - 1; d >= 1; d--) {
    const w = workouts.find((x) => x.dayNumber === d)
    if (!w) break
    if (w.isRestDay) continue
    if (!w.isCompleted) break
    streak++
  }

  // ── calendar data ──────────────────────────────────────────────────────────
  const days: CalendarDayData[] = workouts.map((w) => {
    let state: DayState
    if (w.isRestDay) {
      state = 'rest'
    } else if (w.isCompleted) {
      state = 'completed'
    } else if (w.dayNumber === currentDay) {
      state = 'today'
    } else if (w.dayNumber < currentDay) {
      state = 'missed'
    } else {
      state = 'locked'
    }

    const { phase, label } = getPhase(w.dayNumber)
    return {
      dayNumber:   w.dayNumber,
      state,
      isRestDay:   w.isRestDay,
      completedAt: w.completedAt?.toISOString(),
      weekPhase:   phase,
      phaseLabel:  label,
    }
  })

  const completedDays = workouts.filter((w) => w.isCompleted && !w.isRestDay).length
  const completionPct = Math.round((completedDays / TOTAL_WORKOUT_DAYS) * 100)

  const todayWorkout   = workouts.find((w) => w.dayNumber === currentDay)
  const isTodayRest    = todayWorkout?.isRestDay ?? false
  const campaignDone   = currentDay > 28

  const { label: phaseLabel } = getPhase(Math.min(currentDay, 28))
  const quote = getDailyQuote()

  return (
    <div className="min-h-screen bg-matte-black">

      {/* ── header ─────────────────────────────────────────────────────── */}
      <header className="px-4 pt-10 pb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-stencil text-[9px] text-text-muted tracking-[0.4em]">
            ■ COMBAT FITNESS ■
          </p>
          <h1 className="font-heading text-headline leading-none text-text-primary mt-1">
            28-DAY<br />CHALLENGE
          </h1>
        </div>
        <StreakCounter streak={streak} />
      </header>

      <div className="px-4 pb-8 space-y-6">

        {/* ── mission CTA card ───────────────────────────────────────────── */}
        <div className="clip-dogtag bg-dark-surface border border-dark-border p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-stencil text-[9px] text-text-muted tracking-widest">
                {phaseLabel}
              </p>
              <p className="font-heading text-title text-text-primary leading-none mt-0.5">
                {campaignDone ? 'CAMPAIGN COMPLETE' : `DAY ${currentDay}`}
              </p>
            </div>

            {!campaignDone && (
              <Link
                href={`/workout/${currentDay}`}
                className={cn(
                  'clip-dogtag-sm px-4 py-2.5 font-heading text-stencil text-sm',
                  'flex items-center gap-1.5 flex-shrink-0 transition-opacity hover:opacity-90',
                  isTodayRest
                    ? 'bg-dark-border border border-olive-drab text-olive-light'
                    : 'bg-blaze text-white',
                )}
              >
                {isTodayRest ? 'REST DAY' : 'START MISSION'}
                <ChevronRight size={14} />
              </Link>
            )}
          </div>

          {/* Ammo-box progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-stencil text-[9px] text-text-muted tracking-widest">
                MISSIONS COMPLETE
              </span>
              <span className="font-heading text-sm text-olive-light">
                {completedDays} <span className="text-text-muted">/ {TOTAL_WORKOUT_DAYS}</span>
              </span>
            </div>
            <AmmoBar completed={completedDays} total={TOTAL_WORKOUT_DAYS} />
            <div className="text-right text-[9px] text-text-muted font-body">
              {completionPct}% COMPLETE
            </div>
          </div>
        </div>

        {/* ── 28-day calendar ───────────────────────────────────────────── */}
        <CalendarGrid days={days} currentDay={currentDay} />

        {/* ── drill sergeant daily order ────────────────────────────────── */}
        <div className="clip-dogtag-sm bg-dark-surface border border-dark-border px-4 py-4">
          <p className="text-stencil text-[9px] text-blaze mb-2 tracking-[0.3em]">
            ◆ DAILY ORDER ◆
          </p>
          <p className="font-body text-sm text-text-secondary leading-relaxed italic">
            &ldquo;{quote.text}&rdquo;
          </p>
          {quote.attribution && (
            <p className="text-stencil text-[9px] text-text-muted mt-2">
              — {quote.attribution}
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

// ── segmented ammo-progress bar ───────────────────────────────────────────────
function AmmoBar({ completed, total }: { completed: number; total: number }) {
  return (
    <div className="flex gap-0.5 h-3">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 clip-dogtag-xs transition-colors duration-300',
            i < completed ? 'bg-olive-drab' : 'bg-dark-border',
          )}
        />
      ))}
    </div>
  )
}
