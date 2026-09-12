'use client'

import { useState, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Copy,
  ExternalLink,
  Fingerprint,
  Loader2,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

export default function StandaloneIssuePage() {
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  const [form, setForm] = useState({
    credentialId: `VAAS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    organizationId: '',
    recipientName: '',
    recipientEmail: '',
    studentReference: '',
    credentialType: 'degree',
    programme: '',
    awardTitle: '',
    classification: 'First Class Honours',
    graduationDate: new Date().toISOString().split('T')[0],
    certificateNumber: `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
  })

  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const res = await fetch('/api/v1/organizations')
        const data = await res.json()
        if (data.organizations && data.organizations.length > 0) {
          setOrganizations(data.organizations)
          setForm((f) => ({ ...f, organizationId: data.organizations[0].id }))
        }
      } catch {
        // Handled gracefully
      } finally {
        setLoadingOrgs(false)
      }
    }
    loadOrganizations()
  }, [])

  function regenerateId() {
    setForm((f) => ({
      ...f,
      credentialId: `VAAS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      certificateNumber: `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
    }))
  }

  function update(key: keyof typeof form, value: string) {
    setForm((curr) => ({ ...curr, [key]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    setSuccessData(null)

    if (!form.organizationId) {
      setError('Please select or create an organization first before issuing credentials.')
      setPending(false)
      return
    }

    try {
      const response = await fetch('/api/v1/credentials/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': form.credentialId,
        },
        body: JSON.stringify(form),
      })

      const body = await response.json()
      if (!response.ok) {
        throw new Error(body.error || 'Issuance failed')
      }

      setSuccessData(body.credential)
    } catch (err: any) {
      setError(err.message || 'Credential issuance could not be completed.')
    } finally {
      setPending(false)
    }
  }

  function handleReset() {
    regenerateId()
    setSuccessData(null)
    setForm((f) => ({
      ...f,
      recipientName: '',
      recipientEmail: '',
      studentReference: '',
      programme: '',
      awardTitle: '',
    }))
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard error fallback */
    }
  }

  return (
    <main className="min-h-screen bg-v-bg p-4 text-v-text sm:p-6 lg:p-10">
      <div className="mx-auto max-w-3xl">
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/credentials"
            className="inline-flex items-center gap-2 rounded-xl border border-v-border bg-v-surface px-3.5 py-2 text-xs font-semibold text-v-secondary transition hover:bg-v-hover hover:text-v-text"
          >
            <ArrowLeft className="size-4" />
            Back to Registry
          </Link>
          <div className="flex items-center gap-2 text-xs text-v-tertiary">
            <span className="size-2 rounded-full bg-v-success-dot animate-pulse" />
            Stellar &amp; BNB Anchoring Active
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-v-border bg-v-surface p-6 shadow-[var(--v-shadow)] sm:p-10">
          {/* Header */}
          <div className="border-b border-v-border pb-6">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-v-accent">
              <Award className="size-3.5" />
              {APP_NAME} Credential Issuance Engine
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-v-text sm:text-4xl">
              Issue Academic Credential
            </h1>
            <p className="mt-2 text-sm text-v-secondary">
              Generate a cryptographically signed credential and anchor its SHA-256 fingerprint onto public blockchain ledgers.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-600 dark:text-red-400">
              <ShieldAlert className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successData ? (
            <div className="mt-8 rounded-2xl border border-v-success/30 bg-v-success-bg/20 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-v-success text-white">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-v-text">Credential Issued Successfully</h3>
                  <p className="text-xs text-v-secondary">
                    Cryptographic hash registered and queued for blockchain settlement.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 rounded-xl bg-v-surface p-4 text-xs border border-v-border">
                <div className="flex justify-between py-1 border-b border-v-border">
                  <span className="text-v-faint">Credential ID:</span>
                  <span className="font-mono font-semibold text-v-text">{successData.credential_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-v-border">
                  <span className="text-v-faint">Recipient:</span>
                  <span className="font-semibold text-v-text">{successData.recipient_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-v-border">
                  <span className="text-v-faint">Programme:</span>
                  <span className="text-v-text">{successData.programme}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-v-border">
                  <span className="text-v-faint">Document Hash:</span>
                  <span className="font-mono text-[10px] text-v-tertiary truncate max-w-[280px]">
                    {successData.document_hash}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-v-faint">Status:</span>
                  <span className="font-medium text-v-success capitalize">{successData.status}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/v/${encodeURIComponent(successData.credential_id)}`}
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl bg-v-accent px-4 py-2.5 text-xs font-semibold text-v-accent-fg hover:opacity-95"
                >
                  <ExternalLink className="size-3.5" />
                  View Public Verification Certificate
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    copyLink(
                      `${typeof window !== 'undefined' ? window.location.origin : ''}/v/${encodeURIComponent(
                        successData.credential_id
                      )}`
                    )
                  }
                  className="flex items-center gap-2 rounded-xl border border-v-border bg-v-surface px-4 py-2.5 text-xs font-semibold text-v-text hover:bg-v-hover"
                >
                  <Copy className="size-3.5" />
                  {copied ? 'Copied Link!' : 'Copy Verify URL'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-xl border border-v-border bg-v-surface px-4 py-2.5 text-xs font-semibold text-v-secondary hover:bg-v-hover"
                >
                  <Plus className="size-3.5" />
                  Issue Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 grid gap-6">
              {/* Institution and Identifier */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-v-text">
                    Issuing Organization <span className="text-red-500">*</span>
                  </label>
                  {loadingOrgs ? (
                    <div className="mt-2 flex h-10 items-center gap-2 rounded-xl border border-v-border bg-v-inset px-3 text-xs text-v-faint">
                      <Loader2 className="size-3 animate-spin" /> Loading institutions...
                    </div>
                  ) : organizations.length === 0 ? (
                    <div className="mt-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-2.5 text-xs text-yellow-600">
                      No organizations found. Please create one on the dashboard.
                    </div>
                  ) : (
                    <select
                      required
                      value={form.organizationId}
                      onChange={(e) => update('organizationId', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-v-border bg-v-inset px-3 py-2.5 text-xs text-v-text outline-none focus:border-v-accent"
                    >
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-v-text">
                      Credential ID <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={regenerateId}
                      className="inline-flex items-center gap-1 text-[10px] text-v-tertiary hover:text-v-text"
                    >
                      <RefreshCw className="size-2.5" /> Auto-generate
                    </button>
                  </div>
                  <input
                    required
                    type="text"
                    value={form.credentialId}
                    onChange={(e) => update('credentialId', e.target.value)}
                    className="mt-2 w-full rounded-xl border border-v-border bg-v-inset px-3 py-2.5 font-mono text-xs text-v-text outline-none focus:border-v-accent"
                  />
                </div>
              </div>

              {/* Recipient Details */}
              <div className="rounded-2xl bg-v-raised p-4 sm:p-5 border border-v-border">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text mb-4">
                  Recipient Identity
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-v-secondary">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      placeholder="e.g. Amara Okafor"
                      value={form.recipientName}
                      onChange={(e) => update('recipientName', e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-v-secondary">
                      Student Reference / Matric No
                    </label>
                    <input
                      placeholder="e.g. UNILAG/2022/CSC/042"
                      value={form.studentReference}
                      onChange={(e) => update('studentReference', e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-v-secondary">
                      Recipient Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="amara@alumni.edu"
                      value={form.recipientEmail}
                      onChange={(e) => update('recipientEmail', e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Award Details */}
              <div className="rounded-2xl bg-v-raised p-4 sm:p-5 border border-v-border">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text mb-4">
                  Academic Award
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-v-secondary">
                      Programme of Study <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      placeholder="e.g. B.Sc Computer Science"
                      value={form.programme}
                      onChange={(e) => update('programme', e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-v-secondary">
                      Credential Type
                    </label>
                    <select
                      value={form.credentialType}
                      onChange={(e) => update('credentialType', e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                    >
                      <option value="degree">Bachelor / Master / Doctorate Degree</option>
                      <option value="diploma">Higher Diploma</option>
                      <option value="certificate">Postgraduate Certificate</option>
                      <option value="professional">Professional License</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-v-secondary">
                      Classification / Grade
                    </label>
                    <input
                      placeholder="e.g. First Class Honours / Distinction"
                      value={form.classification}
                      onChange={(e) => update('classification', e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 text-xs text-v-text outline-none focus:border-v-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-v-secondary">
                      Certificate Serial Number
                    </label>
                    <input
                      value={form.certificateNumber}
                      onChange={(e) => update('certificateNumber', e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-v-border bg-v-surface px-3 py-2 font-mono text-xs text-v-text outline-none focus:border-v-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                disabled={pending || organizations.length === 0}
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-v-accent py-3.5 text-xs font-semibold text-v-accent-fg transition hover:opacity-95 disabled:opacity-50"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing &amp; Anchoring Credential...
                  </>
                ) : (
                  <>
                    <Fingerprint className="size-4" />
                    Sign &amp; Issue Credential
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
