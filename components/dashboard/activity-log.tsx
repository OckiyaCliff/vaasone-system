'use client'

import { useState } from 'react'
import { Download, History, ShieldAlert } from 'lucide-react'
import { ActivityRow } from './activity-row'

export type ActivityItem = {
  id: string
  event_type: string
  label: string
  subject: string
  created_at: string
}

export function ActivityLog({ activities = [] }: { activities: ActivityItem[] }) {
  const [exporting, setExporting] = useState(false)

  function handleExport() {
    setExporting(true)
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activities, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `vaasone-audit-log-${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
    } finally {
      setTimeout(() => setExporting(false), 800)
    }
  }

  return (
    <section className="rounded-[24px] bg-v-overlay p-6 border border-v-border">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
            Audit trail
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-v-text">
            Activity log{' '}
            <span className="text-sm font-normal text-v-faint">
              ({activities.length} {activities.length === 1 ? 'event' : 'events'})
            </span>
          </h2>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || activities.length === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs font-medium text-v-secondary hover:bg-v-hover hover:text-v-text disabled:opacity-50 transition"
        >
          <Download className="size-3.5" />
          <span>{exporting ? 'Exporting...' : 'Export log'}</span>
        </button>
      </div>

      <div className="flex flex-col">
        {activities.map((a) => (
          <ActivityRow
            key={a.id}
            activity={{
              id: a.id,
              event_type: (a.event_type as any) || 'issued',
              label: a.label || 'Activity recorded',
              subject: a.subject || 'Academic Credential',
              created_at: a.created_at || new Date().toISOString(),
            }}
          />
        ))}

        {activities.length === 0 && (
          <div className="rounded-2xl bg-v-inset p-10 text-center">
            <History className="mx-auto size-8 text-v-faint mb-2" />
            <h4 className="text-sm font-semibold text-v-text">No activity recorded yet</h4>
            <p className="mt-1 text-xs text-v-secondary max-w-sm mx-auto">
              System events, credential issuances, verifications, and status changes will appear here in chronological order.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
