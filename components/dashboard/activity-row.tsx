import { Check, Network, X } from 'lucide-react'
import { getActivityTone } from '@/lib/constants'
import type { ActivityEvent } from '@/lib/types'

type ActivityLike = Pick<ActivityEvent, 'id' | 'event_type' | 'label' | 'subject' | 'created_at'>

export function ActivityRow({ activity }: { activity: ActivityLike }) {
  const tone = getActivityTone(activity.event_type)

  return (
    <div className="flex items-center gap-3 border-b border-v-border-faint py-4 last:border-0">
      <div
        className={`grid size-8 place-items-center rounded-full ${
          tone === 'accent'
            ? 'bg-v-accent text-v-accent-fg'
            : tone === 'muted'
              ? 'bg-v-muted text-v-secondary'
              : 'bg-v-success-bg text-v-success'
        }`}
      >
        {tone === 'accent' ? <X className="size-3.5" /> : tone === 'muted' ? <Network className="size-3.5" /> : <Check className="size-3.5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-v-text">{activity.label}</p>
        <p className="truncate text-[11px] text-v-tertiary">{activity.subject}</p>
      </div>
      <span className="shrink-0 text-[10px] text-v-faint">
        {formatTime(activity.created_at)}
      </span>
    </div>
  )
}

function formatTime(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
    const days = Math.floor(hrs / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } catch {
    return iso
  }
}
