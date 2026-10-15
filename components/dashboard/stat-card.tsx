import type { ElementType } from 'react'

export function StatCard({
  label,
  value,
  change,
  detail,
  icon: Icon,
  badgeTone = 'success',
}: {
  label: string
  value: string | number
  change?: string
  detail: string
  icon?: ElementType
  badgeTone?: 'success' | 'neutral' | 'accent' | 'warning'
}) {
  const badgeClasses = {
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    neutral: 'bg-v-inset text-v-secondary border border-v-border',
    accent: 'bg-v-accent/10 text-v-accent border border-v-accent/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  }[badgeTone]

  return (
    <div className="rounded-[22px] border border-v-border bg-v-surface p-5 transition-all hover:border-v-accent/40 shadow-xs flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-v-muted-text">{label}</p>
        {Icon && (
          <div className="grid size-8 place-items-center rounded-xl bg-v-raised text-v-secondary border border-v-border">
            <Icon className="size-4" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-v-text">{value}</p>
          {change && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeClasses}`}>
              {change}
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-v-secondary leading-snug">{detail}</p>
      </div>
    </div>
  )
}
