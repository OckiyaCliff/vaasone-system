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
  Plus,
  FileSpreadsheet,
  Server,
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck2,
  UserPlus,
  Key,
  Copy,
  Mail,
  User,
  Lock,
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
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
    actionUrl?: string
    actionLabel?: string
  } | null>(null)

  // Add Institution Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addName, setAddName] = useState('')
  const [addSlug, setAddSlug] = useState('')
  const [addType, setAddType] = useState('university')
  const [addCountry, setAddCountry] = useState('Nigeria')
  const [addWebsite, setAddWebsite] = useState('')
  const [addVerified, setAddVerified] = useState(true)

  // Institutional Administrator Account Provisioning State
  const [provisionAdmin, setProvisionAdmin] = useState(true)
  const [adminFullName, setAdminFullName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('Vaas-Admin-2026!')
  const [adminRole, setAdminRole] = useState<'admin' | 'operator'>('admin')

  const [addingOrg, setAddingOrg] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Provisioned Credentials Success Modal
  const [provisionedModal, setProvisionedModal] = useState<{
    institutionName: string
    fullName: string
    email: string
    password: string
    role: string
  } | null>(null)
  const [copiedCreds, setCopiedCreds] = useState(false)

  // Add Staff / Operator for Existing Institution Modal State
  const [staffModalOrg, setStaffModalOrg] = useState<InstitutionItem | null>(null)
  const [staffEmail, setStaffEmail] = useState('')
  const [staffFullName, setStaffFullName] = useState('')
  const [staffPassword, setStaffPassword] = useState('Vaas-Staff-2026!')
  const [staffRole, setStaffRole] = useState<'admin' | 'operator'>('operator')
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffError, setStaffError] = useState<string | null>(null)

  const handleNameChange = (val: string) => {
    setAddName(val)
    const newSlug = slugify(val)
    if (!addSlug || addSlug === slugify(addName)) {
      setAddSlug(newSlug)
    }
    if (!adminEmail || adminEmail.includes('@')) {
      const domain = addWebsite ? addWebsite.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : `${newSlug || 'inst'}.edu.ng`
      setAdminEmail(`admin@${domain}`)
    }
  }

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function generatePassword(prefix = 'Vaas') {
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}!2026`
  }

  const fillQuickPreset = (name: string, slug: string, website: string, adminName: string, email: string, pass: string) => {
    setAddName(name)
    setAddSlug(slug)
    setAddWebsite(website)
    setAddCountry('Nigeria')
    setAddType('university')
    setProvisionAdmin(true)
    setAdminFullName(adminName)
    setAdminEmail(email)
    setAdminPassword(pass)
    setAdminRole('admin')
  }

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName.trim()) {
      setAddError('Institution name is required.')
      return
    }

    setAddingOrg(true)
    setAddError(null)

    try {
      const slug = addSlug.trim() || slugify(addName)
      const res = await fetch('/api/v1/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName.trim(),
          slug,
          type: addType,
          country: addCountry.trim(),
          website: addWebsite.trim() || null,
          isVerified: addVerified,
          adminAccount: provisionAdmin && adminEmail.trim()
            ? {
                fullName: adminFullName.trim() || `${addName.trim()} Admin`,
                email: adminEmail.trim().toLowerCase(),
                password: adminPassword,
                role: adminRole,
              }
            : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.organization) {
        throw new Error(data.error || 'Failed to create institution')
      }

      const created = data.organization
      const newItem: InstitutionItem = {
        id: created.id,
        name: created.name,
        slug: created.slug,
        type: created.type || addType,
        country: created.country || addCountry,
        website: created.website || addWebsite || null,
        logo_url: created.logo_url || null,
        created_at: created.created_at || new Date().toISOString(),
        credentialsCount: 0,
        usersCount: data.provisionedUser ? 1 : 0,
        isVerified: addVerified,
        settings: created.settings || { is_verified: addVerified },
      }

      setItems((prev) => [newItem, ...prev])
      setIsAddModalOpen(false)

      if (data.provisionedUser) {
        setProvisionedModal({
          institutionName: created.name,
          fullName: data.provisionedUser.fullName,
          email: data.provisionedUser.email,
          password: data.provisionedUser.password,
          role: data.provisionedUser.role,
        })
      } else {
        setNotification({
          type: 'success',
          message: `Institution "${created.name}" created! Ready for data ingestion.`,
          actionUrl: `/import?orgId=${created.id}`,
          actionLabel: 'Import CSV Data Now',
        })
      }

      // Reset form
      setAddName('')
      setAddSlug('')
      setAddWebsite('')
      setAdminFullName('')
      setAdminEmail('')
      router.refresh()
    } catch (err: any) {
      setAddError(err.message || 'Error creating institution')
    } finally {
      setAddingOrg(false)
    }
  }

  // Provision Staff User for Existing Institution
  const handleProvisionStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!staffModalOrg || !staffEmail.trim()) {
      setStaffError('Email is required')
      return
    }

    setStaffLoading(true)
    setStaffError(null)

    try {
      const res = await fetch('/api/v1/organizations/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: staffModalOrg.id,
          email: staffEmail.trim().toLowerCase(),
          fullName: staffFullName.trim() || staffEmail.split('@')[0],
          password: staffPassword,
          role: staffRole,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to provision staff account')
      }

      setStaffModalOrg(null)
      setProvisionedModal({
        institutionName: staffModalOrg.name,
        fullName: data.user.fullName,
        email: data.user.email,
        password: data.user.password,
        role: data.user.role,
      })

      // Update count locally
      setItems((prev) =>
        prev.map((item) =>
          item.id === staffModalOrg.id ? { ...item, usersCount: (item.usersCount || 0) + 1 } : item
        )
      )

      setStaffEmail('')
      setStaffFullName('')
      router.refresh()
    } catch (err: any) {
      setStaffError(err.message || 'Failed to create staff account')
    } finally {
      setStaffLoading(false)
    }
  }

  const copyCredentialsText = () => {
    if (!provisionedModal) return
    const text = `Vaasone Institutional Login Credentials\nInstitution: ${provisionedModal.institutionName}\nName: ${provisionedModal.fullName}\nEmail: ${provisionedModal.email}\nPassword: ${provisionedModal.password}\nRole: ${provisionedModal.role}\nSign In URL: ${window.location.origin}/auth/login`
    navigator.clipboard.writeText(text)
    setCopiedCreds(true)
    setTimeout(() => setCopiedCreds(false), 2500)
  }

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
    if (!confirm('Disconnect the SIS integration for this institution? Existing certificates will be preserved.')) return
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
    if (!confirm(`Permanently delete "${orgName}" and ALL its certificates? This cannot be undone.`)) return
    if (!confirm(`FINAL CONFIRMATION: Delete institution "${orgName}"? All blockchain anchored certificates will be removed from the platform.`)) return
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

  const totalCertificates = items.reduce((acc, inst) => acc + inst.credentialsCount, 0)
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
              {totalCertificates.toLocaleString()}
            </span>
            certificates
          </div>
          <div>
            <span className="block text-xl font-medium text-v-hero-text">
              {uniqueCountries || (items.length > 0 ? 1 : 0)}
            </span>
            countries
          </div>
        </div>
      </section>

      {/* ── Two-Stage Workflow Clarification Banner ────────── */}
      <section className="rounded-[24px] border border-v-border bg-v-surface p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="size-4 text-v-accent" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-v-muted-text">
            Two-Stage Platform Architecture
          </h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Stage 1 */}
          <div className="rounded-2xl border border-v-border bg-v-inset p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-v-text mb-1.5">
              <span className="grid size-5 place-items-center rounded-full bg-v-accent text-[10px] font-bold text-v-accent-fg">
                1
              </span>
              <span>Stage 1: Register Institution &amp; Provision Administrator</span>
            </div>
            <p className="text-xs text-v-secondary leading-relaxed">
              Provision university tenant and generate administrator/operator accounts. The assigned registrar logs into their dedicated institutional dashboard at <code className="font-mono text-v-accent">/auth/login</code>.
            </p>
            {isSystemAdmin && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-v-accent hover:underline"
              >
                <Plus className="size-3" /> Register new university tenant
              </button>
            )}
          </div>

          {/* Stage 2 */}
          <div className="rounded-2xl border border-v-border bg-v-inset p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-v-text mb-1.5">
              <span className="grid size-5 place-items-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                2
              </span>
              <span>Stage 2: Ingest Certificate Data (Populate Records)</span>
            </div>
            <p className="text-xs text-v-secondary leading-relaxed">
              Feed graduate certificates into that institution via <strong>CSV Bulk Migration</strong>, live <strong>Student Information System (SIS) API bridge</strong>, or <strong>Single Issuance</strong>.
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs font-semibold">
              <Link href="/import" className="text-v-accent hover:underline inline-flex items-center gap-1">
                <FileSpreadsheet className="size-3" /> CSV Import
              </Link>
              <span className="text-v-faint">·</span>
              <Link href="/institutions/connect" className="text-v-accent hover:underline inline-flex items-center gap-1">
                <Server className="size-3" /> SIS Bridge
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Connected institutions */}
      <section className="rounded-[24px] bg-v-overlay p-6 border border-v-border">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
              Connected institutions
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-v-text">
              Integration &amp; Issuing Tenants
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isSystemAdmin && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-v-accent px-3.5 py-2 text-xs font-semibold text-v-accent-fg hover:bg-v-accent-hover transition-colors shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>Add Institution</span>
              </button>
            )}
            <Link
              href="/import"
              className="inline-flex items-center gap-1.5 rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs font-semibold text-v-text hover:bg-v-hover transition-colors"
            >
              <FileSpreadsheet className="size-3.5" />
              <span>Import CSV</span>
            </Link>
            <Link
              href="/institutions/connect"
              className="inline-flex items-center gap-1.5 rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs font-semibold text-v-text hover:bg-v-hover transition-colors"
            >
              <Server className="size-3.5" />
              <span>Connect SIS</span>
            </Link>
          </div>
        </div>

        {notification && (
          <div
            className={`mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3.5 text-xs ${
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
              <span className="font-medium">{notification.message}</span>
            </div>
            <div className="flex items-center gap-2">
              {notification.actionUrl && (
                <Link
                  href={notification.actionUrl}
                  className="rounded-lg bg-emerald-600 dark:bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  {notification.actionLabel || 'Proceed'}
                </Link>
              )}
              <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100 p-1">
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-2xl bg-v-inset p-10 text-center">
            <Building2 className="mx-auto size-8 text-v-faint mb-2" />
            <h4 className="text-sm font-semibold text-v-text">No institutions found</h4>
            <p className="mt-1 text-xs text-v-secondary max-w-sm mx-auto">
              Create an institution to start issuing verified certificates through Vaasone.
            </p>
            {isSystemAdmin && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-v-accent px-4 py-2 text-xs font-semibold text-v-accent-fg"
              >
                <Plus className="size-3.5" /> Add First Institution
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((institution) => {
              const initials =
                institution.name
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
                  className="relative flex flex-col gap-3 rounded-2xl bg-v-inset p-4 border border-v-border sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Left: Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="grid size-11 place-items-center rounded-xl bg-v-accent text-xs font-bold text-v-accent-fg shrink-0">
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
                      <p className="mt-0.5 text-[11px] text-v-muted-text">
                        {institution.country} ·{' '}
                        <strong className="text-v-text font-semibold">
                          {institution.credentialsCount}
                        </strong>{' '}
                        certificates · <span className="capitalize">{institution.type}</span>
                        {sisConnected && (
                          <span className="ml-1 text-emerald-500 font-medium">· SIS Connected</span>
                        )}
                      </p>
                      {institution.credentialsCount === 0 && (
                        <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          No certificates registered yet. Ready for data ingestion.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2">
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
                      <span className="hidden rounded-full bg-v-success-bg px-2.5 py-1 text-[10px] font-semibold text-v-success lg:inline-flex items-center gap-1">
                        <ShieldCheck className="size-3" />
                        Accredited
                      </span>
                    )}

                    {/* Quick Action: Provision / Add Staff */}
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => {
                          setStaffModalOrg(institution)
                          const domain = institution.website ? institution.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : `${institution.slug}.edu.ng`
                          setStaffEmail(`operator@${domain}`)
                          setStaffFullName(`${institution.name} Operator`)
                          setStaffPassword(generatePassword(institution.slug.toUpperCase()))
                          setStaffRole('operator')
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-v-border bg-v-surface hover:bg-v-hover px-2.5 py-1.5 text-[11px] font-medium text-v-text transition-colors"
                        title="Add admin or operator account for this institution"
                      >
                        <UserPlus className="size-3 text-v-accent" />
                        <span>Add Staff</span>
                      </button>
                    )}

                    {/* Quick Data Action: Import CSV */}
                    <Link
                      href={`/import?orgId=${institution.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-v-border bg-v-surface hover:bg-v-hover px-2.5 py-1.5 text-[11px] font-medium text-v-text transition-colors"
                      title={`Import CSV data for ${institution.name}`}
                    >
                      <FileSpreadsheet className="size-3 text-v-accent" />
                      <span>Import CSV</span>
                    </Link>

                    {/* Quick Data Action: Connect SIS */}
                    <Link
                      href={`/institutions/connect?orgId=${institution.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-v-border bg-v-surface hover:bg-v-hover px-2.5 py-1.5 text-[11px] font-medium text-v-text transition-colors"
                      title={`Connect SIS for ${institution.name}`}
                    >
                      <Server className="size-3 text-v-tertiary" />
                      <span>SIS Bridge</span>
                    </Link>

                    {/* Quick Data Action: Issue Single Cert */}
                    <Link
                      href={`/issuer/issue?orgId=${institution.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-v-border bg-v-surface hover:bg-v-hover px-2.5 py-1.5 text-[11px] font-medium text-v-text transition-colors"
                      title={`Issue single certificate for ${institution.name}`}
                    >
                      <Plus className="size-3 text-v-tertiary" />
                      <span>Issue</span>
                    </Link>

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
                              Re-sync certificates
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

      {/* ── ADD NEW INSTITUTION MODAL (With Admin Account Provisioning) ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl border border-v-border bg-v-surface p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-v-border pb-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-v-accent">
                  Network Onboarding
                </span>
                <h3 className="text-xl font-bold tracking-tight text-v-text mt-0.5">
                  Register New Institution &amp; Admin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-v-faint hover:bg-v-hover hover:text-v-text"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Demo Quick Presets */}
            <div className="mt-4 rounded-xl bg-v-inset p-3 border border-v-border">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-v-muted-text mb-1.5">
                Quick Demo Presets (Auto-fills Institution &amp; Admin):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fillQuickPreset(
                      'University of Ibadan',
                      'ui',
                      'https://ui.edu.ng',
                      'Prof. Adesanya Fashola',
                      'admin@ui.edu.ng',
                      'UI-Vaas-2026!'
                    )
                  }
                  className="rounded-lg border border-v-border bg-v-surface px-2.5 py-1 text-[11px] font-medium text-v-text hover:bg-v-hover"
                >
                  + University of Ibadan (UI)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    fillQuickPreset(
                      'Ahmadu Bello University',
                      'abu',
                      'https://abu.edu.ng',
                      'Mallam Sani Aliyu',
                      'admin@abu.edu.ng',
                      'ABU-Vaas-2026!'
                    )
                  }
                  className="rounded-lg border border-v-border bg-v-surface px-2.5 py-1 text-[11px] font-medium text-v-text hover:bg-v-hover"
                >
                  + Ahmadu Bello University (ABU)
                </button>
              </div>
            </div>

            {addError && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleCreateInstitution} className="mt-4 space-y-4 text-xs">
              <div className="rounded-2xl border border-v-border bg-v-inset/40 p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-v-muted-text">
                  Institution Tenant Information
                </p>
                <div>
                  <label className="block font-semibold text-v-text mb-1">
                    Institution Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. University of Ibadan"
                    value={addName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-v-text mb-1">
                      Slug / Identifier <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. ui or abu"
                      value={addSlug}
                      onChange={(e) => setAddSlug(e.target.value)}
                      className="w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 font-mono text-xs text-v-text outline-none focus:border-v-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-v-text mb-1">
                      Institution Type
                    </label>
                    <select
                      value={addType}
                      onChange={(e) => setAddType(e.target.value)}
                      className="w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                    >
                      <option value="university">University</option>
                      <option value="polytechnic">Polytechnic</option>
                      <option value="college">College of Education</option>
                      <option value="exam_body">Examination Council</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-v-text mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      placeholder="Nigeria"
                      value={addCountry}
                      onChange={(e) => setAddCountry(e.target.value)}
                      className="w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-v-text mb-1">
                      Official Website
                    </label>
                    <input
                      type="url"
                      placeholder="https://ui.edu.ng"
                      value={addWebsite}
                      onChange={(e) => setAddWebsite(e.target.value)}
                      className="w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Institutional Administrator Account Provisioning */}
              <div className="rounded-2xl border border-v-accent/30 bg-v-accent/[0.04] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="size-4 text-v-accent" />
                    <span className="font-semibold text-v-text">
                      Provision Initial Administrator Login
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-v-secondary">
                    <input
                      type="checkbox"
                      checked={provisionAdmin}
                      onChange={(e) => setProvisionAdmin(e.target.checked)}
                      className="rounded border-v-border accent-v-accent"
                    />
                    <span>Enable</span>
                  </label>
                </div>

                {provisionAdmin && (
                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] text-v-secondary">
                      This creates a confirmed administrator login. The university team will log in at <code className="font-mono text-v-accent">/auth/login</code> to access this institution&apos;s workspace.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-v-secondary mb-1">
                          Admin Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Prof. Adesanya Fashola"
                          value={adminFullName}
                          onChange={(e) => setAdminFullName(e.target.value)}
                          className="w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-v-secondary mb-1">
                          Role
                        </label>
                        <select
                          value={adminRole}
                          onChange={(e) => setAdminRole(e.target.value as any)}
                          className="w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                        >
                          <option value="admin">Institution Admin (Full Control)</option>
                          <option value="operator">Operator (Issuance only)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-v-secondary mb-1">
                          Work Email (Login ID) <span className="text-red-500">*</span>
                        </label>
                        <input
                          required={provisionAdmin}
                          type="email"
                          placeholder="admin@ui.edu.ng"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-medium text-v-secondary">
                            Initial Password
                          </label>
                          <button
                            type="button"
                            onClick={() => setAdminPassword(generatePassword(addSlug.toUpperCase() || 'UI'))}
                            className="text-[10px] text-v-accent hover:underline"
                          >
                            Generate
                          </button>
                        </div>
                        <input
                          required={provisionAdmin}
                          type="text"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 font-mono text-xs text-v-text outline-none focus:border-v-accent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="addVerified"
                  checked={addVerified}
                  onChange={(e) => setAddVerified(e.target.checked)}
                  className="rounded border-v-border accent-v-accent"
                />
                <label htmlFor="addVerified" className="text-xs text-v-secondary select-none">
                  Accredit immediately (Active Tenant with certificate issuance rights)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-v-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-v-border px-4 py-2 font-medium text-v-secondary hover:bg-v-hover"
                >
                  Cancel
                </button>
                <button
                  disabled={addingOrg}
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-v-accent px-5 py-2 font-semibold text-v-accent-fg hover:opacity-90 disabled:opacity-50"
                >
                  {addingOrg ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  <span>Save &amp; Provision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PROVISIONED CREDENTIALS SUCCESS MODAL ───────────── */}
      {provisionedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-v-border bg-v-surface p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Check className="size-6" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                  Ready For Log In
                </span>
                <h3 className="text-xl font-bold tracking-tight text-v-text">
                  Administrator Account Provisioned
                </h3>
              </div>
            </div>

            <p className="text-xs text-v-secondary leading-relaxed">
              The administrator account for <strong className="text-v-text">{provisionedModal.institutionName}</strong> has been configured. They can immediately log in to their isolated institutional portal.
            </p>

            <div className="rounded-2xl border border-v-border bg-v-inset p-4 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-v-border">
                <span className="text-v-muted-text font-sans">Institution:</span>
                <span className="font-semibold text-v-text font-sans">{provisionedModal.institutionName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-v-border">
                <span className="text-v-muted-text font-sans">Assigned Name:</span>
                <span className="text-v-text font-sans">{provisionedModal.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-v-border">
                <span className="text-v-muted-text font-sans">Role:</span>
                <span className="capitalize text-emerald-600 dark:text-emerald-400 font-sans font-semibold">
                  {provisionedModal.role === 'admin' ? 'Institution Admin' : 'Institution Operator'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-v-border">
                <span className="text-v-muted-text font-sans">Email (Login):</span>
                <span className="text-v-accent font-semibold">{provisionedModal.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-v-border">
                <span className="text-v-muted-text font-sans">Password:</span>
                <span className="text-v-text font-semibold">{provisionedModal.password}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-v-muted-text font-sans">Login Portal URL:</span>
                <span className="text-v-secondary font-sans">/auth/login</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={copyCredentialsText}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-v-border bg-v-raised px-4 py-2.5 text-xs font-semibold text-v-text hover:bg-v-hover transition-colors"
              >
                {copiedCreds ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy Credentials</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setProvisionedModal(null)}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-v-accent px-5 py-2.5 text-xs font-semibold text-v-accent-fg hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD STAFF / OPERATOR TO EXISTING INSTITUTION MODAL ── */}
      {staffModalOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-v-border bg-v-surface p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-v-border pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-v-accent">
                  Tenant Access
                </span>
                <h3 className="text-lg font-bold tracking-tight text-v-text mt-0.5">
                  Add Staff to {staffModalOrg.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStaffModalOrg(null)}
                className="rounded-lg p-1.5 text-v-faint hover:bg-v-hover hover:text-v-text"
              >
                <X className="size-4" />
              </button>
            </div>

            {staffError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{staffError}</span>
              </div>
            )}

            <form onSubmit={handleProvisionStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-v-text mb-1">
                  Staff Member Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dr. Kelechi Divine"
                  value={staffFullName}
                  onChange={(e) => setStaffFullName(e.target.value)}
                  className="w-full rounded-xl border border-v-border bg-v-inset px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-v-text mb-1">
                  Staff Work Email (Login) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  placeholder="e.g. registrar@ui.edu.ng"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full rounded-xl border border-v-border bg-v-inset px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-v-text mb-1">
                    Role
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full rounded-xl border border-v-border bg-v-inset px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                  >
                    <option value="operator">Operator (Issue/Verify)</option>
                    <option value="admin">Institution Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-v-text mb-1">
                    Temporary Password
                  </label>
                  <input
                    required
                    type="text"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="w-full rounded-xl border border-v-border bg-v-inset px-3 py-2 font-mono text-xs text-v-text outline-none focus:border-v-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-v-border">
                <button
                  type="button"
                  onClick={() => setStaffModalOrg(null)}
                  className="rounded-xl border border-v-border px-4 py-2 font-medium text-v-secondary hover:bg-v-hover"
                >
                  Cancel
                </button>
                <button
                  disabled={staffLoading}
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-v-accent px-5 py-2 font-semibold text-v-accent-fg hover:opacity-90 disabled:opacity-50"
                >
                  {staffLoading ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
