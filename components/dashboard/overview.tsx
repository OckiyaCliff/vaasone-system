'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Award,
  Blocks,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCheck2,
  Fingerprint,
  GraduationCap,
  History,
  Plus,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { StatCard } from './stat-card'
import { MiniChart } from './mini-chart'
import { ActivityRow } from './activity-row'

export type OverviewProps = {
  stats: {
    totalCredentials: number
    activeCredentials: number
    revokedCredentials: number
    supersededCredentials: number
    verificationRate: number
    totalVerifications: number
    successfulVerifications: number
    unknownVerifications: number
    connectedInstitutions: number
    verifiedInstitutions: number
    pendingInstitutions: number
    anchoredCount: number
    anchoredConfirmed: number
    anchoredPending: number
  }
  userContext: {
    displayName: string
    role: string
    organizationName: string | null
    isSystemAdmin: boolean
  }
  latestTx: {
    transaction_id?: string
    provider?: string
    confirmed_at?: string
  } | null
  sisStatus: {
    connected: boolean
    connection: any | null
  }
  credentialDistribution: Record<string, number>
  recentCredentials: Array<{
    id: string
    credential_id: string
    recipient_name: string
    programme: string
    credential_type: string
    issue_date: string
    graduation_date?: string
    student_reference?: string
    certificate_number?: string
    status: string
    document_hash?: string
    organizations?: { id: string; name: string; slug: string }
  }>
  recentVerifications: Array<{
    id: string
    lookup_value: string
    lookup_type: string
    result: string
    created_at: string
    blockchain_verified?: boolean
  }>
  activities: Array<{
    id: string
    event_type: string
    label: string
    subject: string
    created_at: string
  }>
  timelineData: number[]
  institutions: Array<{
    id: string
    name: string
    slug: string
    country: string
    credentialsCount?: number
    isVerified?: boolean
    settings?: Record<string, any>
  }>
}

function formatRoleLabel(role: string): string {
  switch (role) {
    case 'system_admin':
      return 'System Administrator'
    case 'institution_admin':
      return 'Institution Admin'
    case 'institution_operator':
      return 'Registrar Operator'
    case 'student':
      return 'Student Holder'
    default:
      return 'Verified Member'
  }
}

function formatTimeAgo(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  } catch {
    return iso
  }
}

export function Overview({
  stats,
  userContext,
  latestTx,
  sisStatus,
  credentialDistribution,
  recentCredentials = [],
  recentVerifications = [],
  activities = [],
  timelineData = [],
  institutions = [],
}: OverviewProps) {
  const [copiedTx, setCopiedTx] = useState(false)

  const copyTx = (tx: string) => {
    navigator.clipboard.writeText(tx)
    setCopiedTx(true)
    setTimeout(() => setCopiedTx(false), 2000)
  }

  // Calculate credential distribution items
  const typeKeys = Object.keys(credentialDistribution)
  const totalInDistribution = Object.values(credentialDistribution).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Executive Operational Control Header ── */}
      <section className="rounded-[24px] bg-v-surface p-6 sm:p-7 border border-v-border shadow-xs">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-v-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-v-accent border border-v-accent/20">
                {formatRoleLabel(userContext.role)}
              </span>
              {userContext.organizationName && (
                <span className="rounded-full bg-v-inset px-2.5 py-0.5 text-[11px] font-medium text-v-secondary border border-v-border">
                  {userContext.organizationName}
                </span>
              )}
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-v-text">
              Operational Trust Center
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-v-secondary">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Stellar Testnet Consensus
              </span>
              <span className="text-v-border">•</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Server className="size-3 text-v-tertiary" />
                Ingestion Bridge: /api/v1/institutions/sync
              </span>
              <span className="text-v-border">•</span>
              <span className="text-v-secondary">
                {stats.anchoredConfirmed} Anchored On-Chain
              </span>
            </div>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/issuer/issue"
              className="inline-flex items-center gap-2 rounded-xl bg-v-accent px-4 py-2.5 text-xs font-semibold text-v-accent-fg transition-all hover:opacity-95 shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Issue Credential</span>
            </Link>
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 rounded-xl border border-v-border bg-v-inset hover:bg-v-hover px-3.5 py-2.5 text-xs font-semibold text-v-text transition-colors"
            >
              <ShieldCheck className="size-3.5 text-v-secondary" />
              <span>Verify On-Chain</span>
            </Link>
            <Link
              href="/institutions/connect"
              className="inline-flex items-center gap-2 rounded-xl border border-v-border bg-v-inset hover:bg-v-hover px-3.5 py-2.5 text-xs font-medium text-v-secondary hover:text-v-text transition-colors"
            >
              <Server className="size-3.5" />
              <span>Connect SIS</span>
            </Link>
            {(userContext.role === 'system_admin' || userContext.role === 'institution_admin') && (
              <Link
                href="/import"
                className="inline-flex items-center gap-1.5 rounded-xl border border-v-border bg-v-inset hover:bg-v-hover px-3.5 py-2.5 text-xs font-medium text-v-secondary hover:text-v-text transition-colors"
              >
                <span>Bulk Import</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. Accurate Core Metrics (4 Stat Cards) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Credentials"
          value={stats.totalCredentials.toLocaleString()}
          change={`${stats.activeCredentials} active`}
          badgeTone="success"
          detail={`${stats.revokedCredentials} revoked · ${stats.supersededCredentials} superseded`}
          icon={Award}
        />
        <StatCard
          label="Blockchain Anchors"
          value={stats.anchoredCount.toLocaleString()}
          change={`${stats.anchoredConfirmed} confirmed`}
          badgeTone="accent"
          detail="Anchored on Stellar Testnet SCP"
          icon={Blocks}
        />
        <StatCard
          label="Verification Inquiries"
          value={stats.totalVerifications.toLocaleString()}
          change={`${stats.verificationRate.toFixed(1)}% valid`}
          badgeTone="success"
          detail={`${stats.successfulVerifications} authentic · ${stats.unknownVerifications} unverified`}
          icon={ShieldCheck}
        />
        <StatCard
          label="Accredited Network"
          value={stats.connectedInstitutions.toString()}
          change={`${stats.verifiedInstitutions} accredited`}
          badgeTone="neutral"
          detail={`${stats.pendingInstitutions} pending accreditation`}
          icon={Building2}
        />
      </div>

      {/* ── 3. Operational Telemetry & Verification Velocity ── */}
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Consensus & Cryptographic Bridge Telemetry */}
        <section className="rounded-[24px] border border-v-border bg-v-surface p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                  Infrastructure Telemetry
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-v-text">
                  Consensus &amp; Ledger State
                </h3>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ledger Healthy
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-v-border bg-v-inset p-4">
                <span className="text-[10px] uppercase font-semibold text-v-faint block">Consensus Engine</span>
                <p className="mt-1 text-sm font-semibold text-v-text">Stellar Consensus Protocol (SCP)</p>
                <p className="mt-0.5 text-[11px] text-v-secondary">Public Horizon Node with SHA-256 state anchoring</p>
              </div>

              <div className="rounded-2xl border border-v-border bg-v-inset p-4">
                <span className="text-[10px] uppercase font-semibold text-v-faint block">SIS Ingestion Bridge</span>
                <p className="mt-1 text-sm font-semibold text-v-text">
                  {sisStatus.connected ? 'Active / Synchronized' : 'Ready for Ingestion'}
                </p>
                <p className="mt-0.5 text-[11px] text-v-secondary">
                  Webhook listener active on port 3000
                </p>
              </div>
            </div>

            {/* Latest confirmed anchor tx */}
            <div className="mt-4 rounded-2xl border border-v-border bg-v-inset p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-v-faint">
                  Latest On-Chain Anchor Transaction
                </span>
                {latestTx?.confirmed_at && (
                  <span className="text-[10px] text-v-faint">
                    {formatTimeAgo(latestTx.confirmed_at)}
                  </span>
                )}
              </div>
              {latestTx?.transaction_id ? (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-v-secondary truncate">
                    {latestTx.transaction_id}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyTx(latestTx.transaction_id!)}
                      className="rounded-lg p-1.5 text-v-tertiary hover:text-v-text transition-colors"
                      title="Copy transaction hash"
                    >
                      {copiedTx ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </button>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${latestTx.transaction_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-v-border px-2.5 py-1 text-[11px] font-semibold text-v-accent hover:underline"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-xs text-v-secondary">No blockchain transaction anchored yet.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-v-border flex items-center justify-between text-[11px] text-v-secondary">
            <span>Cryptographic integrity verified via 256-bit hash digests</span>
            <Link href="/verify" className="font-semibold text-v-accent hover:underline">
              Open Trust Engine →
            </Link>
          </div>
        </section>

        {/* Verification Velocity & 12-Day Trend */}
        <section className="rounded-[24px] border border-v-border bg-v-surface p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                  Verification Velocity
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-v-text">
                  Inquiry Volume &amp; Authenticity
                </h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tracking-[-0.04em] text-v-text">
                  {stats.verificationRate.toFixed(1)}%
                </p>
                <p className="text-[10px] text-v-secondary">Authenticity Rate</p>
              </div>
            </div>

            {/* Real Timeline Chart */}
            <div className="mt-6">
              <div className="h-20 w-full">
                <MiniChart data={timelineData} />
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-mono text-v-faint">
                <span>12 days ago</span>
                <span>Inquiries Over Time</span>
                <span>Today</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-v-border text-xs">
              <div>
                <span className="text-[10px] text-v-faint uppercase font-semibold block">Confirmed Authentic</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {stats.successfulVerifications} records verified
                </span>
              </div>
              <div>
                <span className="text-[10px] text-v-faint uppercase font-semibold block">Unrecognized / Incomplete</span>
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">
                  {stats.unknownVerifications} queries
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-v-secondary">
            Inquiries executed through employer verification portal, student share links, and automated API requests.
          </p>
        </section>
      </div>

      {/* ── 4. Recent Academic Credentials Feed ── */}
      <section className="rounded-[24px] border border-v-border bg-v-surface p-6 shadow-xs">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
              Academic Registry
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-v-text">
              Recent Issued Credentials
            </h3>
          </div>
          <Link
            href="/credentials"
            className="inline-flex items-center gap-1 text-xs font-semibold text-v-accent hover:underline"
          >
            <span>View all ({stats.totalCredentials}) credentials</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {recentCredentials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-v-border text-[11px] font-semibold uppercase tracking-wider text-v-faint">
                  <th className="py-3 px-3">Recipient &amp; Roll</th>
                  <th className="py-3 px-3">Programme / Degree</th>
                  <th className="py-3 px-3">Institution</th>
                  <th className="py-3 px-3">Issued Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-v-border-faint">
                {recentCredentials.map((c) => (
                  <tr key={c.id} className="hover:bg-v-hover transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-v-text">{c.recipient_name}</p>
                      <p className="font-mono text-[10px] text-v-tertiary">
                        {c.student_reference || c.certificate_number || c.credential_id}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-v-text">{c.programme}</p>
                      <p className="text-[10px] uppercase text-v-faint">{c.credential_type}</p>
                    </td>
                    <td className="py-3 px-3 text-v-secondary">
                      {c.organizations?.name || 'Accredited Institution'}
                    </td>
                    <td className="py-3 px-3 text-v-secondary font-mono text-[11px]">
                      {c.issue_date || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/verify?id=${encodeURIComponent(c.credential_id)}`}
                          className="rounded-lg bg-v-inset hover:bg-v-hover px-2.5 py-1 text-[11px] font-medium text-v-text border border-v-border transition-colors"
                        >
                          Verify
                        </Link>
                        <Link
                          href={`/v/${c.credential_id}`}
                          target="_blank"
                          className="rounded-lg p-1 text-v-tertiary hover:text-v-text"
                          title="Open public certificate page"
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl bg-v-inset p-8 text-center">
            <GraduationCap className="mx-auto size-8 text-v-faint mb-2" />
            <h4 className="text-sm font-semibold text-v-text">No academic credentials registered yet</h4>
            <p className="mt-1 text-xs text-v-secondary max-w-sm mx-auto">
              Issue your first credential on the blockchain or connect your SIS to sync records automatically.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link
                href="/issuer/issue"
                className="rounded-xl bg-v-accent px-4 py-2 text-xs font-semibold text-v-accent-fg hover:opacity-90 transition-opacity"
              >
                + Issue Credential
              </Link>
              <Link
                href="/institutions/connect"
                className="rounded-xl border border-v-border bg-v-surface px-4 py-2 text-xs font-medium text-v-text hover:bg-v-hover transition-colors"
              >
                Connect SIS
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ── 5. Analytics Distribution & Accredited Network ── */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Academic Credential Distribution */}
        <section className="rounded-[24px] border border-v-border bg-v-surface p-6 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
              Distribution &amp; Diversity
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-v-text">
              Credentials by Award Type
            </h3>
            <p className="mt-1 text-xs text-v-secondary">
              Real inventory of authenticated degree certificates, diplomas, and transcripts.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {typeKeys.length > 0 ? (
                typeKeys.map((type) => {
                  const count = credentialDistribution[type] || 0
                  const pct = Math.round((count / totalInDistribution) * 100)
                  return (
                    <div key={type} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-v-text capitalize">{type}</span>
                        <span className="text-v-secondary font-mono text-[11px]">
                          {count} {count === 1 ? 'record' : 'records'} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-v-raised overflow-hidden">
                        <div
                          className="h-full rounded-full bg-v-accent transition-all duration-500"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="rounded-xl bg-v-inset p-5 text-center text-xs text-v-secondary">
                  No credential type categorization available.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-v-border flex items-center justify-between text-xs text-v-secondary">
            <span>Anchored with tamper-proof cryptographic proofs</span>
            <Link href="/credentials" className="font-semibold text-v-accent hover:underline">
              Full Registry →
            </Link>
          </div>
        </section>

        {/* Accredited Institutions Snapshot */}
        <section className="rounded-[24px] border border-v-border bg-v-surface p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                  Multi-Tenant Directory
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-v-text">
                  Accredited Institutions ({institutions.length})
                </h3>
              </div>
              <Link href="/institutions" className="text-xs font-semibold text-v-accent hover:underline">
                Manage Directory →
              </Link>
            </div>

            <div className="mt-5 flex flex-col divide-y divide-v-border-faint">
              {institutions.slice(0, 4).map((inst) => (
                <div key={inst.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid size-9 place-items-center rounded-xl bg-v-raised text-v-text border border-v-border shrink-0">
                      <Building2 className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-v-text truncate">{inst.name}</p>
                      <p className="text-[11px] text-v-secondary">{inst.country || 'Global'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {inst.isVerified !== false ? 'Accredited' : 'Pending'}
                    </span>
                    <span className="text-[11px] font-mono text-v-tertiary">
                      {inst.credentialsCount || 0} creds
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-v-border flex items-center justify-between text-xs text-v-secondary">
            <span>Federated identity &amp; independent cryptographic keypairs</span>
            <Link href="/institutions/connect" className="font-semibold text-v-accent hover:underline">
              Connect new university →
            </Link>
          </div>
        </section>
      </div>

      {/* ── 6. Real Recent Verification Inquiries & Security Audit Trail ── */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Recent Verification Queries */}
        <section className="rounded-[24px] border border-v-border bg-v-surface p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                Live Inquiries
              </p>
              <h3 className="mt-1 text-base font-semibold text-v-text">
                Recent Verification Checks
              </h3>
            </div>
            <Link href="/verify" className="text-xs font-semibold text-v-accent hover:underline">
              Verify Record →
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-v-border-faint text-xs">
            {recentVerifications.length > 0 ? (
              recentVerifications.map((v) => (
                <div key={v.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-v-text truncate max-w-[220px]">
                        {v.lookup_value}
                      </span>
                      <span className="rounded-md bg-v-raised px-1.5 py-0.5 text-[9px] uppercase font-mono text-v-faint border border-v-border">
                        {v.lookup_type}
                      </span>
                    </div>
                    <span className="text-[10px] text-v-faint">{formatTimeAgo(v.created_at)}</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      v.result === 'valid'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {v.result === 'valid' ? 'Valid' : v.result}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-4 text-xs text-v-secondary text-center">No recent verification queries logged.</p>
            )}
          </div>
        </section>

        {/* System Activity Log */}
        <section className="rounded-[24px] border border-v-border bg-v-surface p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                Security Trail
              </p>
              <h3 className="mt-1 text-base font-semibold text-v-text">
                System Activity Log
              </h3>
            </div>
            <Link href="/activity" className="text-xs font-semibold text-v-accent hover:underline">
              View All Log →
            </Link>
          </div>

          <div className="flex flex-col">
            {activities.length > 0 ? (
              activities.slice(0, 4).map((a) => (
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
              <div className="rounded-xl bg-v-inset p-6 text-center text-xs text-v-secondary">
                No recent activity recorded.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
