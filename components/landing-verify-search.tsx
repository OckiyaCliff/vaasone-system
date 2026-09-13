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

export function LandingVerifySearch() {
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
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleVerify()
        }}
        className="relative flex items-center rounded-2xl border border-v-border bg-v-surface p-2 shadow-lg transition-all focus-within:border-v-text focus-within:ring-2 focus-within:ring-v-text/10"
      >
        <div className="pl-3 text-v-muted-text">
          <Search className="size-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Credential ID (e.g. VAAS-UNILAG-2026-001) or SHA-256 hash..."
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-v-text placeholder:text-v-faint focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-v-accent px-5 py-3 text-xs font-semibold text-v-accent-fg transition-all hover:bg-v-accent-hover disabled:opacity-50 disabled:pointer-events-none"
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
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1 text-xs text-v-muted-text">
        <span className="text-[11px] font-medium text-v-faint">Try sample:</span>
        {SAMPLE_CREDENTIALS.map((sampleId) => (
          <button
            key={sampleId}
            type="button"
            onClick={() => {
              setQuery(sampleId)
              handleVerify(sampleId)
            }}
            className="rounded-lg border border-v-border bg-v-raised px-2.5 py-1 text-[11px] font-mono text-v-secondary hover:border-v-text/40 hover:text-v-text transition-colors"
          >
            {sampleId}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="size-4" />
            Verification Error
          </div>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {result.outcome === 'valid' && result.credential ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-v-surface p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Cryptographically Verified
                      </span>
                      {result.blockchain_verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-v-raised px-2 py-0.5 text-[10px] font-medium text-v-secondary">
                          <Lock className="size-2.5" /> Stellar Testnet
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-v-text tracking-tight mt-0.5">
                      {result.credential.recipient_name}
                    </h3>
                  </div>
                </div>

                <Link
                  href={`/v/${encodeURIComponent(result.credential.credential_id)}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-v-secondary hover:text-v-text transition-colors"
                >
                  Full Certificate <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-v-border pt-4 text-xs">
                <div>
                  <span className="text-v-muted-text block text-[11px]">Degree / Programme</span>
                  <span className="font-semibold text-v-text mt-0.5 block">{result.credential.programme}</span>
                  {result.credential.classification && (
                    <span className="text-v-secondary text-[11px] block">{result.credential.classification}</span>
                  )}
                </div>

                <div>
                  <span className="text-v-muted-text block text-[11px]">Issuing Institution</span>
                  <span className="font-semibold text-v-text mt-0.5 block">
                    {result.credential.organization?.name || 'Verified Institution'}
                  </span>
                  {result.credential.organization?.country && (
                    <span className="text-v-secondary text-[11px] block">{result.credential.organization.country}</span>
                  )}
                </div>

                <div>
                  <span className="text-v-muted-text block text-[11px]">Credential ID</span>
                  <span className="font-mono text-v-text mt-0.5 block">{result.credential.credential_id}</span>
                </div>

                <div>
                  <span className="text-v-muted-text block text-[11px]">Issue Date</span>
                  <span className="text-v-text mt-0.5 block">
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
                <div className="mt-4 rounded-xl border border-v-border bg-v-inset p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-v-text text-[11px]">
                      <Shield className="size-3.5 text-emerald-600" />
                      Blockchain Ledger Proof
                    </div>
                    {result.anchor.explorer_url && (
                      <a
                        href={result.anchor.explorer_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-v-secondary hover:text-v-text transition-colors"
                      >
                        View on Horizon Explorer <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <div className="mt-2 font-mono text-[11px] text-v-muted-text truncate flex items-center justify-between">
                    <span className="truncate pr-2">Tx: {result.anchor.transaction_id}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.anchor?.transaction_id || '')}
                      className="p-1 hover:text-v-text text-v-muted-text shrink-0"
                      title="Copy Tx Hash"
                    >
                      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : result.outcome === 'revoked' ? (
            <div className="rounded-2xl border border-red-500/30 bg-v-surface p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-red-500/15 text-red-600 dark:text-red-400">
                  <XCircle className="size-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                    Revoked Credential
                  </span>
                  <h3 className="text-base font-bold text-v-text mt-0.5">
                    {result.credential?.recipient_name || 'Academic Credential'}
                  </h3>
                  <p className="text-xs text-v-muted-text mt-1">
                    This credential was officially revoked by the issuing institution.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-v-border bg-v-surface p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-v-raised text-v-secondary">
                  <AlertCircle className="size-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-v-muted-text">
                    No Match Found
                  </span>
                  <h3 className="text-base font-bold text-v-text mt-0.5">
                    Unrecognized Credential Identifier
                  </h3>
                  <p className="text-xs text-v-muted-text mt-1">
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
