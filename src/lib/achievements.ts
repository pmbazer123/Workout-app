import type { AchievementType, AchievementMetadata } from '@/types'

export interface AchievementDef {
  type: AchievementType
  name: string
  description: string
  icon: string        // Lucide icon name
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  colorClass: string  // Tailwind bg + text classes
  glowClass?: string
}

export const ACHIEVEMENTS: Record<AchievementType, AchievementDef> = {
  FIRST_MISSION: {
    type: 'FIRST_MISSION',
    name: 'FIRST MISSION',
    description: 'Completed Day 1. The hardest step is always the first.',
    icon: 'Target',
    rarity: 'common',
    colorClass: 'bg-olive-dark text-desert-tan',
  },
  WEEK_1_COMPLETE: {
    type: 'WEEK_1_COMPLETE',
    name: 'BOOT CAMP GRAD',
    description: 'Survived Week 1 Foundation phase. You earned your boots.',
    icon: 'Award',
    rarity: 'uncommon',
    colorClass: 'bg-olive-drab text-desert-light',
    glowClass: 'glow-olive',
  },
  WEEK_2_COMPLETE: {
    type: 'WEEK_2_COMPLETE',
    name: 'FIELD READY',
    description: 'Completed Week 2 Building phase. You are no longer raw.',
    icon: 'Shield',
    rarity: 'uncommon',
    colorClass: 'bg-olive-light text-matte-black',
    glowClass: 'glow-olive',
  },
  WEEK_3_COMPLETE: {
    type: 'WEEK_3_COMPLETE',
    name: 'COMBAT TESTED',
    description: "Pushed through Week 3 Intensity. What doesn't kill you…",
    icon: 'Flame',
    rarity: 'rare',
    colorClass: 'bg-blaze text-white',
    glowClass: 'glow-blaze',
  },
  CAMPAIGN_COMPLETE: {
    type: 'CAMPAIGN_COMPLETE',
    name: 'CAMPAIGN COMPLETE',
    description: 'All 28 days. Every rep. Every sweat drop. Warrior.',
    icon: 'Trophy',
    rarity: 'legendary',
    colorClass: 'bg-desert-tan text-matte-black',
    glowClass: 'glow-tan',
  },
  STREAK_3: {
    type: 'STREAK_3',
    name: '3-DAY PATROL',
    description: '3 workouts in a row. Keep moving, soldier.',
    icon: 'Zap',
    rarity: 'common',
    colorClass: 'bg-dark-surface border border-olive-drab text-desert-tan',
  },
  STREAK_7: {
    type: 'STREAK_7',
    name: 'WEEKLY WARRIOR',
    description: '7-day streak. One full week of discipline.',
    icon: 'Star',
    rarity: 'uncommon',
    colorClass: 'bg-olive-drab text-desert-light',
    glowClass: 'glow-olive',
  },
  STREAK_14: {
    type: 'STREAK_14',
    name: 'IRON DISCIPLINE',
    description: 'Two straight weeks. No excuses, no days off.',
    icon: 'Crosshair',
    rarity: 'rare',
    colorClass: 'bg-blaze-dark text-white',
    glowClass: 'glow-blaze',
  },
  STREAK_28: {
    type: 'STREAK_28',
    name: 'NEVER QUIT',
    description: '28 straight days. You are built different.',
    icon: 'Crown',
    rarity: 'legendary',
    colorClass: 'bg-desert-tan text-matte-black',
    glowClass: 'glow-tan',
  },
  IRON_WILL: {
    type: 'IRON_WILL',
    name: 'IRON WILL',
    description: 'Came back strong after a rest day. Rest was the weapon.',
    icon: 'Hammer',
    rarity: 'common',
    colorClass: 'bg-dark-surface border border-olive-drab text-desert-tan',
  },
  NO_RETREAT: {
    type: 'NO_RETREAT',
    name: 'NO RETREAT',
    description: 'Three workouts back-to-back without retreating.',
    icon: 'ArrowRight',
    rarity: 'common',
    colorClass: 'bg-dark-surface border border-olive-light text-olive-light',
  },
  EARLY_BIRD: {
    type: 'EARLY_BIRD',
    name: 'DAWN PATROL',
    description: 'Workout complete before 07:00. While they slept, you trained.',
    icon: 'Sunrise',
    rarity: 'uncommon',
    colorClass: 'bg-desert-dark text-off-black',
    glowClass: 'glow-tan',
  },
  NIGHT_OPS: {
    type: 'NIGHT_OPS',
    name: 'NIGHT OPS',
    description: 'Completed a workout after 22:00. Darkness is no excuse.',
    icon: 'Moon',
    rarity: 'uncommon',
    colorClass: 'bg-off-black border border-blaze text-blaze-light',
    glowClass: 'glow-blaze',
  },
  CENTURY: {
    type: 'CENTURY',
    name: 'CENTURY MARK',
    description: '100 reps in a single session. The century is done.',
    icon: 'Medal',
    rarity: 'rare',
    colorClass: 'bg-blaze text-white',
    glowClass: 'glow-blaze',
  },
  ENDURANCE: {
    type: 'ENDURANCE',
    name: 'LONG MARCH',
    description: 'Over 60 minutes total workout time. Endurance is a choice.',
    icon: 'Timer',
    rarity: 'uncommon',
    colorClass: 'bg-olive-drab text-desert-tan',
    glowClass: 'glow-olive',
  },
  PROMOTION_SOLDIER: {
    type: 'PROMOTION_SOLDIER',
    name: 'PROMOTED: SOLDIER',
    description: 'Recruit to Soldier. Week 2 forged a better version of you.',
    icon: 'TrendingUp',
    rarity: 'rare',
    colorClass: 'bg-olive-light text-matte-black',
    glowClass: 'glow-olive',
  },
  PROMOTION_OPERATOR: {
    type: 'PROMOTION_OPERATOR',
    name: 'PROMOTED: OPERATOR',
    description: 'Soldier to Operator. Week 3 revealed your true ceiling.',
    icon: 'ChevronUp',
    rarity: 'legendary',
    colorClass: 'bg-blaze text-white',
    glowClass: 'glow-blaze',
  },
}

// ── UNLOCK CHECKER ────────────────────────────────────────────────────────────
export interface CompletionCtx {
  dayNumber: number
  completedAt: Date
  totalReps: number
  durationMinutes: number
  existingTypes: AchievementType[]
  fitnessLevel: string
  currentStreak: number
  previousDayWasRest: boolean
}

export function checkNewAchievements(
  ctx: CompletionCtx,
): Array<{ type: AchievementType; metadata: AchievementMetadata }> {
  const earned: Array<{ type: AchievementType; metadata: AchievementMetadata }> = []
  const has = (t: AchievementType) => ctx.existingTypes.includes(t)

  function earn(t: AchievementType, meta: AchievementMetadata = {}) {
    if (!has(t)) earned.push({ type: t, metadata: meta })
  }

  const hour = ctx.completedAt.getHours()

  // Milestone days
  if (ctx.dayNumber === 1)  earn('FIRST_MISSION',    { dayNumber: 1, completedAt: ctx.completedAt.toISOString() })
  if (ctx.dayNumber === 6)  earn('WEEK_1_COMPLETE')
  if (ctx.dayNumber === 14) earn('WEEK_2_COMPLETE')
  if (ctx.dayNumber === 21) earn('WEEK_3_COMPLETE')
  if (ctx.dayNumber === 28) earn('CAMPAIGN_COMPLETE')

  // Streaks (earn incrementally)
  if (ctx.currentStreak >= 3)  earn('STREAK_3',  { streak: ctx.currentStreak })
  if (ctx.currentStreak >= 7)  earn('STREAK_7',  { streak: ctx.currentStreak })
  if (ctx.currentStreak >= 14) earn('STREAK_14', { streak: ctx.currentStreak })
  if (ctx.currentStreak >= 28) earn('STREAK_28', { streak: ctx.currentStreak })

  // Time-of-day
  if (hour < 7)   earn('EARLY_BIRD', { completedAt: ctx.completedAt.toISOString() })
  if (hour >= 22) earn('NIGHT_OPS',  { completedAt: ctx.completedAt.toISOString() })

  // Volume
  if (ctx.totalReps >= 100)    earn('CENTURY',   { totalReps: ctx.totalReps })
  if (ctx.durationMinutes >= 60) earn('ENDURANCE', { durationMinutes: ctx.durationMinutes })

  // Post-rest comeback
  if (ctx.previousDayWasRest) earn('IRON_WILL', { dayNumber: ctx.dayNumber })

  // 3 consecutive non-rest workouts
  if (ctx.currentStreak === 3 && !ctx.previousDayWasRest) earn('NO_RETREAT')

  // Rank promotions (virtual, on week completion)
  if (ctx.fitnessLevel === 'Recruit' && ctx.dayNumber === 14) earn('PROMOTION_SOLDIER')
  if (ctx.fitnessLevel === 'Soldier' && ctx.dayNumber === 21) earn('PROMOTION_OPERATOR')

  return earned
}
