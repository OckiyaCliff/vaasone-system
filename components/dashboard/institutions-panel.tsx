'use client'

import Link from 'next/link'
import { Globe2, MoreHorizontal, Plus } from 'lucide-react'
import { institutionStats } from '@/lib/vaas-data'

export function InstitutionsPanel() {
  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <section className="rounded-[24px] bg-v-hero p-7 text-v-hero-text sm:p-9">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-v-hero-faint">
              Institution network
            </p>
            <h2 className="mt-3 text-4xl font-medium tracking-[-0.07em]">
              27 institutions.
              <br />
              <span className="text-v-hero-ghost">One trust layer.</span>
            </h2>
          </div>
          <Globe2 className="size-6 text-v-hero-muted" />
        </div>
        <div className="mt-10 grid max-w-[620px] grid-cols-3 gap-4 border-t border-v-hero-border pt-5 text-xs text-v-hero-muted">
          <div>
            <span className="block text-xl font-medium text-v-hero-text">27</span>connected
          </div>
          <div>
            <span className="block text-xl font-medium text-v-hero-text">12.4k</span>credentials
          </div>
          <div>
            <span className="block text-xl font-medium text-v-hero-text">6</span>countries
          </div>
        </div>
      </section>

      {/* Integration health */}
      <section className="rounded-[24px] bg-v-overlay p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
              Connected institutions
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-v-text">
              Integration health
            </h3>
          </div>
          <Link
            href="/institutions/connect"
            className="rounded-xl bg-v-accent px-3 py-2 text-xs font-semibold text-v-accent-fg"
          >
            <Plus className="mr-1 inline size-3" /> Add institution
          </Link>
        </div>

        <div className="grid gap-3">
          {institutionStats.map((institution) => (
            <div key={institution.name} className="flex items-center gap-4 rounded-2xl bg-v-inset p-4">
              <div className="grid size-10 place-items-center rounded-xl bg-v-white text-[11px] font-semibold text-v-text">
                {institution.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-v-text">{institution.name}</p>
                <p className="mt-1 text-[11px] text-v-muted-text">
                  {institution.country} · {institution.credentials} credentials
                </p>
              </div>
              <span
                className={`hidden rounded-full px-2 py-1 text-[10px] font-semibold sm:inline ${
                  institution.status === 'Healthy'
                    ? 'bg-v-success-bg text-v-success'
                    : 'bg-v-warning-bg text-v-warning'
                }`}
              >
                {institution.status}
              </span>
              <MoreHorizontal className="size-4 text-v-faint" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
