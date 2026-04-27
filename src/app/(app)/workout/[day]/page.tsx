import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { fromJson } from '@/lib/db-helpers'
import { REST_DAYS, REST_DAY_ACTIVITIES, getPhase } from '@/lib/workout-generator'
import { WorkoutScreen } from '@/components/workout/WorkoutScreen'
import { RestDayScreen } from '@/components/workout/RestDayScreen'
import type { WorkoutExerciseSlot } from '@/types'

export const dynamic = 'force-dynamic'

export default async function WorkoutDayPage({ params }: { params: { day: string } }) {
  const dayNum = parseInt(params.day, 10)
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 28) redirect('/dashboard')

  const challenge = await prisma.challenge.findFirst({
    where: { isActive: true },
    include: { user: true },
  })
  if (!challenge) redirect('/dashboard')

  // Rest day — always accessible
  if (REST_DAYS.has(dayNum)) {
    const { label } = getPhase(dayNum)
    const nextWorkoutDay = dayNum + 1
    return (
      <RestDayScreen
        dayNum={dayNum}
        phaseLabel={label}
        activities={REST_DAY_ACTIVITIES}
        nextWorkoutDay={nextWorkoutDay}
      />
    )
  }

  // Locked days — not yet unlocked
  if (dayNum > challenge.currentDay) {
    redirect('/dashboard')
  }

  const dailyWorkout = await prisma.dailyWorkout.findUnique({
    where: { challengeId_dayNumber: { challengeId: challenge.id, dayNumber: dayNum } },
  })
  if (!dailyWorkout) redirect('/dashboard')

  const exercises = fromJson<WorkoutExerciseSlot[]>(dailyWorkout.exercises) ?? []

  // Fetch exercise details keyed by name
  const exerciseNames = [...new Set(exercises.map((e) => e.exerciseName))]
  const dbExercises = await prisma.exercise.findMany({
    where: { name: { in: exerciseNames } },
    select: { name: true, description: true, musclesTargeted: true, formCues: true },
  })

  const exerciseDetails: Record<string, { formCues: string[]; description: string; musclesTargeted: string[] }> = {}
  for (const ex of dbExercises) {
    exerciseDetails[ex.name] = {
      description:     ex.description,
      musclesTargeted: fromJson<string[]>(ex.musclesTargeted) ?? [],
      formCues:        fromJson<string[]>(ex.formCues) ?? [],
    }
  }

  const { label } = getPhase(dayNum)

  return (
    <WorkoutScreen
      workoutId={dailyWorkout.id}
      dayNumber={dayNum}
      phaseLabel={label}
      initialExercises={exercises}
      exerciseDetails={exerciseDetails}
      isAlreadyCompleted={dailyWorkout.isCompleted}
    />
  )
}
