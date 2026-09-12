'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, Copy, ExternalLink, FilePlus2, Search, ShieldCheck } from 'lucide-react'
import { StatusPill } from './status-pill'

export type CredentialRecord = {
  id: string
  credential_id: string
  recipient_name: string
  programme: string
  credential_type: string
  issue_date: string
  status: string
  document_hash?: string | null
  organization_id?: string
  organizations?: any
}

export function CredentialsTable({
  credentials = [],
  search: initialSearch = '',
}: {
  credentials: CredentialRecord[]
  search?: string
}) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [copied, setCopied] = useState<string | null>(null)
  const [search, setSearch] = useState(initialSearch)

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return credentials.filter((c) => {
      const org = Array.isArray(c.organizations) ? c.organizations[0] : c.organizations
      const orgName = org?.name || ''

      const matchesSearch =
        !query ||
        c.recipient_name.toLowerCase().includes(query) ||
        c.credential_id.toLowerCase().includes(query) ||
        c.programme.toLowerCase().includes(query) ||
        orgName.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'all' ||
        c.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [credentials, search, statusFilter])

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      /* clipboard may be unavailable */
    }
  }

  return (
    <section className="rounded-[24px] bg-v-overlay p-5 sm:p-6 border border-v-border">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
            Credential registry
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-v-text">
            All credentials{' '}
            <span className="text-sm font-normal text-v-faint">
              {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
            </span>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar inside table */}
          <div className="flex items-center gap-2 rounded-xl border border-v-border bg-v-inset px-3 py-1.5 text-xs">
            <Search className="size-3 text-v-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipient or ID..."
              className="w-32 bg-transparent text-xs text-v-text outline-none placeholder:text-v-faint focus:w-44 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-v-border bg-v-inset px-3 py-2 text-xs text-v-secondary outline-none"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="issued">Issued</option>
            <option value="draft">Draft</option>
            <option value="revoked">Revoked</option>
          </select>

          <Link
            href="/issuer/issue"
            className="inline-flex items-center gap-1.5 rounded-xl bg-v-accent px-3.5 py-2 text-xs font-semibold text-v-accent-fg transition hover:opacity-95"
          >
            <FilePlus2 className="size-3.5" /> Issue new
          </Link>
        </div>
      </div>

      {search && (
        <p className="mb-4 text-xs text-v-tertiary">
          Showing results matching &ldquo;{search}&rdquo;
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-v-inset p-10 text-center">
          <ShieldCheck className="mx-auto size-8 text-v-faint mb-2" />
          <h3 className="text-sm font-semibold text-v-text">No credentials found</h3>
          <p className="mt-1 text-xs text-v-secondary max-w-sm mx-auto">
            {credentials.length === 0
              ? 'No academic credentials have been issued yet. Issue your first credential to anchor it onto the blockchain.'
              : 'No records matched your search filters.'}
          </p>
          <div className="mt-4">
            <Link
              href="/issuer/issue"
              className="inline-flex items-center gap-1.5 rounded-xl bg-v-accent px-4 py-2 text-xs font-semibold text-v-accent-fg"
            >
              <FilePlus2 className="size-3.5" /> Issue first credential
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b border-v-border text-[10px] uppercase tracking-[0.12em] text-v-faint">
              <tr>
                <th className="pb-3 font-semibold">Recipient</th>
                <th className="pb-3 font-semibold">Credential ID</th>
                <th className="pb-3 font-semibold">Institution</th>
                <th className="pb-3 font-semibold">Issued Date</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 text-right">Verify / Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => {
                const org = Array.isArray(record.organizations)
                  ? record.organizations[0]
                  : record.organizations
                const orgName = org?.name || 'Institution'

                return (
                  <tr
                    key={record.id}
                    className="border-b border-v-border-light last:border-0 hover:bg-v-hover/50 transition-colors"
                  >
                    <td className="py-4 font-semibold text-v-text">
                      {record.recipient_name}
                      <span className="mt-0.5 block text-[10px] font-normal text-v-muted-text">
                        {record.programme}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-[11px] text-v-secondary">
                      <div className="flex items-center gap-1.5">
                        <span>{record.credential_id}</span>
                        <button
                          onClick={() => copyId(record.credential_id)}
                          aria-label={`Copy ${record.credential_id}`}
                          className="rounded p-1 text-v-faint hover:bg-v-hover hover:text-v-text"
                        >
                          {copied === record.credential_id ? (
                            <Check className="size-3 text-v-success" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 text-v-secondary">{orgName}</td>
                    <td className="py-4 text-v-tertiary">
                      {record.issue_date
                        ? new Date(record.issue_date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-4">
                      <StatusPill
                        status={
                          record.status === 'issued' || record.status === 'active'
                            ? 'active'
                            : record.status === 'revoked'
                              ? 'revoked'
                              : 'pending'
                        }
                      />
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/v/${encodeURIComponent(record.credential_id)}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-v-border bg-v-surface px-2.5 py-1.5 text-[11px] font-medium text-v-text hover:bg-v-hover hover:text-v-accent transition"
                      >
                        <span>Verify</span>
                        <ExternalLink className="size-3 text-v-faint" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
