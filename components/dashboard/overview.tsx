'use client'

import Link from 'next/link'
import { ArrowUpRight, Check, Fingerprint } from 'lucide-react'
import { StatCard } from './stat-card'
import { MiniChart } from './mini-chart'
import { ActivityRow } from './activity-row'
import { activities, platformStats, verificationVolume } from '@/lib/vaas-data'

export function Overview() {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero + Health */}
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="relative min-h-[270px] overflow-hidden rounded-[24px] bg-v-hero p-7 text-v-hero-text sm:p-9">
          <div className="relative z-10 max-w-[330px]">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-v-hero-faint">
              Credential infrastructure
            </p>
            <h2 className="text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[0.94] tracking-[-0.075em]">
              Trust, made
              <br />
              <span className="text-v-hero-faint">verifiable.</span>
            </h2>
            <p className="mt-6 max-w-[275px] text-xs leading-5 text-v-hero-muted">
              Issue once. Verify anywhere. A common trust layer for Africa&apos;s academic credentials.
            </p>
          </div>
          <div className="absolute -bottom-20 -right-8 size-64 rounded-full border border-v-hero-subtle sm:size-80" />
          <div className="absolute -bottom-10 -right-2 size-48 rounded-full border border-v-hero-subtle sm:size-60" />
          <ArrowUpRight className="absolute right-7 top-7 size-6 text-v-hero-text" />
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {/* Network health */}
          <section className="rounded-[24px] bg-v-raised p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                  Network health
                </p>
                <p className="mt-3 text-3xl font-medium tracking-[-0.07em] text-v-text">
                  99.98<span className="text-base text-v-faint">%</span>
                </p>
              </div>
              <div className="grid size-10 place-items-center rounded-full border border-v-border">
                <Check className="size-4 text-v-text" />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-[11px] text-v-tertiary">
              <span>Stellar testnet</span>
              <span className="font-medium text-v-success">Operational</span>
            </div>
          </section>

          {/* Verification rate */}
          <section className="rounded-[24px] bg-v-raised p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                  Verification rate
                </p>
                <p className="mt-3 text-3xl font-medium tracking-[-0.07em] text-v-text">
                  98.7<span className="text-base text-v-faint">%</span>
                </p>
              </div>
              <Fingerprint className="size-5 text-v-ghost" />
            </div>
            <div className="mt-5 h-9">
              <MiniChart data={verificationVolume} />
            </div>
          </section>
        </div>
      </div>

      {/* Platform stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {platformStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Activity + CTA */}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[24px] bg-v-overlay p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                Recent activity
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-v-text">
                What&apos;s happening
              </h3>
            </div>
            <Link
              href="/activity"
              className="text-[11px] font-semibold text-v-tertiary hover:text-v-text"
            >
              View all <ArrowUpRight className="ml-1 inline size-3" />
            </Link>
          </div>
          <div className="flex flex-col">
            {activities.slice(0, 3).map((a) => (
              <ActivityRow key={a.id} activity={a} />
            ))}
          </div>
        </section>

        <section className="rounded-[24px] bg-v-raised p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                Issue credentials
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-v-text">
                Connect your SIS
              </h3>
            </div>
            <ArrowUpRight className="size-5 text-v-text" />
          </div>
          <p className="mt-10 max-w-[240px] text-sm leading-5 text-v-secondary">
            Create a secure connection to start issuing verifiable credentials from your existing system.
          </p>
          <Link
            href="/institutions"
            className="mt-5 inline-block rounded-xl bg-v-accent px-4 py-2.5 text-xs font-semibold text-v-accent-fg"
          >
            View integrations
          </Link>
        </section>
      </div>
    </div>
  )
}
