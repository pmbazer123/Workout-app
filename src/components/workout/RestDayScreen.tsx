'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, BedDouble } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Activity {
  title: string
  duration: string
  description: string
}

interface Props {
  dayNum: number
  phaseLabel: string
  activities: Activity[]
  nextWorkoutDay: number
}

export function RestDayScreen({ dayNum, phaseLabel, activities, nextWorkoutDay }: Props) {
  return (
    <div className="min-h-screen bg-matte-black">
      <header className="px-4 pt-10 pb-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-text-muted hover:text-text-secondary transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <p className="text-stencil text-[9px] text-olive-light tracking-widest">{phaseLabel}</p>
          <h1 className="font-heading text-xl text-text-primary">DAY {dayNum} · REST</h1>
        </div>
      </header>

      <div className="px-4 pb-8 space-y-6">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="clip-dogtag bg-dark-surface border border-olive-drab p-6 text-center space-y-3"
        >
          <BedDouble size={32} className="text-olive-light mx-auto" />
          <h2 className="font-heading text-headline text-text-primary leading-none">
            RECOVERY<br />IS A WEAPON
          </h2>
          <p className="text-sm text-text-secondary font-body leading-relaxed">
            Today you rest. Muscles grow during recovery, not during training.
            Use this day with intent — not as an excuse.
          </p>
        </motion.div>

        {/* Recovery activities */}
        <div>
          <p className="text-stencil text-[9px] text-text-muted tracking-[0.3em] mb-3">
            ◆ RECOMMENDED ACTIVITIES ◆
          </p>
          <div className="space-y-3">
            {activities.map((act, i) => (
              <motion.div
                key={act.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="clip-dogtag-sm bg-dark-surface border border-dark-border px-4 py-3 flex gap-4 items-start"
              >
                <div className="flex-1">
                  <div className="font-heading text-sm text-text-primary tracking-wide">
                    {act.title}
                  </div>
                  <p className="text-xs text-text-muted font-body mt-0.5 leading-relaxed">
                    {act.description}
                  </p>
                </div>
                <div className="text-stencil text-[9px] text-olive-light flex-shrink-0 pt-0.5">
                  {act.duration}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA to next workout */}
        <div className="pt-2">
          <Link href={`/workout/${nextWorkoutDay}`}>
            <Button size="lg" className="w-full">
              TOMORROW: DAY {nextWorkoutDay} <ChevronRight size={16} />
            </Button>
          </Link>
          <Link href="/dashboard">
            <button className="w-full text-center text-text-muted text-xs font-body hover:text-text-secondary transition-colors mt-3">
              ← Return to base
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
