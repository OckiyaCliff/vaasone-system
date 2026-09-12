'use client'

import { ActivityRow } from './activity-row'
import { activities } from '@/lib/vaas-data'

export function ActivityLog() {
  return (
    <section className="rounded-[24px] bg-v-overlay p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
            Audit trail
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-v-text">
            Activity log
          </h2>
        </div>
        <button className="rounded-xl border border-v-border px-3 py-2 text-xs text-v-secondary">
          Export log
        </button>
      </div>
      <div className="flex flex-col">
        {activities.map((a) => (
          <ActivityRow key={a.id} activity={a} />
        ))}
        {activities.length === 0 && (
          <p className="py-12 text-center text-sm text-v-tertiary">No activity yet.</p>
        )}
      </div>
    </section>
  )
}
