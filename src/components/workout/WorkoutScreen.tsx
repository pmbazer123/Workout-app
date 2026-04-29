'use client'

import { useState, useEffect, useTransition, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Check, SkipForward,
  Award, RotateCcw, Flame,
} from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { completeWorkout } from '@/actions/workout'
import { getQuoteByContext } from '@/lib/drill-quotes'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { WorkoutExerciseSlot, AchievementType } from '@/types'

// ── types ─────────────────────────────────────────────────────────────────────

type Phase = 'overview' | 'active' | 'rest' | 'complete'

export interface ExerciseDetail {
  formCues: string[]
  description: string
  musclesTargeted: string[]
}

interface Props {
  workoutId: string
  dayNumber: number
  phaseLabel: string
  initialExercises: WorkoutExerciseSlot[]
  exerciseDetails: Record<string, ExerciseDetail>
  isAlreadyCompleted: boolean
}

// ── audio helpers ─────────────────────────────────────────────────────────────

function createAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  return Ctx ? new Ctx() : null
}

function beep(ctx: AudioContext, freq: number, vol = 0.25, dur = 0.15) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = freq
  osc.type = 'sine'
  gain.gain.setValueAtTime(vol, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + dur + 0.01)
}

// ── confetti burst ────────────────────────────────────────────────────────────

function fireConfetti() {
  const colors = ['#556B2F', '#C8A97C', '#FF5722', '#6B8E23', '#E8E0D0']
  confetti({ particleCount: 120, spread: 70, origin: { y: 0.55 }, colors, shapes: ['square'], scalar: 0.85 })
  setTimeout(() => {
    confetti({ particleCount: 65, angle: 60,  spread: 55, origin: { x: 0 }, colors })
    confetti({ particleCount: 65, angle: 120, spread: 55, origin: { x: 1 }, colors })
  }, 220)
}

// ── format helpers ────────────────────────────────────────────────────────────

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ── main component ────────────────────────────────────────────────────────────

export function WorkoutScreen({
  workoutId, dayNumber, phaseLabel,
  initialExercises, exerciseDetails, isAlreadyCompleted,
}: Props) {
  const [phase,     setPhase]     = useState<Phase>(isAlreadyCompleted ? 'complete' : 'overview')
  const [exIdx,     setExIdx]     = useState(0)
  const [setIdx,    setSetIdx]    = useState(0)
  const [exercises, setExercises] = useState(initialExercises)
  const [elapsed,   setElapsed]   = useState(0)
  const [started,   setStarted]   = useState(isAlreadyCompleted)
  const [newAchs,   setNewAchs]   = useState<AchievementType[]>([])
  const [toast,     setToast]     = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const audioRef  = useRef<AudioContext | null>(null)
  const toastRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Elapsed timer — ticks while workout is active
  useEffect(() => {
    if (!started || phase === 'overview' || phase === 'complete') return
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [started, phase])

  // ── audio ──────────────────────────────────────────────────────────────────
  function ensureAudio() {
    if (!audioRef.current) audioRef.current = createAudioCtx()
  }
  function playBeep(freq: number) {
    if (audioRef.current) beep(audioRef.current, freq)
  }

  // ── toasts ─────────────────────────────────────────────────────────────────
  function showToast(msg: string) {
    if (toastRef.current) clearTimeout(toastRef.current)
    setToast(msg)
    toastRef.current = setTimeout(() => setToast(null), 4500)
  }

  // ── start mission ──────────────────────────────────────────────────────────
  function start() {
    ensureAudio()
    setExIdx(0)
    setSetIdx(0)
    setStarted(true)
    setPhase('active')
    setTimeout(() => showToast(getQuoteByContext('start').text), 300)
  }

  // ── complete a single set ──────────────────────────────────────────────────
  const completeSet = useCallback(() => {
    ensureAudio()
    playBeep(880)

    const updated = exercises.map((ex, i) =>
      i === exIdx ? { ...ex, completedSets: ex.completedSets + 1 } : ex,
    )
    setExercises(updated)

    const cur = exercises[exIdx]
    const moreSets = setIdx + 1 < cur.sets
    const moreEx   = exIdx + 1 < exercises.length

    if (!moreSets && !moreEx) {
      // All done — save to server
      const mins = Math.max(1, Math.round(elapsed / 60))
      startTransition(async () => {
        try {
          const res = await completeWorkout(workoutId, updated, mins)
          setNewAchs(res.newAchievements)
          setPhase('complete')
          setTimeout(fireConfetti, 500)
          showToast(getQuoteByContext('complete').text)
        } catch {
          // Still show completion even if save fails
          setPhase('complete')
          setTimeout(fireConfetti, 500)
        }
      })
      return
    }

    // Mid-workout motivation at the halfway exercise
    if (!moreSets && exIdx === Math.floor(exercises.length / 2) - 1) {
      setTimeout(() => showToast(getQuoteByContext('mid').text), 2000)
    }

    setPhase('rest')
  }, [exercises, exIdx, setIdx, elapsed, workoutId, startTransition])

  // ── after rest timer completes ─────────────────────────────────────────────
  function afterRest() {
    playBeep(1200)
    const cur = exercises[exIdx]
    const moreSets = setIdx + 1 < cur.sets
    if (moreSets) {
      setSetIdx((s) => s + 1)
    } else {
      setExIdx((e) => e + 1)
      setSetIdx(0)
    }
    setPhase('active')
  }

  // ── current exercise info ──────────────────────────────────────────────────
  const curEx     = exercises[exIdx]
  const curDetail = curEx ? exerciseDetails[curEx.exerciseName] : undefined

  return (
    <div className="h-[100dvh] bg-matte-black flex flex-col overflow-hidden">

      {/* Header */}
      <header className="px-4 pt-10 pb-3 flex items-center justify-between gap-3">
        <Link href="/dashboard" className="text-text-muted hover:text-text-secondary transition-colors p-1">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1 text-center">
          <p className="text-stencil text-[9px] text-blaze tracking-widest">{phaseLabel}</p>
          <p className="font-heading text-xl text-text-primary leading-none">DAY {dayNumber}</p>
        </div>
        <div className="text-stencil text-[10px] text-text-muted text-right w-14">
          {started && phase !== 'overview' ? fmtTime(elapsed) : ' '}
        </div>
      </header>

      {/* Progress strip */}
      {phase !== 'overview' && phase !== 'complete' && (
        <div className="px-4 mb-2">
          <div className="flex gap-0.5 h-1">
            {exercises.map((ex, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-full transition-colors duration-300',
                  ex.completedSets >= ex.sets ? 'bg-olive-drab'
                  : i === exIdx ? 'bg-blaze'
                  : 'bg-dark-border',
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main content — animated phase transitions */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
          {phase === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 px-4 py-2 flex flex-col"
            >
              <h2 className="font-heading text-title text-text-primary mb-1">TODAY&apos;S MISSION</h2>
              <p className="text-xs text-text-muted font-body mb-4">
                {exercises.length} exercises · approx {
                  exercises.reduce((t, ex) => t + ex.sets * (ex.restSeconds + (ex.durationSeconds ?? 45)), 0) / 60 | 0
                }–{
                  exercises.reduce((t, ex) => t + ex.sets * (ex.restSeconds + (ex.durationSeconds ?? 60)), 0) / 60 + 5 | 0
                } min
              </p>

              <div className="flex-1 space-y-2 overflow-y-auto mb-6">
                {exercises.map((ex, i) => (
                  <div
                    key={i}
                    className="clip-dogtag-sm bg-dark-surface border border-dark-border px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-stencil text-[9px] text-text-muted w-5 flex-shrink-0">{i + 1}</span>
                      <span className="font-heading text-sm text-text-primary truncate">
                        {ex.exerciseName.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-stencil text-[10px] text-olive-light flex-shrink-0">
                      {ex.sets}×{ex.reps != null ? ex.reps : `${ex.durationSeconds}s`}
                    </span>
                  </div>
                ))}
              </div>

              <Button size="lg" onClick={start} className="w-full">
                START MISSION <Flame size={16} />
              </Button>
            </motion.div>
          )}

          {/* ── ACTIVE EXERCISE ───────────────────────────────────────────── */}
          {phase === 'active' && curEx && (
            <motion.div
              key={`active-${exIdx}-${setIdx}`}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 28 } }}
              exit={{ x: -60, opacity: 0, transition: { duration: 0.15 } }}
              className="absolute inset-0 px-4 py-2 flex flex-col"
            >
              {/* Exercise meta */}
              <div className="mb-2">
                <p className="text-stencil text-[9px] text-blaze tracking-widest mb-0.5">
                  EXERCISE {exIdx + 1} OF {exercises.length}
                </p>
                <h2 className="font-heading text-headline text-text-primary leading-none">
                  {curEx.exerciseName.toUpperCase()}
                </h2>
                {curDetail && (
                  <p className="text-xs text-text-muted mt-1 font-body">
                    {curDetail.musclesTargeted.slice(0, 3).join(' · ')}
                  </p>
                )}
              </div>

              {/* Set indicator dots */}
              <div className="flex gap-2 mb-6">
                {Array.from({ length: curEx.sets }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-2 flex-1 rounded-full transition-colors',
                      i < curEx.completedSets ? 'bg-olive-drab'
                      : i === setIdx ? 'bg-blaze'
                      : 'bg-dark-border',
                    )}
                  />
                ))}
              </div>

              {/* Big rep/duration display */}
              <div className="flex flex-col items-center justify-center py-4">
                {curEx.reps != null ? (
                  <>
                    <motion.div
                      key={`rep-${setIdx}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-heading text-[5rem] leading-none text-text-primary"
                    >
                      {curEx.reps}
                    </motion.div>
                    <p className="text-stencil text-sm text-text-muted tracking-widest">REPS</p>
                  </>
                ) : (
                  <ExerciseCountdown
                    seconds={curEx.durationSeconds!}
                    onComplete={completeSet}
                    playBeep={playBeep}
                  />
                )}

                <p className="text-stencil text-[10px] text-text-muted mt-4 tracking-widest">
                  SET {setIdx + 1} OF {curEx.sets}
                </p>
              </div>

              {/* Form cues */}
              {curDetail && curDetail.formCues.length > 0 && (
                <div className="clip-dogtag-sm bg-dark-surface border border-dark-border px-4 py-3 mb-4">
                  <p className="text-stencil text-[8px] text-olive-light mb-1.5 tracking-widest">FORM BRIEF</p>
                  <ul className="space-y-1">
                    {curDetail.formCues.slice(0, 3).map((cue, i) => (
                      <li key={i} className="text-xs text-text-muted font-body flex gap-2">
                        <span className="text-olive-drab flex-shrink-0">▸</span>
                        {cue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Complete button (only for rep-based) */}
              {curEx.reps != null && (
                <Button size="lg" onClick={completeSet} className="w-full mb-2">
                  COMPLETE SET <Check size={16} />
                </Button>
              )}
            </motion.div>
          )}

          {/* ── REST TIMER ────────────────────────────────────────────────── */}
          {phase === 'rest' && (
            <motion.div
              key="rest"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 px-4 flex flex-col items-center justify-center gap-6"
            >
              <div>
                <p className="text-stencil text-[9px] text-text-muted tracking-[0.3em] text-center mb-1">
                  {getQuoteByContext('rest').text.split(' ').slice(0, 5).join(' ')}…
                </p>
                <h2 className="font-heading text-headline text-text-primary text-center">REST</h2>
              </div>

              <RestCountdown
                seconds={curEx?.restSeconds ?? 60}
                onComplete={afterRest}
                playBeep={playBeep}
              />

              <button
                onClick={afterRest}
                className="flex items-center gap-1.5 text-text-muted text-xs font-body hover:text-text-secondary transition-colors"
              >
                SKIP <SkipForward size={14} />
              </button>
            </motion.div>
          )}

          {/* ── COMPLETE ──────────────────────────────────────────────────── */}
          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 px-4 py-4 flex flex-col items-center justify-center gap-6"
            >
              {/* Stamp */}
              <motion.div
                initial={{ rotate: -15, scale: 2.2, opacity: 0 }}
                animate={{ rotate: 2, scale: 1, opacity: 0.92 }}
                transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.1 }}
                className="stamp-ink border-4 px-8 py-4 text-center"
              >
                <p className="font-heading text-4xl tracking-[0.15em] text-mission-red leading-none">
                  MISSION
                </p>
                <p className="font-heading text-4xl tracking-[0.15em] text-mission-red leading-none">
                  COMPLETE
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full clip-dogtag bg-dark-surface border border-olive-drab p-4"
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { val: exercises.reduce((s, ex) => s + (ex.reps ?? 0) * ex.completedSets, 0), label: 'REPS' },
                    { val: Math.max(1, Math.round(elapsed / 60)), label: 'MINUTES' },
                    { val: exercises.filter((ex) => ex.completedSets >= ex.sets).length, label: 'EXERCISES' },
                  ].map(({ val, label }) => (
                    <div key={label}>
                      <div className="font-heading text-2xl text-blaze">{val}</div>
                      <div className="text-stencil text-[8px] text-text-muted">{label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* New achievements */}
              {newAchs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="w-full space-y-2"
                >
                  <p className="text-stencil text-[9px] text-blaze tracking-widest text-center">
                    ◆ BADGE UNLOCKED ◆
                  </p>
                  {newAchs.map((type) => {
                    const def = ACHIEVEMENTS[type]
                    return (
                      <div
                        key={type}
                        className="clip-dogtag-sm bg-dark-surface border border-blaze px-4 py-2 flex items-center gap-3"
                      >
                        <Award size={18} className="text-blaze flex-shrink-0" />
                        <div>
                          <div className="font-heading text-sm text-text-primary">{def.name}</div>
                          <div className="text-xs text-text-muted font-body">{def.description}</div>
                        </div>
                      </div>
                    )
                  })}
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="w-full space-y-3"
              >
                <Link href="/dashboard">
                  <Button size="lg" className="w-full">
                    RETURN TO BASE <ChevronRight size={16} />
                  </Button>
                </Link>
                {isAlreadyCompleted && (
                  <button
                    onClick={() => setPhase('overview')}
                    className="w-full flex items-center justify-center gap-1.5 text-text-muted text-xs font-body hover:text-text-secondary transition-colors"
                  >
                    <RotateCcw size={12} /> Review workout
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Drill sergeant toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50 clip-dogtag-sm bg-dark-surface border border-olive-drab px-4 py-3"
          >
            <p className="text-xs text-text-secondary font-body italic leading-relaxed">
              &ldquo;{toast}&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Exercise countdown (for timed sets) ───────────────────────────────────────

function ExerciseCountdown({
  seconds, onComplete, playBeep,
}: { seconds: number; onComplete: () => void; playBeep: (f: number) => void }) {
  const [left, setLeft] = useState(seconds)
  const beeped = useRef<Set<number>>(new Set())

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const remaining = Math.max(0, seconds - Math.floor((Date.now() - start) / 1000))
      setLeft(remaining)

      if (remaining <= 3 && remaining > 0 && !beeped.current.has(remaining)) {
        beeped.current.add(remaining)
        playBeep(880)
      }
      if (remaining === 0) {
        clearInterval(id)
        onComplete()
      }
    }, 200)
    return () => clearInterval(id)
  }, [seconds, onComplete, playBeep])

  const pct = (left / seconds) * 100

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="font-heading text-[5rem] leading-none text-blaze">{left}</div>
      <p className="text-stencil text-sm text-text-muted tracking-widest">SECONDS</p>
      <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blaze rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </div>
  )
}

// ── Rest countdown ────────────────────────────────────────────────────────────

function RestCountdown({
  seconds, onComplete, playBeep,
}: { seconds: number; onComplete: () => void; playBeep: (f: number) => void }) {
  const [left, setLeft] = useState(seconds)
  const beeped = useRef<Set<number>>(new Set())

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const remaining = Math.max(0, seconds - Math.floor((Date.now() - start) / 1000))
      setLeft(remaining)

      if (remaining <= 3 && remaining > 0 && !beeped.current.has(remaining)) {
        beeped.current.add(remaining)
        playBeep(660)
      }
      if (remaining === 0) {
        clearInterval(id)
        onComplete()
      }
    }, 200)
    return () => clearInterval(id)
  }, [seconds, onComplete, playBeep])

  const pct = (left / seconds) * 100

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <motion.div
        key={left}
        initial={{ scale: 1.2, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-heading text-[7rem] leading-none text-text-primary"
      >
        {left}
      </motion.div>
      <p className="text-stencil text-sm text-text-muted tracking-widest">SECONDS</p>
      {/* Segmented ammo bar */}
      <div className="w-full flex gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 h-2.5 clip-dogtag-xs transition-colors duration-300',
              i < Math.ceil((left / seconds) * 10) ? 'bg-olive-drab' : 'bg-dark-border',
            )}
          />
        ))}
      </div>
    </div>
  )
}
