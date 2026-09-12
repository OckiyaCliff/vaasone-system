'use client'

import Link from 'next/link'
import { ArrowUpRight, Check, Fingerprint, Plus, Award, ShieldCheck, Building2 } from 'lucide-react'
import { StatCard } from './stat-card'
import { MiniChart } from './mini-chart'
import { ActivityRow } from './activity-row'

export type OverviewProps = {
  stats: {
    totalCredentials: number
    activeCredentials: number
    revokedCredentials: number
    verificationRate: number
    totalVerifications: number
    connectedInstitutions: number
  }
  activities: Array<{
    id: string
    event_type: string
    label: string
    subject: string
    created_at: string
  }>
  chartData?: number[]
}

export function Overview({ stats, activities, chartData }: OverviewProps) {
  const defaultChartData = chartData && chartData.length > 0
    ? chartData
    : [24, 38, 42, 55, 60, 58, 65, 78, 85, 92, 98, 100]

  const statCards = [
    {
      label: 'Total Credentials',
      value: stats.totalCredentials.toLocaleString(),
      change: stats.totalCredentials > 0 ? '+100%' : '0%',
      detail: `${stats.activeCredentials} active · ${stats.revokedCredentials} revoked`,
    },
    {
      label: 'Total Verifications',
      value: stats.totalVerifications.toLocaleString(),
      change: `${stats.verificationRate.toFixed(1)}%`,
      detail: 'verified via SHA-256 + blockchain',
    },
    {
      label: 'Connected Institutions',
      value: stats.connectedInstitutions.toString(),
      change: `${stats.connectedInstitutions} active`,
      detail: 'tenants configured & active',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Hero + Health */}
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="relative min-h-[270px] overflow-hidden rounded-[24px] bg-v-hero p-7 text-v-hero-text sm:p-9">
          <div className="relative z-10 max-w-[340px]">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-v-hero-faint">
              Credential infrastructure
            </p>
            <h2 className="text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[0.94] tracking-[-0.075em]">
              Trust, made
              <br />
              <span className="text-v-hero-faint">verifiable.</span>
            </h2>
            <p className="mt-6 max-w-[285px] text-xs leading-5 text-v-hero-muted">
              Issue once. Verify anywhere. A high-assurance trust layer anchored to Stellar &amp; BNB smart contracts.
            </p>
          </div>
          <div className="absolute -bottom-20 -right-8 size-64 rounded-full border border-v-hero-subtle sm:size-80" />
          <div className="absolute -bottom-10 -right-2 size-48 rounded-full border border-v-hero-subtle sm:size-60" />
          <Link
            href="/issuer/issue"
            aria-label="Issue a new credential"
            className="absolute right-7 top-7 rounded-full bg-v-hero-subtle p-2 text-v-hero-text transition hover:scale-105"
          >
            <ArrowUpRight className="size-5" />
          </Link>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {/* Network health */}
          <section className="rounded-[24px] bg-v-raised p-6 border border-v-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                  Network health
                </p>
                <p className="mt-3 text-3xl font-medium tracking-[-0.07em] text-v-text">
                  100<span className="text-base text-v-faint">%</span>
                </p>
              </div>
              <div className="grid size-10 place-items-center rounded-full border border-v-border bg-v-surface">
                <Check className="size-4 text-v-success" />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-[11px] text-v-tertiary">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-v-success-dot animate-pulse" />
                Stellar Testnet &amp; BNB Testnet
              </span>
              <span className="font-medium text-v-success">Operational</span>
            </div>
          </section>

          {/* Verification rate */}
          <section className="rounded-[24px] bg-v-raised p-6 border border-v-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                  Verification rate
                </p>
                <p className="mt-3 text-3xl font-medium tracking-[-0.07em] text-v-text">
                  {stats.verificationRate > 0 ? stats.verificationRate.toFixed(1) : '100'}
                  <span className="text-base text-v-faint">%</span>
                </p>
              </div>
              <Fingerprint className="size-5 text-v-accent" />
            </div>
            <div className="mt-5 h-9">
              <MiniChart data={defaultChartData} />
            </div>
          </section>
        </div>
      </div>

      {/* Platform stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Activity + CTA */}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[24px] bg-v-overlay p-6 border border-v-border">
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
            {activities.length > 0 ? (
              activities.map((a) => (
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
              ))
            ) : (
              <div className="rounded-2xl bg-v-inset p-8 text-center">
                <p className="text-xs text-v-tertiary">No recent activity logged yet.</p>
                <Link
                  href="/issuer/issue"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-v-accent hover:underline"
                >
                  <Plus className="size-3.5" /> Issue your first credential
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Quick actions panel */}
        <section className="flex flex-col justify-between rounded-[24px] bg-v-overlay p-6 border border-v-border">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
              Quick Actions
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-v-text">
              Blockchain Verification
            </h3>
            <p className="mt-2 text-xs leading-5 text-v-secondary">
              Directly verify credential IDs or cryptographic hashes without requiring an API key.
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/issuer/issue"
              className="flex items-center justify-between rounded-2xl bg-v-surface p-4 border border-v-border transition hover:border-v-accent"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-v-accent text-v-accent-fg">
                  <Award className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-v-text">Issue Credential</p>
                  <p className="text-[10px] text-v-tertiary">Anchor to Stellar &amp; BNB</p>
                </div>
              </div>
              <ArrowUpRight className="size-4 text-v-faint" />
            </Link>

            <Link
              href="/verify"
              className="flex items-center justify-between rounded-2xl bg-v-surface p-4 border border-v-border transition hover:border-v-accent"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-v-raised text-v-text">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-v-text">Verify Credential</p>
                  <p className="text-[10px] text-v-tertiary">Instant cryptographic proof</p>
                </div>
              </div>
              <ArrowUpRight className="size-4 text-v-faint" />
            </Link>

            <Link
              href="/institutions"
              className="flex items-center justify-between rounded-2xl bg-v-surface p-4 border border-v-border transition hover:border-v-accent"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-v-raised text-v-text">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-v-text">Manage Institutions</p>
                  <p className="text-[10px] text-v-tertiary">Multi-tenant configurations</p>
                </div>
              </div>
              <ArrowUpRight className="size-4 text-v-faint" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
