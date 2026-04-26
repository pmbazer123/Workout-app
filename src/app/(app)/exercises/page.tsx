import { prisma } from '@/lib/prisma'
import { fromJson } from '@/lib/db-helpers'
import { ExerciseLibrary } from '@/components/exercises/ExerciseLibrary'
import type { ExerciseCategory } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({ orderBy: { name: 'asc' } })

  const data = exercises.map((ex) => ({
    id:              ex.id,
    name:            ex.name,
    category:        ex.category as ExerciseCategory,
    description:     ex.description,
    musclesTargeted: fromJson<string[]>(ex.musclesTargeted) ?? [],
    formCues:        fromJson<string[]>(ex.formCues) ?? [],
    equipment:       fromJson<string[]>(ex.equipment) ?? [],
    fitnessLevels:   fromJson<string[]>(ex.fitnessLevels) ?? [],
  }))

  return <ExerciseLibrary exercises={data} />
}
