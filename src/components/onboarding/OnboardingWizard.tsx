'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, CheckCircle2, Zap, Shield, Target,
  Dumbbell, BarChart2, Wind, Layers, Circle,
} from 'lucide-react'
import { saveOnboardingProfile } from '@/actions/onboarding'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { AgeRange, FitnessLevel, Goal, Equipment } from '@/types'

// ── slide variants ───────────────────────────────────────────────────────────

function slideVariants(dir: number) {
  return {
    initial: { x: dir > 0 ? '60%' : '-60%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 28 } },
    exit:    { x: dir > 0 ? '-60%' : '60%', opacity: 0, transition: { duration: 0.18 } },
  }
}

// ── option card ──────────────────────────────────────────────────────────────

function OptionCard({
  selected, onClick, title, subtitle, icon: Icon,
}: {
  selected: boolean
  onClick: () => void
  title: string
  subtitle?: string
  icon?: React.ElementType
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'clip-dogtag-sm w-full text-left px-5 py-4 border transition-all duration-150',
        'flex items-start gap-3',
        selected
          ? 'bg-olive-dark border-blaze text-text-primary shadow-dog-tag'
          : 'bg-dark-surface border-dark-border text-text-secondary hover:border-olive-drab hover:text-text-primary',
      )}
    >
      {Icon && (
        <div className={cn(
          'mt-0.5 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-sm',
          selected ? 'text-blaze' : 'text-text-muted',
        )}>
          <Icon size={18} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={cn(
          'font-heading text-stencil text-sm',
          selected ? 'text-text-primary' : 'text-text-secondary',
        )}>
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-text-muted mt-0.5 font-body leading-relaxed">{subtitle}</div>
        )}
      </div>
      <div className={cn(
        'flex-shrink-0 mt-0.5',
        selected ? 'text-blaze' : 'text-dark-border',
      )}>
        {selected ? <CheckCircle2 size={16} /> : <Circle size={16} />}
      </div>
    </motion.button>
  )
}

// ── step indicator ───────────────────────────────────────────────────────────

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 24 : 6,
            backgroundColor: i < current ? '#556B2F' : i === current ? '#FF5722' : '#2A2A2A',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="h-1.5 rounded-full"
        />
      ))}
    </div>
  )
}

// ── main wizard ──────────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const [step, setStep]               = useState(0)
  const [dir,  setDir]                = useState(1)
  const [ageRange,     setAgeRange]   = useState<AgeRange | null>(null)
  const [fitnessLevel, setFitness]    = useState<FitnessLevel | null>(null)
  const [goals,        setGoals]      = useState<Goal[]>([])
  const [equipment,    setEquipment]  = useState<Equipment[]>(['none'])
  const [isPending,    startTransition] = useTransition()

  const TOTAL_STEPS = 6  // 0-welcome, 1-age, 2-fitness, 3-goals, 4-equipment, 5-review

  function next() { setDir(1); setStep((s) => s + 1) }
  function back() { setDir(-1); setStep((s) => s - 1) }

  function toggleGoal(g: Goal) {
    setGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])
  }

  function toggleEquipment(e: Equipment) {
    if (e === 'none') {
      setEquipment(['none'])
      return
    }
    setEquipment((prev) => {
      const without = prev.filter((x) => x !== 'none')
      return without.includes(e) ? without.filter((x) => x !== e) : [...without, e]
    })
  }

  function deploy() {
    if (!ageRange || !fitnessLevel || goals.length === 0) return
    const eq = equipment.length === 0 ? (['none'] as Equipment[]) : equipment
    startTransition(() => {
      saveOnboardingProfile({ ageRange, fitnessLevel, goals, equipment: eq })
    })
  }

  const variants = slideVariants(dir)

  // ── step content ────────────────────────────────────────────────────────────

  function renderStep() {
    switch (step) {

      // ── WELCOME ──────────────────────────────────────────────────────────────
      case 0: return (
        <div className="flex flex-col items-center text-center gap-8 max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-stencil text-xs text-blaze mb-3 tracking-[0.3em]">
              ◆ CLASSIFIED BRIEFING ◆
            </div>
            <h1 className="font-heading text-display leading-none text-text-primary">
              28-DAY<br />
              <span className="text-blaze">CHALLENGE</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 text-text-secondary font-body"
          >
            <p className="text-sm leading-relaxed">
              23 workouts. 5 rest days. Zero excuses.
            </p>
            <p className="text-sm leading-relaxed">
              Military-grade programming adapted to your fitness level.
              Complete the mission. Earn your stripes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
            className="w-full grid grid-cols-3 gap-3 py-4 px-6 bg-dark-surface border border-dark-border clip-dogtag-sm"
          >
            {[
              { label: '28', sub: 'DAYS' },
              { label: '23', sub: 'MISSIONS' },
              { label: '∞',  sub: 'GRIT' },
            ].map(({ label, sub }) => (
              <div key={sub} className="text-center">
                <div className="font-heading text-2xl text-blaze">{label}</div>
                <div className="text-stencil text-[10px] text-text-muted">{sub}</div>
              </div>
            ))}
          </motion.div>

          <Button size="lg" onClick={next} className="w-full max-w-xs">
            ENLIST NOW <ChevronRight size={16} />
          </Button>
        </div>
      )

      // ── AGE RANGE ─────────────────────────────────────────────────────────────
      case 1: return (
        <div className="w-full max-w-sm space-y-6">
          <div>
            <div className="text-stencil text-xs text-blaze mb-1 tracking-[0.3em]">STEP 1 OF 4</div>
            <h2 className="font-heading text-title text-text-primary">SELECT YOUR<br />AGE RANGE</h2>
            <p className="text-text-muted text-sm mt-1">Program intensity is calibrated per age group.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: '18-25', label: '18 – 25', sub: 'Peak recovery. Max intensity.' },
              { value: '26-35', label: '26 – 35', sub: 'Prime years. Strength focus.' },
              { value: '36-45', label: '36 – 45', sub: 'Smart training. Joint aware.' },
              { value: '46+',   label: '46+',     sub: 'Experience. Controlled power.' },
            ] as { value: AgeRange; label: string; sub: string }[]).map(({ value, label, sub }) => (
              <OptionCard
                key={value}
                selected={ageRange === value}
                onClick={() => setAgeRange(value)}
                title={label}
                subtitle={sub}
              />
            ))}
          </div>
          <NavRow onBack={back} onNext={next} nextDisabled={!ageRange} />
        </div>
      )

      // ── FITNESS LEVEL ─────────────────────────────────────────────────────────
      case 2: return (
        <div className="w-full max-w-sm space-y-6">
          <div>
            <div className="text-stencil text-xs text-blaze mb-1 tracking-[0.3em]">STEP 2 OF 4</div>
            <h2 className="font-heading text-title text-text-primary">SELECT YOUR<br />RANK</h2>
            <p className="text-text-muted text-sm mt-1">Be honest — the wrong rank breaks results.</p>
          </div>
          <div className="space-y-3">
            {([
              {
                value: 'Recruit',
                icon: Shield,
                sub: 'New to training or returning after a long break. Push-ups, squats, planks.',
              },
              {
                value: 'Soldier',
                icon: Zap,
                sub: 'Training consistently for 3+ months. Ready for pull-ups, burpees, dips.',
              },
              {
                value: 'Operator',
                icon: Target,
                sub: 'Advanced athlete. Muscle-ups, pistol squats, handstands.',
              },
            ] as { value: FitnessLevel; icon: React.ElementType; sub: string }[]).map(({ value, icon, sub }) => (
              <OptionCard
                key={value}
                selected={fitnessLevel === value}
                onClick={() => setFitness(value)}
                icon={icon}
                title={value.toUpperCase()}
                subtitle={sub}
              />
            ))}
          </div>
          <NavRow onBack={back} onNext={next} nextDisabled={!fitnessLevel} />
        </div>
      )

      // ── GOALS ─────────────────────────────────────────────────────────────────
      case 3: return (
        <div className="w-full max-w-sm space-y-6">
          <div>
            <div className="text-stencil text-xs text-blaze mb-1 tracking-[0.3em]">STEP 3 OF 4</div>
            <h2 className="font-heading text-title text-text-primary">SELECT YOUR<br />OBJECTIVES</h2>
            <p className="text-text-muted text-sm mt-1">Choose all that apply.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'strength',    icon: Dumbbell,  label: 'STRENGTH',   sub: 'Build raw power' },
              { value: 'endurance',   icon: Wind,      label: 'ENDURANCE',  sub: 'Go the distance' },
              { value: 'weight_loss', icon: BarChart2, label: 'FAT LOSS',   sub: 'Burn and lean' },
              { value: 'conditioning',icon: Layers,    label: 'ALL-AROUND', sub: 'Complete warrior' },
            ] as { value: Goal; icon: React.ElementType; label: string; sub: string }[]).map((opt) => (
              <OptionCard
                key={opt.value}
                selected={goals.includes(opt.value)}
                onClick={() => toggleGoal(opt.value)}
                icon={opt.icon}
                title={opt.label}
                subtitle={opt.sub}
              />
            ))}
          </div>
          <NavRow onBack={back} onNext={next} nextDisabled={goals.length === 0} />
        </div>
      )

      // ── EQUIPMENT ─────────────────────────────────────────────────────────────
      case 4: return (
        <div className="w-full max-w-sm space-y-6">
          <div>
            <div className="text-stencil text-xs text-blaze mb-1 tracking-[0.3em]">STEP 4 OF 4</div>
            <h2 className="font-heading text-title text-text-primary">AVAILABLE<br />EQUIPMENT</h2>
            <p className="text-text-muted text-sm mt-1">Selecting None gives you a pure bodyweight program.</p>
          </div>
          <div className="space-y-3">
            {([
              { value: 'none',             label: 'NONE',             sub: 'Bodyweight only — no gear needed' },
              { value: 'pull_up_bar',      label: 'PULL-UP BAR',      sub: 'Unlocks pull-ups, hanging raises' },
              { value: 'dip_bars',         label: 'DIP BARS',         sub: 'Unlocks dips, L-sits' },
              { value: 'resistance_bands', label: 'RESISTANCE BANDS', sub: 'Added load for rows and presses' },
              { value: 'dumbbells',        label: 'DUMBBELLS',        sub: 'Optional loaded movements' },
            ] as { value: Equipment; label: string; sub: string }[]).map((opt) => (
              <OptionCard
                key={opt.value}
                selected={equipment.includes(opt.value)}
                onClick={() => toggleEquipment(opt.value)}
                title={opt.label}
                subtitle={opt.sub}
              />
            ))}
          </div>
          <NavRow onBack={back} onNext={next} nextDisabled={equipment.length === 0} />
        </div>
      )

      // ── REVIEW ────────────────────────────────────────────────────────────────
      case 5: return (
        <div className="w-full max-w-sm space-y-6">
          <div>
            <div className="text-stencil text-xs text-blaze mb-1 tracking-[0.3em]">◆ MISSION BRIEF ◆</div>
            <h2 className="font-heading text-title text-text-primary">CONFIRM &amp;<br />DEPLOY</h2>
          </div>

          <div className="clip-dogtag bg-dark-surface border border-olive-drab p-5 space-y-4">
            {[
              { label: 'AGE RANGE',  value: ageRange ?? '—' },
              { label: 'RANK',       value: fitnessLevel ?? '—' },
              {
                label: 'OBJECTIVES',
                value: goals.map((g) => ({
                  strength: 'STRENGTH', endurance: 'ENDURANCE',
                  weight_loss: 'FAT LOSS', conditioning: 'ALL-AROUND',
                }[g])).join(', ') || '—',
              },
              {
                label: 'EQUIPMENT',
                value: equipment.map((e) => ({
                  none: 'NONE', pull_up_bar: 'PULL-UP BAR', dip_bars: 'DIP BARS',
                  resistance_bands: 'BANDS', dumbbells: 'DUMBBELLS',
                }[e])).join(', ') || '—',
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="text-stencil text-[10px] text-text-muted w-24 flex-shrink-0 pt-0.5">{label}</div>
                <div className="text-sm font-body text-text-primary font-medium">{value}</div>
              </div>
            ))}
          </div>

          <p className="text-xs text-text-muted text-center font-body">
            Your 28-day program will be generated now. You can reset anytime from the settings.
          </p>

          <Button size="lg" onClick={deploy} loading={isPending} className="w-full">
            DEPLOY TO FIELD <ChevronRight size={16} />
          </Button>

          <button
            onClick={back}
            className="w-full text-center text-text-muted text-xs font-body hover:text-text-secondary transition-colors"
          >
            ← Adjust briefing
          </button>
        </div>
      )

      default: return null
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
      {/* Logo mark */}
      <div className="text-center">
        <div className="text-stencil text-[10px] text-text-muted tracking-[0.4em]">
          ■ COMBAT FITNESS ■
        </div>
      </div>

      {/* Step dots (hidden on welcome) */}
      {step > 0 && (
        <StepDots total={TOTAL_STEPS - 1} current={step - 1} />
      )}

      {/* Animated step content */}
      <div className="relative overflow-hidden" style={{ minHeight: 440 }}>
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── shared nav row ───────────────────────────────────────────────────────────

function NavRow({
  onBack, onNext, nextDisabled,
}: { onBack: () => void; onNext: () => void; nextDisabled: boolean }) {
  return (
    <div className="flex gap-3 pt-2">
      <Button variant="secondary" size="md" onClick={onBack} className="flex-shrink-0">
        <ChevronLeft size={14} />
      </Button>
      <Button
        size="md"
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1"
      >
        CONTINUE <ChevronRight size={14} />
      </Button>
    </div>
  )
}
