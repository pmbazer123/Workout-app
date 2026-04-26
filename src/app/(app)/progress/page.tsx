import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getProgressStats } from '@/actions/progress'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { StatsCard } from '@/components/progress/StatsCard'
import { WeeklyChart } from '@/components/progress/WeeklyChart'
import { AchievementBadge } from '@/components/progress/AchievementBadge'
import type { AchievementType } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ProgressPage() {
  const profile = await prisma.userProfile.findFirst()
  if (!profile) redirect('/onboarding')

  const [stats, dbAchievements] = await Promise.all([
    getProgressStats(),
    prisma.achievement.findMany({
      where: { userId: profile.id },
      orderBy: { earnedAt: 'asc' },
    }),
  ])

  if (!stats) redirect('/onboarding')

  const earnedSet = new Map(dbAchievements.map((a) => [a.type, a.earnedAt.toISOString()]))
  const allTypes  = Object.keys(ACHIEVEMENTS) as AchievementType[]
  const earnedCount = earnedSet.size

  return (
    <div className="min-h-screen bg-matte-black">
      <header className="px-4 pt-10 pb-4">
        <p className="text-stencil text-[9px] text-olive-light tracking-widest">◆ FIELD REPORT ◆</p>
        <h1 className="font-heading text-headline text-text-primary leading-none">PROGRESS</h1>
      </header>

      <div className="px-4 pb-24 space-y-6">

        {/* Completion bar */}
        <div className="clip-dogtag bg-dark-surface border border-olive-drab p-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-stencil text-[9px] text-text-muted tracking-widest">CAMPAIGN PROGRESS</span>
            <span className="font-heading text-2xl text-blaze">{stats.completionRate}%</span>
          </div>
          <div className="flex gap-0.5 h-3">
            {Array.from({ length: 23 }).map((_, i) => (
              <div
                key={i}
                className={
                  i < stats.totalWorkoutsCompleted
                    ? 'flex-1 bg-olive-drab rounded-sm'
                    : 'flex-1 bg-dark-border rounded-sm'
                }
              />
            ))}
          </div>
          <p className="text-xs text-text-muted font-body mt-2">
            {stats.totalWorkoutsCompleted} / 23 MISSIONS COMPLETE
          </p>
        </div>

        {/* Stats grid */}
        <div>
          <p className="text-stencil text-[9px] text-text-muted tracking-[0.3em] mb-3">◆ STATS ◆</p>
          <div className="grid grid-cols-2 gap-3">
            <StatsCard value={stats.currentStreak} label="CURRENT STREAK" sub="days" />
            <StatsCard value={stats.longestStreak} label="LONGEST STREAK" sub="days" />
            <StatsCard value={stats.totalWorkoutsCompleted} label="MISSIONS DONE" />
            <StatsCard value={`${stats.completionRate}%`} label="COMPLETION RATE" />
            <StatsCard value={stats.totalReps.toLocaleString()} label="TOTAL REPS" />
            <StatsCard value={stats.totalMinutes} label="TOTAL MINUTES" />
          </div>
        </div>

        {/* Weekly chart */}
        <WeeklyChart data={stats.weeklyData} />

        {/* Achievements */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-stencil text-[9px] text-text-muted tracking-[0.3em]">◆ BADGES ◆</p>
            <span className="text-stencil text-[9px] text-olive-light">
              {earnedCount} / {allTypes.length} UNLOCKED
            </span>
          </div>
          <div className="space-y-2">
            {allTypes.map((type) => (
              <AchievementBadge
                key={type}
                type={type}
                earned={earnedSet.has(type)}
                earnedAt={earnedSet.get(type)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
