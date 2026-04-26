interface Props {
  value: string | number
  label: string
  sub?: string
}

export function StatsCard({ value, label, sub }: Props) {
  return (
    <div className="clip-dogtag-sm bg-dark-surface border border-dark-border px-4 py-4 text-center">
      <div className="font-heading text-3xl text-blaze leading-none">{value}</div>
      <div className="text-stencil text-[9px] text-text-muted tracking-widest mt-1">{label}</div>
      {sub && <div className="text-xs text-text-muted font-body mt-0.5">{sub}</div>}
    </div>
  )
}
