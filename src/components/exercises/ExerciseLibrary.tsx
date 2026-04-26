'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ExerciseCategory } from '@/types'

interface ExerciseItem {
  id: string
  name: string
  category: ExerciseCategory
  description: string
  musclesTargeted: string[]
  formCues: string[]
  equipment: string[]
  fitnessLevels: string[]
}

interface Props {
  exercises: ExerciseItem[]
}

const CATEGORIES: { value: ExerciseCategory | 'all'; label: string }[] = [
  { value: 'all',       label: 'ALL'      },
  { value: 'push',      label: 'PUSH'     },
  { value: 'pull',      label: 'PULL'     },
  { value: 'core',      label: 'CORE'     },
  { value: 'legs',      label: 'LEGS'     },
  { value: 'cardio',    label: 'CARDIO'   },
  { value: 'full_body', label: 'FULL BODY'},
]

const LEVEL_COLOR: Record<string, string> = {
  Recruit:  'text-olive-light border-olive-drab',
  Soldier:  'text-desert-tan border-desert-tan',
  Operator: 'text-blaze border-blaze',
}

function ExerciseCard({ ex }: { ex: ExerciseItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="clip-dogtag-sm bg-dark-surface border border-dark-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-start justify-between gap-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="font-heading text-sm text-text-primary leading-tight">
            {ex.name.toUpperCase()}
          </div>
          <div className="text-xs text-text-muted font-body mt-0.5">
            {ex.musclesTargeted.slice(0, 3).join(' · ')}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          <span className={cn(
            'text-stencil text-[8px] border rounded px-1 py-0.5 leading-none uppercase',
            LEVEL_COLOR[ex.fitnessLevels[0]] ?? 'text-text-muted border-dark-border',
          )}>
            {ex.fitnessLevels[0]}
          </span>
          {open ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-dark-border pt-3">
              <p className="text-xs text-text-secondary font-body leading-relaxed">{ex.description}</p>

              {ex.formCues.length > 0 && (
                <div>
                  <p className="text-stencil text-[8px] text-olive-light tracking-widest mb-1.5">FORM CUES</p>
                  <ul className="space-y-1">
                    {ex.formCues.map((cue, i) => (
                      <li key={i} className="text-xs text-text-muted font-body flex gap-2">
                        <span className="text-olive-drab flex-shrink-0">▸</span>
                        {cue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {ex.equipment.length > 0 && ex.equipment[0] !== 'none' && (
                  <div>
                    <p className="text-stencil text-[8px] text-text-muted tracking-widest mb-1">EQUIPMENT</p>
                    <div className="flex flex-wrap gap-1">
                      {ex.equipment.map((eq) => (
                        <span key={eq} className="text-stencil text-[8px] border border-dark-border text-text-muted rounded px-1.5 py-0.5">
                          {eq.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="text-stencil text-[8px] text-text-muted tracking-widest mb-1">LEVELS</p>
                <div className="flex gap-2">
                  {ex.fitnessLevels.map((lvl) => (
                    <span
                      key={lvl}
                      className={cn(
                        'text-stencil text-[8px] border rounded px-1.5 py-0.5',
                        LEVEL_COLOR[lvl] ?? 'text-text-muted border-dark-border',
                      )}
                    >
                      {lvl.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ExerciseLibrary({ exercises }: Props) {
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | 'all'>('all')

  const filtered = activeCategory === 'all'
    ? exercises
    : exercises.filter((ex) => ex.category === activeCategory)

  return (
    <div className="min-h-screen bg-matte-black">
      <header className="px-4 pt-10 pb-4">
        <p className="text-stencil text-[9px] text-olive-light tracking-widest">◆ ARMORY ◆</p>
        <h1 className="font-heading text-headline text-text-primary leading-none">EXERCISE LIBRARY</h1>
      </header>

      {/* Category filter strip */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              className={cn(
                'flex-shrink-0 text-stencil text-[9px] tracking-widest px-3 py-1.5 rounded border transition-colors',
                activeCategory === value
                  ? 'bg-olive-drab border-olive-drab text-text-primary'
                  : 'border-dark-border text-text-muted hover:border-olive-drab hover:text-text-secondary',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-24 space-y-2">
        <p className="text-stencil text-[9px] text-text-muted tracking-widest mb-3">
          {filtered.length} EXERCISE{filtered.length !== 1 ? 'S' : ''} IN DATABASE
        </p>
        {filtered.map((ex) => (
          <ExerciseCard key={ex.id} ex={ex} />
        ))}
      </div>
    </div>
  )
}
