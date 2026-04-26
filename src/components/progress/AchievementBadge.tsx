import { Award, Lock } from 'lucide-react'
import type { AchievementType } from '@/types'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { cn } from '@/lib/cn'

type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'

const RARITY_BORDER: Record<Rarity, string> = {
  common:    'border-olive-drab',
  uncommon:  'border-desert-tan',
  rare:      'border-blaze',
  legendary: 'border-yellow-400',
}

const RARITY_ICON: Record<Rarity, string> = {
  common:    'text-olive-light',
  uncommon:  'text-desert-tan',
  rare:      'text-blaze',
  legendary: 'text-yellow-400',
}

interface Props {
  type: AchievementType
  earned: boolean
  earnedAt?: string
}

export function AchievementBadge({ type, earned, earnedAt }: Props) {
  const def    = ACHIEVEMENTS[type]
  const rarity = def.rarity

  return (
    <div
      className={cn(
        'clip-dogtag-sm border px-4 py-3 flex items-center gap-3',
        earned ? 'bg-dark-surface' : 'bg-off-black',
        earned ? RARITY_BORDER[rarity] : 'border-dark-border',
        !earned && 'opacity-50',
        rarity === 'legendary' && earned && 'shadow-[0_0_12px_rgba(250,204,21,0.25)]',
      )}
    >
      <div className={cn('flex-shrink-0', earned ? RARITY_ICON[rarity] : 'text-text-muted')}>
        {earned ? <Award size={20} /> : <Lock size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn('font-heading text-sm leading-tight', earned ? 'text-text-primary' : 'text-text-muted')}>
          {earned ? def.name : '???'}
        </div>
        <div className="text-xs text-text-muted font-body leading-snug mt-0.5">
          {earned ? def.description : 'Keep pushing to unlock'}
        </div>
        {earned && earnedAt && (
          <div className="text-stencil text-[8px] text-text-muted mt-1 tracking-wide">
            {new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
      </div>
      {earned && (
        <div className={cn('text-stencil text-[8px] flex-shrink-0 uppercase tracking-widest', RARITY_ICON[rarity])}>
          {rarity}
        </div>
      )}
    </div>
  )
}
