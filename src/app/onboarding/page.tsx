import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export const metadata = { title: 'ENLIST | COMBAT FITNESS' }

export default async function OnboardingPage() {
  // If a profile already exists, go straight to the dashboard
  const profile = await prisma.userProfile.findFirst()
  if (profile) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-matte-black flex flex-col items-center justify-center px-4 py-12">
      <OnboardingWizard />
    </main>
  )
}
