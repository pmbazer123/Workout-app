'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { checkNewAchievements } from '@/lib/achievements'
import { REST_DAYS } from '@/lib/workout-generator'
import { toJson } from '@/lib/db-helpers'
import type { WorkoutExerciseSlot, AchievementType } from '@/types'

export async function completeWorkout(
  dailyWorkoutId: string,
  completedExercises: WorkoutExerciseSlot[],
  durationMinutes: number,
): Promise<{ newAchievements: AchievementType[]; streak: number }> {
  const workout = await prisma.dailyWorkout.findUniqueOrThrow({
    where: { id: dailyWorkoutId },
    include: { challenge: { include: { user: true } } },
  })

  // Idempotent — already done, skip writes
  if (workout.isCompleted) return { newAchievements: [], streak: 0 }

  const now = new Date()
  const totalReps = completedExercises.reduce(
    (sum, ex) => sum + (ex.reps != null ? ex.reps * ex.completedSets : 0),
    0,
  )

  // Mark day complete
  await prisma.dailyWorkout.update({
    where: { id: dailyWorkoutId },
    data: { isCompleted: true, completedAt: now, exercises: toJson(completedExercises) },
  })

  // Advance current day (cap at 29 = "campaign complete" signal)
  await prisma.challenge.update({
    where: { id: workout.challengeId },
    data: { currentDay: Math.min(workout.dayNumber + 1, 29) },
  })

  // Log progress — upsert into today's bucket
  const userId = workout.challenge.userId
  const dateKey = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  await prisma.progressLog.upsert({
    where: { userId_date: { userId, date: dateKey } },
    update: {
      workoutsCompleted: { increment: 1 },
      totalReps:         { increment: totalReps },
      durationMinutes:   { increment: durationMinutes },
    },
    create: { userId, date: dateKey, workoutsCompleted: 1, totalReps, durationMinutes },
  })

  // Compute current streak (walk back skipping rest days)
  const allWorkouts = await prisma.dailyWorkout.findMany({
    where: { challengeId: workout.challengeId },
    orderBy: { dayNumber: 'asc' },
  })
  let streak = 0
  for (let d = workout.dayNumber; d >= 1; d--) {
    const w = allWorkouts.find((x) => x.dayNumber === d)
    if (!w) break
    if (w.isRestDay) continue
    if (!w.isCompleted) break
    streak++
  }

  // Check + award achievements
  const existing = await prisma.achievement.findMany({ where: { userId }, select: { type: true } })
  const newAchs = checkNewAchievements({
    dayNumber:          workout.dayNumber,
    completedAt:        now,
    totalReps,
    durationMinutes,
    existingTypes:      existing.map((a) => a.type as AchievementType),
    fitnessLevel:       workout.challenge.user.fitnessLevel,
    currentStreak:      streak,
    previousDayWasRest: REST_DAYS.has(workout.dayNumber - 1),
  })

  for (const ach of newAchs) {
    await prisma.achievement.upsert({
      where:  { userId_type: { userId, type: ach.type } },
      create: { userId, type: ach.type, earnedAt: now, metadata: toJson(ach.metadata) },
      update: {},
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/progress')

  return { newAchievements: newAchs.map((a) => a.type), streak }
}
