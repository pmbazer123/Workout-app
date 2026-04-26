'use client'

import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/cn'

export function StreakCounter({ streak }: { streak: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)

  useEffect(() => {
    const controls = animate(count, streak, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    })
    return controls.stop
  }, [streak, count])

  return (
    <div className="clip-dogtag-sm bg-dark-surface border border-olive-drab px-3 py-2 flex items-center gap-2 flex-shrink-0">
      <Flame
        size={15}
        className={cn(streak > 0 ? 'text-blaze animate-pulse-slow' : 'text-text-muted')}
      />
      <div className="text-right">
        <motion.div className="font-heading text-xl leading-none text-text-primary">
          {rounded}
        </motion.div>
        <div className="text-stencil text-[8px] text-text-muted tracking-widest">STREAK</div>
      </div>
    </div>
  )
}
