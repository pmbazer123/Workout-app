// Placeholder — replaced in Milestone 5
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function WorkoutDayPage({ params }: { params: { day: string } }) {
  const profile = await prisma.userProfile.findFirst()
  if (!profile) redirect('/onboarding')

  const dayNum = parseInt(params.day, 10)

  return (
    <div className="min-h-screen bg-matte-black flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <p className="text-stencil text-[10px] text-blaze tracking-widest">◆ DAY {dayNum} ◆</p>
        <h1 className="font-heading text-headline text-text-primary">WORKOUT SCREEN</h1>
        <p className="text-text-muted font-body text-sm">Coming in Milestone 5</p>
      </div>
    </div>
  )
}
