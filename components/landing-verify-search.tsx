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
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      {/* Compact Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleVerify()
        }}
        className={`relative flex items-center rounded-xl p-1.5 transition-all shadow-sm ${
          isDark
            ? 'border border-white/20 bg-white/[0.08] backdrop-blur-md focus-within:border-white/50 focus-within:ring-1 focus-within:ring-white/20'
            : 'border border-v-border bg-v-surface focus-within:border-v-text focus-within:ring-1 focus-within:ring-v-text/10'
        }`}
      >
        <div className={`pl-2.5 ${isDark ? 'text-white/40' : 'text-v-muted-text'}`}>
          <Search className="size-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Credential ID (e.g. VAAS-UNILAG-2026-001) or SHA-256 hash..."
          className={`flex-1 bg-transparent px-2.5 py-1.5 text-xs focus:outline-none ${
            isDark ? 'text-white placeholder:text-white/40' : 'text-v-text placeholder:text-v-faint'
          }`}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none ${
            isDark
              ? 'bg-white text-black hover:bg-white/90 shadow-xs'
              : 'bg-v-accent text-v-accent-fg hover:bg-v-accent-hover'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify Now
              <ArrowRight className="size-3" />
            </>
          )}
        </button>
      </form>

      {/* Sample Quick Chips */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 px-0.5 text-xs">
        <span className={`text-[10px] font-medium ${isDark ? 'text-white/50' : 'text-v-faint'}`}>
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
            className={`rounded-md border px-2 py-0.5 text-[10px] font-mono transition-colors ${
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
        <div className={`mt-3 rounded-lg border p-3 text-xs ${
          isDark ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-red-500/20 bg-red-500/10 text-red-600'
        }`}>
          <div className="flex items-center gap-1.5 font-semibold text-[11px]">
            <AlertCircle className="size-3.5" />
            Verification Error
          </div>
          <p className="mt-0.5 text-[11px]">{error}</p>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
          {result.outcome === 'valid' && result.credential ? (
            <div
              className={`rounded-xl border p-4 shadow-xl relative overflow-hidden ${
                isDark
                  ? 'border-emerald-500/40 bg-[#141419] text-white'
                  : 'border-emerald-500/30 bg-v-surface text-v-text'
              }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                        Cryptographically Verified
                      </span>
                      {result.blockchain_verified && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.2 text-[9px] font-medium ${
                            isDark
                              ? 'bg-white/10 text-white/80'
                              : 'bg-v-raised text-v-secondary'
                          }`}
                        >
                          <Lock className="size-2" /> Stellar Testnet
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm font-bold tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-v-text'}`}>
                      {result.credential.recipient_name}
                    </h3>
                  </div>
                </div>

                <Link
                  href={`/v/${encodeURIComponent(result.credential.credential_id)}`}
                  className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors shrink-0 ${
                    isDark ? 'text-white/80 hover:text-white' : 'text-v-secondary hover:text-v-text'
                  }`}
                >
                  Certificate <ArrowRight className="size-3" />
                </Link>
              </div>

              <div
                className={`mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t pt-3 text-[11px] ${
                  isDark ? 'border-white/10' : 'border-v-border'
                }`}
              >
                <div>
                  <span className={`block text-[10px] ${isDark ? 'text-white/50' : 'text-v-muted-text'}`}>
                    Degree / Programme
                  </span>
                  <span className={`font-semibold mt-0.5 block truncate ${isDark ? 'text-white' : 'text-v-text'}`}>
                    {result.credential.programme}
                  </span>
                </div>

                <div>
                  <span className={`block text-[10px] ${isDark ? 'text-white/50' : 'text-v-muted-text'}`}>
                    Institution
                  </span>
                  <span className={`font-semibold mt-0.5 block truncate ${isDark ? 'text-white' : 'text-v-text'}`}>
                    {result.credential.organization?.name || 'Verified Institution'}
                  </span>
                </div>

                <div>
                  <span className={`block text-[10px] ${isDark ? 'text-white/50' : 'text-v-muted-text'}`}>
                    ID
                  </span>
                  <span className={`font-mono mt-0.5 block truncate ${isDark ? 'text-white/90' : 'text-v-text'}`}>
                    {result.credential.credential_id}
                  </span>
                </div>

                <div>
                  <span className={`block text-[10px] ${isDark ? 'text-white/50' : 'text-v-muted-text'}`}>
                    Issue Date
                  </span>
                  <span className={`mt-0.5 block ${isDark ? 'text-white' : 'text-v-text'}`}>
                    {new Date(result.credential.issue_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Blockchain Anchor Details */}
              {result.anchor && (
                <div
                  className={`mt-2.5 rounded-lg border p-2 text-[10px] ${
                    isDark ? 'border-white/10 bg-white/5 text-white/90' : 'border-v-border bg-v-inset text-v-text'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 font-medium text-[10px]">
                      <Shield className="size-3 text-emerald-400" />
                      Stellar Ledger Proof
                    </div>
                    {result.anchor.explorer_url && (
                      <a
                        href={result.anchor.explorer_url}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1 text-[10px] font-medium transition-colors ${
                          isDark ? 'text-white/70 hover:text-white' : 'text-v-secondary hover:text-v-text'
                        }`}
                      >
                        Horizon <ExternalLink className="size-2.5" />
                      </a>
                    )}
                  </div>
                  <div
                    className={`mt-1 font-mono text-[10px] truncate flex items-center justify-between ${
                      isDark ? 'text-white/50' : 'text-v-muted-text'
                    }`}
                  >
                    <span className="truncate pr-2">Tx: {result.anchor.transaction_id}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.anchor?.transaction_id || '')}
                      className={`p-0.5 shrink-0 ${isDark ? 'hover:text-white text-white/60' : 'hover:text-v-text text-v-muted-text'}`}
                      title="Copy Tx Hash"
                    >
                      {copied ? <Check className="size-2.5 text-emerald-400" /> : <Copy className="size-2.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : result.outcome === 'revoked' ? (
            <div
              className={`rounded-xl border p-4 shadow-lg ${
                isDark ? 'border-red-500/40 bg-[#141419] text-white' : 'border-red-500/30 bg-v-surface text-v-text'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-red-500/20 text-red-400 shrink-0">
                  <XCircle className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                    Revoked Credential
                  </span>
                  <h3 className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-v-text'}`}>
                    {result.credential?.recipient_name || 'Academic Credential'}
                  </h3>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/60' : 'text-v-muted-text'}`}>
                    This credential was officially revoked by the issuing institution.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`rounded-xl border p-4 shadow-lg ${
                isDark ? 'border-white/15 bg-[#141419] text-white' : 'border-v-border bg-v-surface text-v-text'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`grid size-8 place-items-center rounded-lg ${isDark ? 'bg-white/10 text-white/70' : 'bg-v-raised text-v-secondary'} shrink-0`}>
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-v-muted-text'}`}>
                    No Match Found
                  </span>
                  <h3 className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-v-text'}`}>
                    Unrecognized Credential Identifier
                  </h3>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/60' : 'text-v-muted-text'}`}>
                    No credential matches &quot;{query}&quot; on the ledger. Check the ID formatting.
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
