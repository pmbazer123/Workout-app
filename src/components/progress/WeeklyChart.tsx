import type { WeeklyDataPoint } from '@/types'

interface Props {
  data: WeeklyDataPoint[]
}

export function WeeklyChart({ data }: Props) {
  return (
    <div className="clip-dogtag bg-dark-surface border border-dark-border p-4">
      <p className="text-stencil text-[9px] text-text-muted tracking-[0.3em] mb-4">
        ◆ WEEKLY BREAKDOWN ◆
      </p>
      <div className="flex items-end gap-3 h-28">
        {data.map((week) => (
          <div key={week.weekLabel} className="flex-1 flex flex-col items-center gap-1.5">
            {/* Bar */}
            <div className="w-full flex-1 relative flex items-end">
              {/* Background track */}
              <div className="absolute inset-0 bg-dark-border rounded-sm" />
              {/* Fill — segmented look via repeating gradient */}
              <div
                className="relative w-full bg-olive-drab rounded-sm transition-all duration-500"
                style={{
                  height: week.percentage > 0 ? `${Math.max(4, week.percentage)}%` : '4px',
                  background: week.percentage > 0
                    ? 'repeating-linear-gradient(180deg, #556B2F 0px, #556B2F 6px, #3D4F22 6px, #3D4F22 8px)'
                    : undefined,
                }}
              />
            </div>
            {/* Label */}
            <span className="text-stencil text-[8px] text-text-muted leading-none">
              {week.weekLabel.replace('WEEK ', 'W')}
            </span>
            <span className="text-stencil text-[9px] text-olive-light leading-none">
              {week.workoutsCompleted}/{week.workoutsTotal}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
