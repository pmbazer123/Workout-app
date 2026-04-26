'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateWorkoutForDay } from '@/lib/workout-generator'
import { toJson } from '@/lib/db-helpers'
import type { FitnessLevel, AgeRange, Goal, Equipment } from '@/types'

export async function saveOnboardingProfile(data: {
  ageRange: AgeRange
  fitnessLevel: FitnessLevel
  goals: Goal[]
  equipment: Equipment[]
}) {
  // Single-user app: wipe any prior data and start fresh
  await prisma.challenge.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.progressLog.deleteMany()
  await prisma.userProfile.deleteMany()

  const profile = await prisma.userProfile.create({
    data: {
      ageRange:     data.ageRange,
      fitnessLevel: data.fitnessLevel,
      goals:        toJson(data.goals),
      equipment:    toJson(data.equipment),
    },
  })

  const challenge = await prisma.challenge.create({
    data: {
      userId:    profile.id,
      startDate: new Date(),
      currentDay: 1,
      isActive:  true,
    },
  })

  const exercises = await prisma.exercise.findMany({ select: { id: true, name: true } })
  const exerciseIdMap = new Map(exercises.map((e) => [e.name, e.id]))

  // Pre-generate all 28 daily workouts so the calendar has data from day 1
  for (let day = 1; day <= 28; day++) {
    const result = generateWorkoutForDay(
      day,
      data.fitnessLevel,
      data.equipment,
      exerciseIdMap,
    )
    await prisma.dailyWorkout.create({
      data: {
        challengeId: challenge.id,
        dayNumber:   day,
        exercises:   'isRestDay' in result ? toJson([]) : toJson(result.exercises),
        isRestDay:   'isRestDay' in result,
        isCompleted: false,
      },
    })
  }

  redirect('/dashboard')
}
