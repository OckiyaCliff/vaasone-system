'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Globe2, MoreHorizontal, Plus, ExternalLink, ShieldCheck, ShieldAlert, Loader2, Check } from 'lucide-react'
import { UserAssignmentPanel, type PlatformUserItem } from './user-assignment-panel'

export type InstitutionItem = {
  id: string
  name: string
  slug: string
  type: string
  country: string
  website: string | null
  logo_url: string | null
  created_at: string
  credentialsCount: number
  usersCount: number
  isVerified?: boolean
}

export function InstitutionsPanel({
  institutions = [],
  isSystemAdmin = false,
  platformUsers = [],
}: {
  institutions: InstitutionItem[]
  isSystemAdmin?: boolean
  platformUsers?: PlatformUserItem[]
}) {
  const [items, setItems] = useState<InstitutionItem[]>(institutions)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  const handleApprove = async (orgId: string) => {
    setVerifyingId(orgId)
    try {
      const res = await fetch('/api/v1/organizations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId, isVerified: true }),
      })
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === orgId ? { ...item, isVerified: true } : item))
        )
      }
    } catch {
      // Error handling
    } finally {
      setVerifyingId(null)
    }
  }

  const totalCredentials = items.reduce((acc, inst) => acc + inst.credentialsCount, 0)
  const uniqueCountries = new Set(items.map((i) => i.country).filter(Boolean)).size

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <section className="rounded-[24px] bg-v-hero p-7 text-v-hero-text sm:p-9">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-v-hero-faint">
              Institution network
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-medium tracking-[-0.07em]">
              {institutions.length} {institutions.length === 1 ? 'institution' : 'institutions'}.
              <br />
              <span className="text-v-hero-ghost">One trust layer.</span>
            </h2>
          </div>
          <Globe2 className="size-6 text-v-hero-muted" />
        </div>
        <div className="mt-10 grid max-w-[620px] grid-cols-3 gap-4 border-t border-v-hero-border pt-5 text-xs text-v-hero-muted">
          <div>
            <span className="block text-xl font-medium text-v-hero-text">{institutions.length}</span>
            connected
          </div>
          <div>
            <span className="block text-xl font-medium text-v-hero-text">
              {totalCredentials.toLocaleString()}
            </span>
            credentials
          </div>
          <div>
            <span className="block text-xl font-medium text-v-hero-text">
              {uniqueCountries || (institutions.length > 0 ? 1 : 0)}
            </span>
            countries
          </div>
        </div>
      </section>

      {/* Connected institutions */}
      <section className="rounded-[24px] bg-v-overlay p-6 border border-v-border">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
              Connected institutions
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-v-text">
              Integration &amp; Issuing Tenants
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/institutions/connect"
              className="rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs font-semibold text-v-text hover:bg-v-hover"
            >
              Connect SIS
            </Link>
          </div>
        </div>

        {institutions.length === 0 ? (
          <div className="rounded-2xl bg-v-inset p-10 text-center">
            <Building2 className="mx-auto size-8 text-v-faint mb-2" />
            <h4 className="text-sm font-semibold text-v-text">No institutions found</h4>
            <p className="mt-1 text-xs text-v-secondary max-w-sm mx-auto">
              Create an organization to start issuing verified credentials through Vaasone.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((institution) => {
              const initials = institution.name
                .split(' ')
                .filter(Boolean)
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'IN'

              return (
                <div
                  key={institution.id}
                  className="flex items-center gap-4 rounded-2xl bg-v-inset p-4 border border-v-border"
                >
                  <div className="grid size-10 place-items-center rounded-xl bg-v-accent text-xs font-semibold text-v-accent-fg">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-v-text">
                        {institution.name}
                      </p>
                      {institution.website && (
                        <a
                          href={institution.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-v-faint hover:text-v-text"
                          aria-label="Visit website"
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-v-muted-text">
                      {institution.country} · {institution.credentialsCount} credentials · {institution.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {institution.isVerified === false ? (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          <ShieldAlert className="size-3" />
                          Pending Review
                        </span>
                        {isSystemAdmin && (
                          <button
                            type="button"
                            disabled={verifyingId === institution.id}
                            onClick={() => handleApprove(institution.id)}
                            className="inline-flex items-center gap-1 rounded-xl bg-v-accent px-3 py-1.5 text-[11px] font-semibold text-v-accent-fg hover:bg-v-accent-hover transition-colors disabled:opacity-50"
                          >
                            {verifyingId === institution.id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Check className="size-3" />
                            )}
                            Verify
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="hidden rounded-full bg-v-success-bg px-2.5 py-1 text-[10px] font-semibold text-v-success sm:inline-flex items-center gap-1">
                        <ShieldCheck className="size-3" />
                        Verified Tenant
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Admin-only User Role Assignment Panel */}
      {isSystemAdmin && (
        <UserAssignmentPanel
          users={platformUsers}
          organizations={institutions.map((i) => ({ id: i.id, name: i.name }))}
        />
      )}
    </div>
  )
}
