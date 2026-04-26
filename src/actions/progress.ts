'use server'

import { prisma } from '@/lib/prisma'
import { REST_DAYS } from '@/lib/workout-generator'
import type { ProgressStats, WeeklyDataPoint } from '@/types'

export async function getProgressStats(): Promise<ProgressStats | null> {
  const profile = await prisma.userProfile.findFirst()
  if (!profile) return null

  const challenge = await prisma.challenge.findFirst({
    where: { isActive: true },
  })
  if (!challenge) return null

  const allWorkouts = await prisma.dailyWorkout.findMany({
    where: { challengeId: challenge.id },
    orderBy: { dayNumber: 'asc' },
  })

  const logs = await prisma.progressLog.findMany({
    where: { userId: profile.id },
  })

  const totalWorkoutsCompleted = allWorkouts.filter((w) => w.isCompleted && !w.isRestDay).length
  const totalReps     = logs.reduce((s, l) => s + l.totalReps, 0)
  const totalMinutes  = logs.reduce((s, l) => s + l.durationMinutes, 0)

  // Current streak (walk back from currentDay - 1)
  let currentStreak = 0
  for (let d = challenge.currentDay - 1; d >= 1; d--) {
    if (REST_DAYS.has(d)) continue
    const w = allWorkouts.find((x) => x.dayNumber === d)
    if (!w || !w.isCompleted) break
    currentStreak++
  }

  // Longest streak
  let longestStreak = 0
  let streak = 0
  for (let d = 1; d <= 28; d++) {
    if (REST_DAYS.has(d)) continue
    const w = allWorkouts.find((x) => x.dayNumber === d)
    if (w?.isCompleted) {
      streak++
      longestStreak = Math.max(longestStreak, streak)
    } else {
      streak = 0
    }
  }

  // Weekly breakdown — 4 weeks, 7 days each
  const WEEK_RANGES = [
    [1, 7], [8, 14], [15, 21], [22, 28],
  ] as const
  const WEEK_LABELS = ['WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4']

  const weeklyData: WeeklyDataPoint[] = WEEK_RANGES.map(([start, end], idx) => {
    const workoutDaysInWeek = Array.from({ length: end - start + 1 }, (_, i) => start + i)
      .filter((d) => !REST_DAYS.has(d))
    const workoutsTotal = workoutDaysInWeek.length
    const workoutsCompleted = allWorkouts.filter(
      (w) => w.dayNumber >= start && w.dayNumber <= end && w.isCompleted && !w.isRestDay,
    ).length
    return {
      weekLabel:        WEEK_LABELS[idx],
      workoutsCompleted,
      workoutsTotal,
      percentage:       workoutsTotal > 0 ? Math.round((workoutsCompleted / workoutsTotal) * 100) : 0,
    }
  })

  const TOTAL_WORKOUT_DAYS = 23
  const completionRate = Math.round((totalWorkoutsCompleted / TOTAL_WORKOUT_DAYS) * 100)

  return {
    totalWorkoutsCompleted,
    currentStreak,
    longestStreak,
    totalReps,
    totalMinutes,
    weeklyData,
    completionRate,
  }
}
