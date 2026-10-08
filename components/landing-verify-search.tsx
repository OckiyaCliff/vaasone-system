'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ArrowRight,
  ExternalLink,
  Shield,
  Copy,
  Check,
  Loader2,
  Lock,
  Building2,
  Calendar,
  UserCheck,
  Award,
  Sparkles,
  Info,
} from 'lucide-react'

type PublicInstitution = {
  id: string
  name: string
  slug: string
  country: string
  isVerified: boolean
}

type VerificationCertificateItem = {
  credential_id: string
  recipient_name: string
  student_reference?: string | null
  programme: string
  credential_type: string
  issue_date: string
  graduation_date?: string | null
  certificate_number?: string | null
  classification?: string | null
  status: string
  institution: string
  country?: string | null
  document_hash?: string | null
  is_accredited?: boolean
}

type VerificationResultData = {
  outcome: 'valid' | 'revoked' | 'altered' | 'superseded' | 'unknown'
  credential?: VerificationCertificateItem
  certificates?: VerificationCertificateItem[]
  total?: number
  anchor?: {
    network: string
    provider: string
    status: string
    transaction_id: string
    ledger?: number | string
    explorer_url?: string | null
    anchor_hash?: string
    confirmed_at?: string
  }
  blockchain_verified?: boolean
  verified_at?: string
  policy_restricted?: boolean
  message?: string
}

const SAMPLE_DIRECT = [
  { label: 'Unilag BSc CS', id: 'VAAS-UNILAG-2026-001' },
  { label: 'Covenant BEng', id: 'VAAS-CU-2026-001' },
  { label: 'Ashesi BA', id: 'VAAS-ASHESI-2026-001' },
]

const SAMPLE_EMPLOYER = [
  {
    label: 'Unilag · 2026 · CS Graduate',
    orgSlug: 'unilag',
    year: '2026',
    matric: 'UNILAG/2022/CSC/089',
  },
  {
    label: 'Covenant · 2026 · EIE Graduate',
    orgSlug: 'covenant',
    year: '2026',
    matric: 'CU/2021/EIE/003',
  },
]

export function LandingVerifySearch({
  variant = 'default',
  className = '',
}: {
  variant?: 'default' | 'dark'
  className?: string
}) {
  const isDark = variant === 'dark'

  // Tab mode: 'direct' (Public ID/Hash) vs 'employer' (Accredited Search)
  const [activeTab, setActiveTab] = useState<'direct' | 'employer'>('direct')

  // Direct tab state
  const [directQuery, setDirectQuery] = useState('')

  // Employer tab state
  const [selectedOrg, setSelectedOrg] = useState('')
  const [graduationYear, setGraduationYear] = useState('2026')
  const [matricNumber, setMatricNumber] = useState('')
  const [candidateName, setCandidateName] = useState('')

  // Data & execution state
  const [institutions, setInstitutions] = useState<PublicInstitution[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResultData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Load public accredited institutions list
  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const res = await fetch('/api/v1/institutions/public')
        const data = await res.json()
        if (data.institutions && Array.isArray(data.institutions)) {
          setInstitutions(data.institutions)
          if (data.institutions.length > 0 && !selectedOrg) {
            setSelectedOrg(data.institutions[0].slug)
          }
        }
      } catch {
        // Fallback or offline
      }
    }
    fetchInstitutions()
  }, [])

  // Handle Direct Verification
  const handleDirectVerify = async (valToVerify?: string) => {
    const val = (valToVerify || directQuery).trim()
    if (!val) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const isHash = /^[a-fA-F0-9]{64}$/.test(val)
      const param = isHash ? `hash=${encodeURIComponent(val)}` : `id=${encodeURIComponent(val)}`
      const res = await fetch(`/api/v1/verify?${param}`)
      const data = await res.json()

      if (!res.ok && res.status !== 404) {
        throw new Error(data.error || data.message || 'Certificate verification request failed')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Certificate verification service temporarily unavailable')
    } finally {
      setLoading(false)
    }
  }

  // Handle Employer Accredited Search
  const handleEmployerSearch = async (override?: { orgSlug?: string; year?: string; matric?: string }) => {
    const org = (override?.orgSlug || selectedOrg).trim()
    const yr = (override?.year || graduationYear).trim()
    const matric = (override?.matric || matricNumber).trim()
    const name = candidateName.trim()

    if (!org) {
      setError('Please select an accredited university or institution.')
      return
    }

    if (!matric && !name) {
      setError('Please provide candidate matriculation number or name for verified lookup.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const params = new URLSearchParams()
      params.set('mode', 'employer')
      if (org) params.set('org', org)
      if (yr && yr !== 'all') params.set('year', yr)
      if (matric) params.set('matric', matric)
      if (name) params.set('name', name)

      const res = await fetch(`/api/v1/verify?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        if (data.policy_restricted) {
          setError(data.message || 'Institutional data policy restriction.')
          return
        }
        if (res.status !== 404) {
          throw new Error(data.error || data.message || 'Search request failed')
        }
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Certificate search service temporarily unavailable')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resultCert = result?.credential || (result?.certificates && result.certificates[0])
  const resultCertificates = result?.certificates && result.certificates.length > 0 ? result.certificates : resultCert ? [resultCert] : []

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* ── Mode Selection Switcher ── */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div
          className={`inline-flex p-1 rounded-xl border backdrop-blur-md ${
            isDark
              ? 'border-white/10 bg-white/[0.04]'
              : 'border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('direct')
              setError(null)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'direct'
                ? isDark
                  ? 'bg-white text-black shadow-xs'
                  : 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                : isDark
                ? 'text-neutral-400 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
            }`}
          >
            <Shield className="size-3.5" />
            Direct Certificate Verify
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('employer')
              setError(null)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'employer'
                ? isDark
                  ? 'bg-white text-black shadow-xs'
                  : 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                : isDark
                ? 'text-neutral-400 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
            }`}
          >
            <Building2 className="size-3.5" />
            Employer &amp; University Search
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                activeTab === 'employer'
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              Robust
            </span>
          </button>
        </div>

        <span className={`text-[10px] hidden sm:inline-flex items-center gap-1 ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>
          <Lock className="size-2.5 text-emerald-400" />
          Zero PII on-chain
        </span>
      </div>

      {/* ── TAB 1: Direct Certificate / Hash Verify ── */}
      {activeTab === 'direct' && (
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleDirectVerify()
            }}
            className={`relative flex items-center rounded-xl p-1.5 transition-all shadow-sm ${
              isDark
                ? 'border border-white/20 bg-white/[0.08] backdrop-blur-md focus-within:border-white/50 focus-within:ring-1 focus-within:ring-white/20'
                : 'border border-neutral-300 bg-white focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900/10'
            }`}
          >
            <div className={`pl-2.5 ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
              <Search className="size-4" />
            </div>
            <input
              type="text"
              value={directQuery}
              onChange={(e) => setDirectQuery(e.target.value)}
              placeholder="Enter Certificate ID (e.g. VAAS-UNILAG-2026-001) or SHA-256 hash..."
              className={`flex-1 bg-transparent px-2.5 py-1.5 text-xs focus:outline-none ${
                isDark ? 'text-white placeholder:text-white/40' : 'text-neutral-900 placeholder:text-neutral-400'
              }`}
            />
            <button
              type="submit"
              disabled={loading || !directQuery.trim()}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none ${
                isDark
                  ? 'bg-white text-black hover:bg-white/90 shadow-xs'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Certificate
                  <ArrowRight className="size-3" />
                </>
              )}
            </button>
          </form>

          {/* Quick sample chips */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 px-0.5 text-xs">
            <span className={`text-[10px] font-medium ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
              Try sample:
            </span>
            {SAMPLE_DIRECT.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setDirectQuery(s.id)
                  handleDirectVerify(s.id)
                }}
                className={`rounded-md border px-2 py-0.5 text-[10px] font-mono transition-colors ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-700 hover:border-neutral-400 hover:text-neutral-900'
                }`}
              >
                {s.label} ({s.id})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: Employer & Accredited Multi-Criteria Search ── */}
      {activeTab === 'employer' && (
        <div
          className={`rounded-xl border p-3.5 backdrop-blur-md transition-all ${
            isDark
              ? 'border-white/15 bg-white/[0.05]'
              : 'border-neutral-300 bg-white/90 dark:border-neutral-800 dark:bg-neutral-900/90'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Institution Dropdown (Span 5) */}
            <div className="sm:col-span-5 flex flex-col gap-1">
              <label className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                <Building2 className="size-3 text-emerald-400" />
                Accredited University
              </label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isDark
                    ? 'border-white/20 bg-[#16161a] text-white'
                    : 'border-neutral-300 bg-neutral-50 text-neutral-900'
                }`}
              >
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.slug}>
                    {inst.name} {inst.isVerified ? '✓ Accredited' : ''} ({inst.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Graduation Year (Span 3) */}
            <div className="sm:col-span-3 flex flex-col gap-1">
              <label className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                <Calendar className="size-3 text-blue-400" />
                Grad Year
              </label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isDark
                    ? 'border-white/20 bg-[#16161a] text-white'
                    : 'border-neutral-300 bg-neutral-50 text-neutral-900'
                }`}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="all">All Years</option>
              </select>
            </div>

            {/* Student ID / Matriculation Number (Span 4) */}
            <div className="sm:col-span-4 flex flex-col gap-1">
              <label className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                <UserCheck className="size-3 text-purple-400" />
                Matric / Student ID
              </label>
              <input
                type="text"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                placeholder="e.g. UNILAG/2022/CSC/089"
                className={`w-full rounded-lg border px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isDark
                    ? 'border-white/20 bg-[#16161a] text-white placeholder:text-white/40'
                    : 'border-neutral-300 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400'
                }`}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
              <Info className="size-3 text-emerald-400 shrink-0" />
              <span>Data Policy Protected: Only accredited universities allow robust verification.</span>
            </div>

            <button
              type="button"
              onClick={() => handleEmployerSearch()}
              disabled={loading}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                isDark
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 font-bold'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 font-semibold'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  Verifying on Ledger...
                </>
              ) : (
                <>
                  <Search className="size-3" />
                  Verify Certificate
                  <ArrowRight className="size-3" />
                </>
              )}
            </button>
          </div>

          {/* Sample quick chips for employer */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className={`text-[10px] font-medium ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
              Try verified graduate:
            </span>
            {SAMPLE_EMPLOYER.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedOrg(sample.orgSlug)
                  setGraduationYear(sample.year)
                  setMatricNumber(sample.matric)
                  handleEmployerSearch({
                    orgSlug: sample.orgSlug,
                    year: sample.year,
                    matric: sample.matric,
                  })
                }}
                className={`rounded-md border px-2 py-0.5 text-[10px] font-mono transition-colors ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-700 hover:border-neutral-400 hover:text-neutral-900'
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Error / Policy Notice State ── */}
      {error && (
        <div
          className={`mt-3 rounded-lg border p-3 text-xs animate-in fade-in duration-200 ${
            isDark
              ? 'border-red-500/30 bg-red-500/10 text-red-300'
              : 'border-red-500/20 bg-red-500/10 text-red-600'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold text-[11px]">
            <AlertCircle className="size-3.5" />
            Verification Notice
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed">{error}</p>
        </div>
      )}

      {/* ── Result Cards ── */}
      {result && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
          {resultCertificates.length > 0 && result.outcome === 'valid' ? (
            <div className="space-y-3">
              {resultCertificates.map((cert) => (
                <div
                  key={cert.credential_id}
                  className={`rounded-xl border p-4 shadow-xl relative overflow-hidden transition-all ${
                    isDark
                      ? 'border-emerald-500/40 bg-[#131317] text-white'
                      : 'border-emerald-500/30 bg-white text-neutral-900 shadow-md'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-bl-full pointer-events-none" />

                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                        <CheckCircle2 className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                            Cryptographically Verified Certificate
                          </span>
                          {cert.is_accredited && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-medium text-emerald-300">
                              ✓ Accredited University
                            </span>
                          )}
                          {result.blockchain_verified && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.2 text-[9px] font-medium ${
                                isDark
                                  ? 'bg-white/10 text-white/80'
                                  : 'bg-neutral-100 text-neutral-700 border'
                              }`}
                            >
                              <Lock className="size-2" /> Stellar Testnet
                            </span>
                          )}
                        </div>
                        <h3 className={`text-base font-bold tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                          {cert.recipient_name}
                        </h3>
                      </div>
                    </div>

                    <Link
                      href={`/v/${encodeURIComponent(cert.credential_id)}`}
                      className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors shrink-0 ${
                        isDark ? 'text-white/80 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      View Certificate <ArrowRight className="size-3" />
                    </Link>
                  </div>

                  {/* Metadata Grid */}
                  <div
                    className={`mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t pt-3 text-[11px] ${
                      isDark ? 'border-white/10' : 'border-neutral-200'
                    }`}
                  >
                    <div>
                      <span className={`block text-[10px] ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                        Degree / Programme
                      </span>
                      <span className={`font-semibold mt-0.5 block truncate ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {cert.programme}
                      </span>
                      {cert.classification && (
                        <span className="text-[10px] text-emerald-400 font-medium block truncate">
                          {cert.classification}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className={`block text-[10px] ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                        Institution
                      </span>
                      <span className={`font-semibold mt-0.5 block truncate ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {cert.institution}
                      </span>
                      {cert.country && (
                        <span className={`text-[10px] block truncate ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                          {cert.country}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className={`block text-[10px] ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                        Matric / Student ID
                      </span>
                      <span className={`font-mono font-medium mt-0.5 block truncate ${isDark ? 'text-white/90' : 'text-neutral-800'}`}>
                        {cert.student_reference || 'N/A'}
                      </span>
                      <span className={`text-[9px] font-mono block truncate ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
                        ID: {cert.credential_id}
                      </span>
                    </div>

                    <div>
                      <span className={`block text-[10px] ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                        Graduation / Award
                      </span>
                      <span className={`mt-0.5 block ${isDark ? 'text-white font-medium' : 'text-neutral-900 font-medium'}`}>
                        {cert.graduation_date
                          ? new Date(cert.graduation_date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                            })
                          : new Date(cert.issue_date).getFullYear()}
                      </span>
                      {cert.certificate_number && (
                        <span className={`text-[9px] font-mono block truncate ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
                          Cert: {cert.certificate_number}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Blockchain Anchor Proof */}
                  {result.anchor && (
                    <div
                      className={`mt-3 rounded-lg border p-2 text-[10px] ${
                        isDark ? 'border-white/10 bg-white/5 text-white/90' : 'border-neutral-200 bg-neutral-50 text-neutral-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 font-medium text-[10px]">
                          <Shield className="size-3 text-emerald-400" />
                          Stellar Distributed Consensus Proof
                          {result.anchor.ledger && (
                            <span className="font-mono text-[9px] opacity-70">
                              (Ledger #{result.anchor.ledger})
                            </span>
                          )}
                        </div>
                        {result.anchor.explorer_url && (
                          <a
                            href={result.anchor.explorer_url}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex items-center gap-1 text-[10px] font-medium transition-colors ${
                              isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800'
                            }`}
                          >
                            Horizon Explorer <ExternalLink className="size-2.5" />
                          </a>
                        )}
                      </div>

                      <div
                        className={`mt-1 font-mono text-[10px] truncate flex items-center justify-between ${
                          isDark ? 'text-white/50' : 'text-neutral-500'
                        }`}
                      >
                        <span className="truncate pr-2">Tx: {result.anchor.transaction_id}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(result.anchor?.transaction_id || '')}
                          className={`p-0.5 shrink-0 ${isDark ? 'hover:text-white text-white/60' : 'hover:text-neutral-900 text-neutral-400'}`}
                          title="Copy Transaction Hash"
                        >
                          {copied ? <Check className="size-2.5 text-emerald-400" /> : <Copy className="size-2.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : result.outcome === 'revoked' ? (
            <div
              className={`rounded-xl border p-4 shadow-lg ${
                isDark ? 'border-red-500/40 bg-[#141419] text-white' : 'border-red-500/30 bg-white text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-red-500/20 text-red-400 shrink-0">
                  <XCircle className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                    Officially Revoked Certificate
                  </span>
                  <h3 className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                    {resultCert?.recipient_name || 'Academic Certificate'}
                  </h3>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                    This certificate was officially marked as revoked by {resultCert?.institution || 'the issuing institution'} on the blockchain ledger.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`rounded-xl border p-4 shadow-lg ${
                isDark ? 'border-white/15 bg-[#141419] text-white' : 'border-neutral-200 bg-white text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`grid size-8 place-items-center rounded-lg ${isDark ? 'bg-white/10 text-white/70' : 'bg-neutral-100 text-neutral-500'} shrink-0`}>
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                    No Certificate Match Found
                  </span>
                  <h3 className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                    Unverified on Vaasone Network
                  </h3>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                    {result.message || 'No certificate matching the specified details could be cryptographically located.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
