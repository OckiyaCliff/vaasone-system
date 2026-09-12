'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Copy, FilePlus2 } from 'lucide-react'
import { StatusPill } from './status-pill'
import { credentials as mockCredentials } from '@/lib/vaas-data'

export function CredentialsTable({ search }: { search: string }) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return mockCredentials.filter((c) => {
      const matchesSearch =
        !query ||
        c.recipient.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        c.institution.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch { /* clipboard may be unavailable */ }
  }

  return (
    <section className="rounded-[24px] bg-v-overlay p-5 sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
            Credential registry
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-v-text">
            All credentials{' '}
            <span className="text-sm font-normal text-v-faint">{filtered.length} records</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter(statusFilter === 'all' ? 'verified' : statusFilter === 'verified' ? 'pending' : statusFilter === 'pending' ? 'revoked' : 'all')}
            className="flex items-center gap-2 rounded-xl border border-v-border px-3 py-2 text-xs text-v-secondary"
          >
            <ChevronDown className="size-3" />
            {statusFilter === 'all' ? 'All statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
          </button>
          <button className="rounded-xl bg-v-accent px-3 py-2 text-xs font-semibold text-v-accent-fg">
            <FilePlus2 className="mr-1 inline size-3.5" /> Issue new
          </button>
        </div>
      </div>

      {search && <p className="mb-4 text-xs text-v-tertiary">Showing results for &ldquo;{search}&rdquo;</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-xs">
          <thead className="border-b border-v-border text-[10px] uppercase tracking-[0.12em] text-v-faint">
            <tr>
              <th className="pb-3 font-semibold">Recipient</th>
              <th className="pb-3 font-semibold">Credential ID</th>
              <th className="pb-3 font-semibold">Institution</th>
              <th className="pb-3 font-semibold">Issued</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record.id} className="border-b border-v-border-light last:border-0">
                <td className="py-4 font-semibold text-v-text">
                  {record.recipient}
                  <span className="mt-1 block text-[10px] font-normal text-v-muted-text">
                    {record.program}
                  </span>
                </td>
                <td className="py-4 font-mono text-[11px] text-v-secondary">{record.id}</td>
                <td className="py-4 text-v-secondary">{record.institution}</td>
                <td className="py-4 text-v-tertiary">{record.issuedAt}</td>
                <td className="py-4">
                  <StatusPill status={record.status === 'verified' ? 'active' : record.status} />
                </td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => copyId(record.id)}
                    aria-label={`Copy ${record.id}`}
                    className="rounded-lg p-2 text-v-faint hover:bg-v-hover hover:text-v-text"
                  >
                    {copied === record.id ? (
                      <span className="text-[10px] text-v-success">Copied</span>
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-v-tertiary">
                  No credentials found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
