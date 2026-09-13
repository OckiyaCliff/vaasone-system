'use client'

import { useState } from 'react'
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
} from 'lucide-react'

type VerificationResultData = {
  outcome: 'valid' | 'revoked' | 'altered' | 'superseded' | 'unknown'
  credential?: {
    credential_id: string
    recipient_name: string
    programme: string
    credential_type: string
    issue_date: string
    status: string
    document_hash?: string
    certificate_number?: string
    classification?: string
    graduation_date?: string
    organization?: {
      name: string
      country?: string
    }
  }
  anchor?: {
    network: string
    provider: string
    status: string
    transaction_id: string
    ledger?: number
    explorer_url?: string | null
    anchor_hash?: string
    confirmed_at?: string
  }
  blockchain_verified?: boolean
  verified_at?: string
}

const SAMPLE_CREDENTIALS = [
  'VAAS-UNILAG-2026-001',
  'VAAS-COVENANT-2026-001',
  'VAAS-YALE-2026-001',
]

export function LandingVerifySearch({
  variant = 'default',
  className = '',
}: {
  variant?: 'default' | 'dark'
  className?: string
}) {
  const isDark = variant === 'dark'
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResultData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleVerify = async (idToSearch?: string) => {
    const val = (idToSearch || query).trim()
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
        throw new Error(data.error || 'Verification request failed')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Verification service temporarily unavailable')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleVerify()
        }}
        className={`relative flex items-center rounded-2xl p-2 transition-all shadow-md ${
          isDark
            ? 'border border-white/20 bg-white/[0.08] backdrop-blur-md focus-within:border-white/50 focus-within:ring-2 focus-within:ring-white/15'
            : 'border border-v-border bg-v-surface focus-within:border-v-text focus-within:ring-2 focus-within:ring-v-text/10'
        }`}
      >
        <div className={`pl-3 ${isDark ? 'text-white/40' : 'text-v-muted-text'}`}>
          <Search className="size-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Credential ID (e.g. VAAS-UNILAG-2026-001) or SHA-256 hash..."
          className={`flex-1 bg-transparent px-3 py-2.5 text-sm focus:outline-none ${
            isDark ? 'text-white placeholder:text-white/40' : 'text-v-text placeholder:text-v-faint'
          }`}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none ${
            isDark
              ? 'bg-white text-black hover:bg-white/90 shadow-md'
              : 'bg-v-accent text-v-accent-fg hover:bg-v-accent-hover'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify Now
              <ArrowRight className="size-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Sample Quick Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1 text-xs">
        <span className={`text-[11px] font-medium ${isDark ? 'text-white/50' : 'text-v-faint'}`}>
          Try sample:
        </span>
        {SAMPLE_CREDENTIALS.map((sampleId) => (
          <button
            key={sampleId}
            type="button"
            onClick={() => {
              setQuery(sampleId)
              handleVerify(sampleId)
            }}
            className={`rounded-lg border px-2.5 py-1 text-[11px] font-mono transition-colors ${
              isDark
                ? 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white'
                : 'border-v-border bg-v-raised text-v-secondary hover:border-v-text/40 hover:text-v-text'
            }`}
          >
            {sampleId}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className={`mt-4 rounded-xl border p-4 text-xs ${
          isDark ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-red-500/20 bg-red-500/10 text-red-600'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="size-4" />
            Verification Error
          </div>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
          {result.outcome === 'valid' && result.credential ? (
            <div
              className={`rounded-2xl border p-6 shadow-2xl relative overflow-hidden ${
                isDark
                  ? 'border-emerald-500/40 bg-[#141419] text-white'
                  : 'border-emerald-500/30 bg-v-surface text-v-text'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full pointer-events-none" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        Cryptographically Verified
                      </span>
                      {result.blockchain_verified && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            isDark
                              ? 'bg-white/10 text-white/80'
                              : 'bg-v-raised text-v-secondary'
                          }`}
                        >
                          <Lock className="size-2.5" /> Stellar Testnet
                        </span>
                      )}
                    </div>
                    <h3 className={`text-lg font-bold tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-v-text'}`}>
                      {result.credential.recipient_name}
                    </h3>
                  </div>
                </div>

                <Link
                  href={`/v/${encodeURIComponent(result.credential.credential_id)}`}
                  className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                    isDark ? 'text-white/80 hover:text-white' : 'text-v-secondary hover:text-v-text'
                  }`}
                >
                  Full Certificate <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div
                className={`mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 text-xs ${
                  isDark ? 'border-white/10' : 'border-v-border'
                }`}
              >
                <div>
                  <span className={`block text-[11px] ${isDark ? 'text-white/50' : 'text-v-muted-text'}`}>
                    Degree / Programme
                  </span>
                  <span className={`font-semibold mt-0.5 block ${isDark ? 'text-white' : 'text-v-text'}`}>
                    {result.credential.programme}
                  </span>
                  {result.credential.classification && (
                    <span className={`text-[11px] block ${isDark ? 'text-white/60' : 'text-v-secondary'}`}>
                      {result.credential.classification}
                    </span>
                  )}
                </div>

                <div>
                  <span className={`block text-[11px] ${isDark ? 'text-white/50' : 'text-v-muted-text'}`}>
                    Issuing Institution
                  </span>
                  <span className={`font-semibold mt-0.5 block ${isDark ? 'text-white' : 'text-v-text'}`}>
                    {result.credential.organization?.name || 'Verified Institution'}
                  </span>
                  {result.credential.organization?.country && (
                    <span className={`text-[11px] block ${isDark ? 'text-white/60' : 'text-v-secondary'}`}>
                      {result.credential.organization.country}
                    </span>
                  )}
                </div>

                <div>
                  <span className={`block text-[11px] ${isDark ? 'text-white/50' : 'text-v-muted-text'}`}>
                    Credential ID
                  </span>
                  <span className={`font-mono mt-0.5 block ${isDark ? 'text-white/90' : 'text-v-text'}`}>
                    {result.credential.credential_id}
                  </span>
                </div>

                <div>
                  <span className={`block text-[11px] ${isDark ? 'text-white/50' : 'text-v-muted-text'}`}>
                    Issue Date
                  </span>
                  <span className={`mt-0.5 block ${isDark ? 'text-white' : 'text-v-text'}`}>
                    {new Date(result.credential.issue_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Blockchain Anchor Details */}
              {result.anchor && (
                <div
                  className={`mt-4 rounded-xl border p-3 text-xs ${
                    isDark ? 'border-white/10 bg-white/5 text-white/90' : 'border-v-border bg-v-inset text-v-text'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-[11px]">
                      <Shield className="size-3.5 text-emerald-400" />
                      Blockchain Ledger Proof
                    </div>
                    {result.anchor.explorer_url && (
                      <a
                        href={result.anchor.explorer_url}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${
                          isDark ? 'text-white/70 hover:text-white' : 'text-v-secondary hover:text-v-text'
                        }`}
                      >
                        View on Horizon Explorer <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <div
                    className={`mt-2 font-mono text-[11px] truncate flex items-center justify-between ${
                      isDark ? 'text-white/50' : 'text-v-muted-text'
                    }`}
                  >
                    <span className="truncate pr-2">Tx: {result.anchor.transaction_id}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.anchor?.transaction_id || '')}
                      className={`p-1 shrink-0 ${isDark ? 'hover:text-white text-white/60' : 'hover:text-v-text text-v-muted-text'}`}
                      title="Copy Tx Hash"
                    >
                      {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : result.outcome === 'revoked' ? (
            <div
              className={`rounded-2xl border p-6 shadow-xl ${
                isDark ? 'border-red-500/40 bg-[#141419] text-white' : 'border-red-500/30 bg-v-surface text-v-text'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-red-500/20 text-red-400">
                  <XCircle className="size-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
                    Revoked Credential
                  </span>
                  <h3 className={`text-base font-bold mt-0.5 ${isDark ? 'text-white' : 'text-v-text'}`}>
                    {result.credential?.recipient_name || 'Academic Credential'}
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-v-muted-text'}`}>
                    This credential was officially revoked by the issuing institution.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`rounded-2xl border p-6 shadow-xl ${
                isDark ? 'border-white/15 bg-[#141419] text-white' : 'border-v-border bg-v-surface text-v-text'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`grid size-10 place-items-center rounded-xl ${isDark ? 'bg-white/10 text-white/70' : 'bg-v-raised text-v-secondary'}`}>
                  <AlertCircle className="size-6" />
                </div>
                <div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-v-muted-text'}`}>
                    No Match Found
                  </span>
                  <h3 className={`text-base font-bold mt-0.5 ${isDark ? 'text-white' : 'text-v-text'}`}>
                    Unrecognized Credential Identifier
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-v-muted-text'}`}>
                    No issued credential matches &quot;{query}&quot; on the Vaasone trust ledger. Check that the ID is formatted correctly.
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
