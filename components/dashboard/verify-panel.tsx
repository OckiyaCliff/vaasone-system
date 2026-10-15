'use client'

import { useState, useEffect, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  AlertOctagon,
  ArrowUpRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  CircleHelp,
  Copy,
  ExternalLink,
  Fingerprint,
  GraduationCap,
  History,
  Layers,
  Loader2,
  Lock,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react'

type VerifyState = 'idle' | 'loading' | 'valid' | 'revoked' | 'altered' | 'superseded' | 'unknown'

type InstitutionOption = {
  id: string
  name: string
  slug: string
  country: string
}

function VerifyPanelContent() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get('id') || searchParams.get('credentialId') || ''

  const [activeTab, setActiveTab] = useState<'direct' | 'advanced'>('direct')
  const [credentialId, setCredentialId] = useState(initialId)
  const [state, setState] = useState<VerifyState>('idle')
  const [result, setResult] = useState<any>(null)
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedTx, setCopiedTx] = useState(false)

  // Advanced search parameters
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([])
  const [selectedOrg, setSelectedOrg] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [studentRef, setStudentRef] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [certificateNumber, setCertificateNumber] = useState('')
  const [advancedResults, setAdvancedResults] = useState<any[]>([])
  const [advancedLoading, setAdvancedLoading] = useState(false)
  const [advancedError, setAdvancedError] = useState<string | null>(null)

  // Load institutions list for dropdown
  useEffect(() => {
    fetch('/api/v1/organizations')
      .then((res) => res.json())
      .then((data) => {
        const orgs = Array.isArray(data) ? data : data.organizations || []
        setInstitutions(orgs)
      })
      .catch(() => {
        // Fallback default list
        setInstitutions([
          { id: '1', name: 'Apex University', slug: 'apex-university', country: 'Nigeria' },
          { id: '2', name: 'University of Lagos', slug: 'unilag', country: 'Nigeria' },
          { id: '3', name: 'Covenant University', slug: 'covenant', country: 'Nigeria' },
          { id: '4', name: 'University of Nairobi', slug: 'uon', country: 'Kenya' },
          { id: '5', name: 'Ashesi University', slug: 'ashesi', country: 'Ghana' },
        ])
      })
  }, [])

  // Auto-verify if ID passed via URL query
  useEffect(() => {
    if (initialId.trim()) {
      verifyDirect(initialId.trim())
    }
  }, [initialId])

  async function verifyDirect(targetId?: string) {
    const normalizedId = (targetId || credentialId).trim()
    if (!normalizedId) {
      setState('unknown')
      return
    }

    setState('loading')
    setResult(null)

    try {
      const res = await fetch(`/api/v1/verify?id=${encodeURIComponent(normalizedId)}`)
      const body = await res.json().catch(() => ({}))

      if (res.ok && body.outcome) {
        setState(body.outcome)
        setResult(body)
      } else if (body.outcome) {
        setState(body.outcome)
        setResult(body)
      } else {
        setState('unknown')
        setResult(null)
      }
    } catch {
      setState('unknown')
      setResult(null)
    }
  }

  async function handleAdvancedSearch() {
    setAdvancedLoading(true)
    setAdvancedError(null)
    setAdvancedResults([])

    const params = new URLSearchParams()
    if (selectedOrg) params.set('org', selectedOrg)
    if (gradYear) params.set('year', gradYear)
    if (studentRef.trim()) params.set('matric', studentRef.trim())
    if (candidateName.trim()) params.set('name', candidateName.trim())
    if (certificateNumber.trim()) params.set('cert_no', certificateNumber.trim())
    params.set('mode', 'employer')

    try {
      const res = await fetch(`/api/v1/verify?${params.toString()}`)
      const data = await res.json()

      if (!res.ok && res.status !== 404) {
        setAdvancedError(data.error || data.message || 'Search failed')
        return
      }

      if (data.policy_restricted) {
        setAdvancedError(data.message || 'Search restricted by institutional policy.')
        return
      }

      const list = data.certificates || (data.credential ? [data.credential] : [])
      setAdvancedResults(list)
      if (list.length === 0) {
        setAdvancedError('No matching academic certificates found.')
      }
    } catch (err: any) {
      setAdvancedError(err.message || 'Error executing search query.')
    } finally {
      setAdvancedLoading(false)
    }
  }

  async function copyToClipboard(text: string, isHash: boolean) {
    try {
      await navigator.clipboard.writeText(text)
      if (isHash) {
        setCopiedHash(true)
        setTimeout(() => setCopiedHash(false), 2000)
      } else {
        setCopiedTx(true)
        setTimeout(() => setCopiedTx(false), 2000)
      }
    } catch {
      /* clipboard fallback */
    }
  }

  const statusConfig: Record<
    VerifyState,
    { bg: string; border: string; color: string; icon: any; title: string; desc: string }
  > = {
    idle: {
      bg: '',
      border: '',
      color: '',
      icon: Fingerprint,
      title: '',
      desc: '',
    },
    loading: {
      bg: '',
      border: '',
      color: '',
      icon: Loader2,
      title: 'Verifying on-chain...',
      desc: '',
    },
    valid: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      border: 'border-emerald-500/30',
      color: 'text-emerald-700 dark:text-emerald-400',
      icon: CheckCircle2,
      title: 'Certificate Authentic & Active',
      desc: 'Cryptographic SHA-256 hash verified and anchored to public Stellar ledger.',
    },
    revoked: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      border: 'border-rose-500/30',
      color: 'text-rose-700 dark:text-rose-400',
      icon: AlertOctagon,
      title: 'Certificate Revoked by Issuer',
      desc: 'This academic award was permanently revoked by the issuing institution.',
    },
    altered: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      border: 'border-rose-500/30',
      color: 'text-rose-700 dark:text-rose-400',
      icon: ShieldAlert,
      title: 'Integrity Violation (Altered)',
      desc: 'The cryptographic hash does not match. This certificate record has been modified or tampered with.',
    },
    superseded: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      border: 'border-amber-500/30',
      color: 'text-amber-700 dark:text-amber-400',
      icon: History,
      title: 'Certificate Superseded',
      desc: 'A newer updated version of this academic certificate has been re-issued.',
    },
    unknown: {
      bg: 'bg-neutral-500/10 dark:bg-neutral-500/15',
      border: 'border-neutral-500/30',
      color: 'text-neutral-700 dark:text-neutral-400',
      icon: CircleHelp,
      title: 'Unrecognized Certificate Identifier',
      desc: 'No record matching this identifier was found in the network registry.',
    },
  }

  const activeConfig = statusConfig[state]
  const StatusIcon = activeConfig.icon

  const documentHash =
    result?.credential?.document_hash || result?.anchor?.anchor_hash || null

  return (
    <div className="flex flex-col gap-6">
      {/* Top Engine Banner */}
      <section className="rounded-[24px] bg-v-hero p-7 text-v-hero-text sm:p-9">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-v-hero-faint">
              Cryptographic Trust Engine
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-medium tracking-[-0.07em]">
              Verification &amp; Academic Directory
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-v-hero-ghost max-w-xl">
              Query the distributed Stellar ledger to confirm degree issuance, verify cryptographic hash digests, and search across accredited institutions.
            </p>
          </div>
          <ShieldCheck className="size-8 text-v-hero-muted shrink-0 ml-4" />
        </div>

        {/* Tab switchers */}
        <div className="mt-8 flex items-center gap-2 border-t border-v-hero-border pt-5">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'direct'
                ? 'bg-white text-black shadow-sm'
                : 'bg-white/10 text-white/80 hover:bg-white/15'
            }`}
          >
            <Shield className="size-3.5" />
            Direct Certificate Lookup
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'advanced'
                ? 'bg-white text-black shadow-sm'
                : 'bg-white/10 text-white/80 hover:bg-white/15'
            }`}
          >
            <Building2 className="size-3.5" />
            Robust Directory Search
            <span className="rounded-full bg-emerald-400 px-1.5 py-0.2 text-[9px] font-bold text-black uppercase">
              Full Filter
            </span>
          </button>
        </div>
      </section>

      {/* ── TAB 1: Direct Verification ── */}
      {activeTab === 'direct' && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col gap-5 rounded-[24px] border border-v-border bg-v-surface p-6 sm:p-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                Direct Search
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-v-text">
                Verify by Certificate ID or Stellar Hash
              </h3>
              <p className="mt-1 text-xs text-v-secondary">
                Enter the unique certificate identifier (e.g. <code className="font-mono text-v-accent">VAAS-APEX-UNI-2024-...</code>) or the SHA-256 root digest.
              </p>
            </div>

            {/* Input Box */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <input
                  value={credentialId}
                  onChange={(e) => {
                    setCredentialId(e.target.value)
                    if (state !== 'idle') setState('idle')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && verifyDirect()}
                  placeholder="e.g. VAAS-APEX-UNI-2024-CS0042 or VAAS-UNILAG-2026-001"
                  className="w-full rounded-xl border border-v-border bg-v-inset px-4 py-3 font-mono text-xs text-v-text outline-none transition placeholder:font-sans placeholder:text-v-faint focus:border-v-accent"
                />
              </div>
              <button
                onClick={() => verifyDirect()}
                disabled={state === 'loading'}
                className="flex items-center justify-center gap-2 rounded-xl bg-v-accent px-5 py-3 text-xs font-semibold text-v-accent-fg transition hover:opacity-95 disabled:opacity-50 shrink-0"
              >
                {state === 'loading' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Checking Ledger...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    <span>Verify Record</span>
                  </>
                )}
              </button>
            </div>

            {/* Sample quick pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-v-faint">
              <span>Quick tests:</span>
              <button
                type="button"
                onClick={() => {
                  setCredentialId('VAAS-APEX-UNI-2024-CS0042')
                  verifyDirect('VAAS-APEX-UNI-2024-CS0042')
                }}
                className="rounded-lg border border-v-border bg-v-inset px-2.5 py-1 text-[11px] font-mono text-v-secondary hover:text-v-text transition"
              >
                Apex: Tunde Bakare
              </button>
              <button
                type="button"
                onClick={() => {
                  setCredentialId('VAAS-UNILAG-2026-001')
                  verifyDirect('VAAS-UNILAG-2026-001')
                }}
                className="rounded-lg border border-v-border bg-v-inset px-2.5 py-1 text-[11px] font-mono text-v-secondary hover:text-v-text transition"
              >
                Unilag: Chidinma Adebayo
              </button>
              <button
                type="button"
                onClick={() => {
                  setCredentialId('VAAS-CU-2026-001')
                  verifyDirect('VAAS-CU-2026-001')
                }}
                className="rounded-lg border border-v-border bg-v-inset px-2.5 py-1 text-[11px] font-mono text-v-secondary hover:text-v-text transition"
              >
                Covenant: David Oladipo
              </button>
            </div>

            {/* Outcome banner */}
            {state !== 'idle' && state !== 'loading' && (
              <div className={`rounded-2xl border p-4.5 ${activeConfig.bg} ${activeConfig.border}`}>
                <div className="flex items-start gap-3">
                  <StatusIcon className={`size-5 shrink-0 mt-0.5 ${activeConfig.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className={`text-sm font-semibold ${activeConfig.color}`}>
                        {activeConfig.title}
                      </h3>
                      {result?.verified_at && (
                        <span className="text-[11px] text-v-faint font-mono">
                          {new Date(result.verified_at).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-v-secondary">{activeConfig.desc}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Credential Details Card */}
            {result?.credential && (
              <div className="rounded-2xl border border-v-border bg-v-inset p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between border-b border-v-border pb-3">
                  <div>
                    <h4 className="text-base font-bold text-v-text">
                      {result.credential.recipient_name}
                    </h4>
                    <p className="text-xs text-v-secondary mt-0.5">
                      {result.credential.programme}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {result.credential.classification || 'Degree Awarded'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-v-faint block">Institution</span>
                    <span className="font-medium text-v-text">{result.credential.institution || result.credential.organizations?.name || 'Apex University'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-v-faint block">Matric / Student Ref</span>
                    <span className="font-mono text-v-secondary">{result.credential.student_reference || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-v-faint block">Graduation Date</span>
                    <span className="text-v-secondary">{result.credential.graduation_date || result.credential.issue_date || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-v-faint block">Certificate Number</span>
                    <span className="font-mono text-v-secondary">{result.credential.certificate_number || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-v-faint block">Certificate ID</span>
                    <span className="font-mono text-v-secondary truncate block">{result.credential.credential_id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-v-faint block">Public Verification</span>
                    <Link
                      href={`/v/${result.credential.credential_id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-v-accent hover:underline font-semibold"
                    >
                      View Badge <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Blockchain & Cryptography Panel */}
          <section className="flex flex-col gap-4 rounded-[24px] border border-v-border bg-v-surface p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                Trust Ledger
              </p>
              <h3 className="mt-1 text-base font-semibold text-v-text">
                Cryptographic Anchor Proof
              </h3>
            </div>

            <div className="rounded-2xl border border-v-border bg-v-inset p-4 flex flex-col gap-3 text-xs">
              <div>
                <span className="text-[10px] font-semibold uppercase text-v-faint block">Network</span>
                <span className="font-medium text-v-text flex items-center gap-1.5 mt-0.5">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Stellar Testnet (Public Consensus)
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase text-v-faint block">SHA-256 Digest</span>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="font-mono text-[11px] text-v-secondary break-all">
                    {documentHash || 'Awaiting query...'}
                  </span>
                  {documentHash && (
                    <button
                      onClick={() => copyToClipboard(documentHash, true)}
                      className="shrink-0 rounded p-1 text-v-faint hover:text-v-text"
                    >
                      {copiedHash ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    </button>
                  )}
                </div>
              </div>

              {result?.anchor?.transaction_id && (
                <div>
                  <span className="text-[10px] font-semibold uppercase text-v-faint block">Stellar Transaction ID</span>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="font-mono text-[11px] text-v-secondary truncate">
                      {result.anchor.transaction_id}
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.anchor.transaction_id, false)}
                      className="shrink-0 rounded p-1 text-v-faint hover:text-v-text"
                    >
                      {copiedTx ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    </button>
                  </div>
                </div>
              )}

              {result?.anchor?.explorer_url && (
                <div className="pt-2 border-t border-v-border">
                  <a
                    href={result.anchor.explorer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-v-accent text-xs font-semibold hover:underline"
                  >
                    View on Stellar Expert Explorer <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ── TAB 2: Robust Multi-Parameter Directory Search ── */}
      {activeTab === 'advanced' && (
        <div className="flex flex-col gap-6">
          <section className="rounded-[24px] border border-v-border bg-v-surface p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                Multi-Parameter Query
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-[-0.04em] text-v-text">
                Accredited Institutional Registry Search
              </h3>
              <p className="mt-1 text-xs text-v-secondary">
                Search graduates and academic certificates using institution, matriculation number, graduation year, or graduate name.
              </p>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold uppercase text-v-muted-text block mb-1.5">
                  Institution
                </label>
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="w-full rounded-xl border border-v-border bg-v-inset px-3 py-2.5 text-xs text-v-text outline-none focus:border-v-accent"
                >
                  <option value="">All Accredited Institutions</option>
                  {institutions.map((org) => (
                    <option key={org.id} value={org.slug}>
                      {org.name} ({org.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-v-muted-text block mb-1.5">
                  Graduation Year
                </label>
                <select
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  className="w-full rounded-xl border border-v-border bg-v-inset px-3 py-2.5 text-xs text-v-text outline-none focus:border-v-accent"
                >
                  <option value="">All Years</option>
                  <option value="2026">2026 (Current Academic Class)</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-v-muted-text block mb-1.5">
                  Roll / Matriculation Number
                </label>
                <input
                  type="text"
                  value={studentRef}
                  onChange={(e) => setStudentRef(e.target.value)}
                  placeholder="e.g. APEX/2021/CS/0042 or 0042"
                  className="w-full rounded-xl border border-v-border bg-v-inset px-3 py-2.5 text-xs font-mono text-v-text outline-none focus:border-v-accent"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-v-muted-text block mb-1.5">
                  Candidate Full Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Tunde Bakare or Fatima"
                  className="w-full rounded-xl border border-v-border bg-v-inset px-3 py-2.5 text-xs text-v-text outline-none focus:border-v-accent"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-v-muted-text block mb-1.5">
                  Certificate Serial Number
                </label>
                <input
                  type="text"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  placeholder="e.g. APEX-2024-0042"
                  className="w-full rounded-xl border border-v-border bg-v-inset px-3 py-2.5 text-xs font-mono text-v-text outline-none focus:border-v-accent"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAdvancedSearch}
                  disabled={advancedLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-v-accent px-4 py-2.5 text-xs font-semibold text-v-accent-fg transition hover:opacity-95 disabled:opacity-50"
                >
                  {advancedLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Searching Directory...</span>
                    </>
                  ) : (
                    <>
                      <Search className="size-4" />
                      <span>Execute Directory Query</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error / Alert notice */}
            {advancedError && (
              <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <AlertOctagon className="size-4 shrink-0" />
                <span>{advancedError}</span>
              </div>
            )}
          </section>

          {/* Results list */}
          {advancedResults.length > 0 && (
            <section className="rounded-[24px] border border-v-border bg-v-surface p-6 sm:p-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-semibold text-v-text">
                    Search Results ({advancedResults.length} records)
                  </h4>
                  <p className="text-xs text-v-secondary">
                    Cryptographically matched records anchored on the trust layer.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {advancedResults.map((cert) => (
                  <div
                    key={cert.credential_id}
                    className="rounded-2xl border border-v-border bg-v-inset p-5 flex flex-col justify-between gap-3 hover:border-v-accent/50 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="text-sm font-bold text-v-text">{cert.recipient_name}</h5>
                          <p className="text-xs text-v-secondary">{cert.programme}</p>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {cert.status || 'Active'}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-v-secondary">
                        <div>
                          <span className="text-[10px] text-v-faint block">Institution</span>
                          <span className="font-medium text-v-text">{cert.institution || cert.organizations?.name || 'Apex University'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-v-faint block">Roll / Matric</span>
                          <span className="font-mono">{cert.student_reference || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-v-faint block">Graduation</span>
                          <span>{cert.graduation_date || cert.issue_date || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-v-faint block">Classification</span>
                          <span>{cert.classification || 'Degree Awarded'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-v-border flex items-center justify-between">
                      <span className="font-mono text-[10px] text-v-faint truncate max-w-[160px]">
                        {cert.credential_id}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCredentialId(cert.credential_id)
                            setActiveTab('direct')
                            verifyDirect(cert.credential_id)
                          }}
                          className="rounded-lg bg-v-accent px-3 py-1 text-[11px] font-semibold text-v-accent-fg hover:opacity-90"
                        >
                          Verify On-Chain
                        </button>
                        <Link
                          href={`/v/${cert.credential_id}`}
                          target="_blank"
                          className="rounded-lg border border-v-border p-1 text-v-secondary hover:text-v-text"
                          title="Open Public Proof"
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export function VerifyPanel() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-v-secondary">Loading Trust Engine...</div>}>
      <VerifyPanelContent />
    </Suspense>
  )
}
