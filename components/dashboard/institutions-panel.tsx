'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Globe2,
  MoreHorizontal,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Check,
  Trash2,
  Unplug,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react'
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
  settings?: Record<string, any>
}

export function InstitutionsPanel({
  institutions = [],
  isSystemAdmin = false,
  userOrganizationId = null,
  currentUserRole = 'verifier',
  platformUsers = [],
}: {
  institutions: InstitutionItem[]
  isSystemAdmin?: boolean
  userOrganizationId?: string | null
  currentUserRole?: string
  platformUsers?: PlatformUserItem[]
}) {
  const router = useRouter()
  const [items, setItems] = useState<InstitutionItem[]>(institutions)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleApprove = async (orgId: string) => {
    setVerifyingId(orgId)
    setNotification(null)
    try {
      const res = await fetch('/api/v1/organizations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId, isVerified: true }),
      })
      const data = await res.json()
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === orgId ? { ...item, isVerified: true } : item))
        )
        setNotification({ type: 'success', message: 'Institution successfully accredited.' })
        router.refresh()
      } else {
        throw new Error(data.error || 'Failed to verify institution')
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to verify institution' })
      alert(err.message || 'Failed to verify institution')
    } finally {
      setVerifyingId(null)
    }
  }

  const handleDisconnect = async (orgId: string) => {
    if (!confirm('Disconnect the SIS integration for this institution? Existing credentials will be preserved.')) return
    setActionLoading(orgId)
    setNotification(null)
    try {
      const res = await fetch(`/api/v1/organizations/${orgId}?action=disconnect`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to disconnect SIS')
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === orgId
            ? { ...item, settings: { ...item.settings, sis_connected: false } }
            : item
        )
      )
      setNotification({ type: 'success', message: data.message || 'SIS disconnected successfully.' })
      router.refresh()
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to disconnect SIS' })
      alert(err.message || 'Failed to disconnect SIS')
    } finally {
      setActionLoading(null)
      setMenuOpenId(null)
    }
  }

  const handleDelete = async (orgId: string, orgName: string) => {
    if (!confirm(`Permanently delete "${orgName}" and ALL its credentials? This cannot be undone.`)) return
    if (!confirm(`FINAL CONFIRMATION: Delete institution "${orgName}"? All blockchain anchored credentials will be removed from the platform.`)) return
    setActionLoading(orgId)
    setNotification(null)
    try {
      const res = await fetch(`/api/v1/organizations/${orgId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete institution')
      }
      setItems((prev) => prev.filter((item) => item.id !== orgId))
      setNotification({ type: 'success', message: data.message || `Institution "${orgName}" deleted.` })
      router.refresh()
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to delete institution' })
      alert(err.message || 'Failed to delete institution')
    } finally {
      setActionLoading(null)
      setMenuOpenId(null)
    }
  }

  const handleResync = async (orgId: string) => {
    setActionLoading(orgId)
    setNotification(null)
    try {
      const inst = items.find((i) => i.id === orgId)
      const endpoint = inst?.settings?.sis_endpoint || 'http://localhost:3001/api/students'

      const res = await fetch('/api/v1/institutions/connect-sis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adapterType: inst?.settings?.sis_adapter || 'rest',
          endpoint,
          organizationId: orgId,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Re-sync failed')
      }
      const msg = `Re-sync complete: ${data.importedCount || 0} new records imported.`
      setNotification({ type: 'success', message: msg })
      alert(msg)
      router.refresh()
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Re-sync failed. Check if university server is running.' })
      alert(err.message || 'Re-sync failed. Check if the university server is running.')
    } finally {
      setActionLoading(null)
      setMenuOpenId(null)
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
              {items.length} {items.length === 1 ? 'institution' : 'institutions'}.
              <br />
              <span className="text-v-hero-ghost">One trust layer.</span>
            </h2>
          </div>
          <Globe2 className="size-6 text-v-hero-muted" />
        </div>
        <div className="mt-10 grid max-w-[620px] grid-cols-3 gap-4 border-t border-v-hero-border pt-5 text-xs text-v-hero-muted">
          <div>
            <span className="block text-xl font-medium text-v-hero-text">{items.length}</span>
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
              {uniqueCountries || (items.length > 0 ? 1 : 0)}
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

        {notification && (
          <div
            className={`mb-4 flex items-center justify-between gap-2 rounded-xl p-3 text-xs ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <Check className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {items.length === 0 ? (
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

              const sisConnected = institution.settings?.sis_connected
              const canManage =
                isSystemAdmin ||
                (userOrganizationId === institution.id &&
                  (currentUserRole === 'institution_admin' || currentUserRole === 'admin'))

              return (
                <div
                  key={institution.id}
                  className="relative flex items-center gap-4 rounded-2xl bg-v-inset p-4 border border-v-border"
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
                      {sisConnected && (
                        <span className="ml-1 text-emerald-500 font-medium">· SIS Connected</span>
                      )}
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

                    {/* Management Actions Menu */}
                    {canManage && (
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === institution.id ? null : institution.id)}
                          className="rounded-lg p-1.5 text-v-faint hover:bg-v-hover hover:text-v-text transition-colors"
                          aria-label="Institution actions"
                        >
                          {menuOpenId === institution.id ? (
                            <X className="size-4" />
                          ) : (
                            <MoreHorizontal className="size-4" />
                          )}
                        </button>

                        {menuOpenId === institution.id && (
                          <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-v-border bg-v-surface p-1.5 shadow-lg">
                            <button
                              onClick={() => handleResync(institution.id)}
                              disabled={actionLoading === institution.id}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-v-secondary hover:bg-v-hover hover:text-v-text transition-colors disabled:opacity-50"
                            >
                              {actionLoading === institution.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="size-3.5" />
                              )}
                              Re-sync credentials
                            </button>
                            <button
                              onClick={() => handleDisconnect(institution.id)}
                              disabled={actionLoading === institution.id}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                            >
                              <Unplug className="size-3.5" />
                              Disconnect SIS
                            </button>
                            {isSystemAdmin && (
                              <>
                                <div className="my-1 border-t border-v-border" />
                                <button
                                  onClick={() => handleDelete(institution.id, institution.name)}
                                  disabled={actionLoading === institution.id}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="size-3.5" />
                                  Delete institution
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
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
          organizations={items.map((i) => ({ id: i.id, name: i.name }))}
        />
      )}
    </div>
  )
}
