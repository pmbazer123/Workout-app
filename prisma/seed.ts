// Uses relative imports (not @/ alias) — tsx doesn't resolve Next.js path aliases.
import { PrismaClient } from '@prisma/client'
import { EXERCISES } from '../src/lib/exercises-data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱  Seeding exercise library…')

  let created = 0
  let skipped = 0

  for (const ex of EXERCISES) {
    const existing = await prisma.exercise.findUnique({ where: { name: ex.name } })
    if (existing) {
      skipped++
      continue
    }
    await prisma.exercise.create({
      data: {
        name:            ex.name,
        category:        ex.category,
        description:     ex.description,
        musclesTargeted: JSON.stringify(ex.musclesTargeted),
        formCues:        JSON.stringify(ex.formCues),
        equipment:       JSON.stringify(ex.equipment),
        fitnessLevels:   JSON.stringify(ex.fitnessLevels),
      },
    })
    created++
  }

  console.log(`✅  ${created} exercises created, ${skipped} already existed.`)
  console.log('')
  console.log('Ready. Run:  npm run dev')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
