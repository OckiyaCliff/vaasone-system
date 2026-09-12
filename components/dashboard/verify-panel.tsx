'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertOctagon,
  ArrowUpRight,
  Check,
  CheckCircle2,
  CircleHelp,
  Copy,
  ExternalLink,
  Fingerprint,
  History,
  Layers,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'

type VerifyState = 'idle' | 'loading' | 'valid' | 'revoked' | 'altered' | 'superseded' | 'unknown'

export function VerifyPanel() {
  const [credentialId, setCredentialId] = useState('')
  const [state, setState] = useState<VerifyState>('idle')
  const [result, setResult] = useState<any>(null)
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedTx, setCopiedTx] = useState(false)

  async function verify() {
    const normalizedId = credentialId.trim()
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
      title: 'Credential Authentic & Active',
      desc: 'Cryptographic SHA-256 hash verified and anchored to public blockchain ledger.',
    },
    revoked: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      border: 'border-rose-500/30',
      color: 'text-rose-700 dark:text-rose-400',
      icon: AlertOctagon,
      title: 'Credential Revoked by Issuer',
      desc: 'This academic award was permanently revoked by the issuing institution.',
    },
    altered: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      border: 'border-rose-500/30',
      color: 'text-rose-700 dark:text-rose-400',
      icon: ShieldAlert,
      title: 'Integrity Violation (Altered)',
      desc: 'The cryptographic hash does not match. This credential record has been modified or tampered with.',
    },
    superseded: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      border: 'border-amber-500/30',
      color: 'text-amber-700 dark:text-amber-400',
      icon: History,
      title: 'Credential Superseded',
      desc: 'A newer updated version of this academic credential has been re-issued.',
    },
    unknown: {
      bg: 'bg-neutral-500/10 dark:bg-neutral-500/15',
      border: 'border-neutral-500/30',
      color: 'text-neutral-700 dark:text-neutral-400',
      icon: CircleHelp,
      title: 'Unrecognized Credential Identifier',
      desc: 'No record matching this identifier was found in the network registry.',
    },
  }

  const activeConfig = statusConfig[state]
  const StatusIcon = activeConfig.icon

  const documentHash =
    result?.credential?.document_hash || result?.anchor?.anchor_hash || null

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      {/* Verify form & results */}
      <section className="flex flex-col gap-5 rounded-[28px] border border-v-border bg-v-surface p-6 shadow-[var(--v-shadow)] sm:p-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-v-accent">
            Trust Engine
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.05em] text-v-text sm:text-3xl">
            Cryptographic Credential Verification
          </h2>
          <p className="mt-2 text-xs leading-5 text-v-secondary">
            Query the distributed ledger to verify proof of issuance, recipient identity, and immutable SHA-256 tamper-evident anchoring.
          </p>
        </div>

        {/* Input box */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <input
              value={credentialId}
              onChange={(e) => {
                setCredentialId(e.target.value)
                if (state !== 'idle') setState('idle')
              }}
              onKeyDown={(e) => e.key === 'Enter' && verify()}
              placeholder="e.g. VAAS-2026-001 or UNILAG/2026/042"
              className="w-full rounded-xl border border-v-border bg-v-inset px-4 py-3 font-mono text-xs text-v-text outline-none transition placeholder:font-sans placeholder:text-v-faint focus:border-v-accent"
            />
          </div>
          <button
            onClick={verify}
            disabled={state === 'loading'}
            className="flex items-center justify-center gap-2 rounded-xl bg-v-accent px-5 py-3 text-xs font-semibold text-v-accent-fg transition hover:opacity-95 disabled:opacity-50"
          >
            {state === 'loading' ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" />
                <span>Verify Credential</span>
              </>
            )}
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
                  {result?.credential?.status && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        result.credential.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                          : result.credential.status === 'revoked'
                            ? 'bg-rose-500/20 text-rose-800 dark:text-rose-300'
                            : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      Status: {result.credential.status}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-v-secondary">{activeConfig.desc}</p>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain SHA-256 Hash & Proof */}
        {result && documentHash && (
          <div className="rounded-2xl border border-v-border bg-v-raised p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-v-accent">
                <Fingerprint className="size-3.5" />
                Blockchain SHA-256 Fingerprint
              </span>
              <span className="rounded-md bg-v-surface px-2 py-0.5 text-[10px] font-mono text-v-tertiary">
                SHA-256
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-v-border bg-v-inset p-3 font-mono text-xs">
              <span className="truncate text-v-text select-all">{documentHash}</span>
              <button
                onClick={() => copyToClipboard(documentHash, true)}
                title="Copy hash"
                className="shrink-0 rounded-lg p-1.5 text-v-faint hover:bg-v-hover hover:text-v-text transition"
              >
                {copiedHash ? (
                  <Check className="size-3.5 text-v-success" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
            <p className="mt-2 text-[10px] text-v-faint">
              This hash represents the canonical mathematical digest of recipient details, graduation title, and issuer signatures.
            </p>
          </div>
        )}

        {/* Credential Data Card */}
        {result?.credential && (
          <div className="rounded-2xl border border-v-border bg-v-raised p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-v-border pb-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                Academic Credential Record
              </span>
              <Link
                href={`/v/${encodeURIComponent(result.credential.credential_id)}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-semibold text-v-accent hover:underline"
              >
                <span>Public Certificate</span>
                <ArrowUpRight className="size-3" />
              </Link>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-[10px] uppercase text-v-faint">Recipient</span>
                <p className="font-semibold text-v-text">{result.credential.recipient_name}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-v-faint">Programme</span>
                <p className="font-medium text-v-text">{result.credential.programme}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-v-faint">Issuing Institution</span>
                <p className="text-v-text">
                  {result.credential.institution}
                  {result.credential.country ? ` (${result.credential.country})` : ''}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-v-faint">Issue Date</span>
                <p className="text-v-secondary">{result.credential.issue_date}</p>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Anchor Details */}
        {result?.anchor && (
          <div className="rounded-2xl border border-v-border bg-v-raised p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-v-border pb-3">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
                <Layers className="size-3.5 text-v-accent" />
                Ledger Settlement Status
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {result.anchor.status || 'Confirmed'}
              </span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-[10px] uppercase text-v-faint">Blockchain Network</span>
                <p className="font-medium text-v-text">{result.anchor.network}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-v-faint">Ledger Block / Sequence</span>
                <p className="font-mono text-v-secondary">{result.anchor.ledger || 'Settled'}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase text-v-faint">Transaction Hash / ID</span>
                <div className="mt-1 flex items-center justify-between gap-2 rounded-xl border border-v-border bg-v-inset px-3 py-2 font-mono text-[11px]">
                  <span className="truncate text-v-text">{result.anchor.transaction_id || '—'}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {result.anchor.transaction_id && (
                      <button
                        onClick={() => copyToClipboard(result.anchor.transaction_id, false)}
                        title="Copy Tx ID"
                        className="rounded p-1 text-v-faint hover:text-v-text transition"
                      >
                        {copiedTx ? (
                          <Check className="size-3 text-v-success" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    )}
                    {result.anchor.explorer_url && (
                      <a
                        href={result.anchor.explorer_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded bg-v-surface px-2 py-0.5 text-[10px] font-semibold text-v-accent hover:underline"
                      >
                        <span>Explorer</span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Explanatory Panel: How verification works */}
      <section className="flex flex-col justify-between rounded-[28px] border border-v-border bg-v-surface p-6 shadow-[var(--v-shadow)] sm:p-8">
        <div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-v-accent text-v-accent-fg">
            <Shield className="size-6" />
          </div>
          <h3 className="mt-6 text-xl font-bold tracking-[-0.04em] text-v-text">
            How Blockchain Verification Works
          </h3>
          <p className="mt-2.5 text-xs leading-6 text-v-secondary">
            Vaasone combines SHA-256 cryptographic hashing with immutable public blockchain anchoring (Stellar &amp; BNB) to ensure academic credentials cannot be forged or secretly altered.
          </p>

          <div className="mt-6 flex flex-col gap-3.5">
            <div className="flex items-start gap-3 rounded-2xl border border-v-border bg-v-raised p-3.5">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-v-accent text-[10px] font-bold text-v-accent-fg mt-0.5">
                1
              </span>
              <div>
                <p className="text-xs font-semibold text-v-text">Cryptographic Hashing</p>
                <p className="mt-0.5 text-[11px] leading-4 text-v-secondary">
                  The recipient name, award classification, and institution metadata are hashed into a 64-character hex digest. Any single character change alters the hash completely.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-v-border bg-v-raised p-3.5">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-v-accent text-[10px] font-bold text-v-accent-fg mt-0.5">
                2
              </span>
              <div>
                <p className="text-xs font-semibold text-v-text">Immutable Ledger Anchoring</p>
                <p className="mt-0.5 text-[11px] leading-4 text-v-secondary">
                  The hash is submitted to the Stellar or BNB ledger as a cryptographic transaction signed by the accredited institution&apos;s verified keypair.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-v-border bg-v-raised p-3.5">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-v-accent text-[10px] font-bold text-v-accent-fg mt-0.5">
                3
              </span>
              <div>
                <p className="text-xs font-semibold text-v-text">Independent Verification</p>
                <p className="mt-0.5 text-[11px] leading-4 text-v-secondary">
                  Anyone can query the blockchain to verify timestamp, issuer key, and active/revoked lifecycle status without needing a platform login or contacting university registrars.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-v-border pt-4">
          <p className="text-[11px] text-v-tertiary">
            Powered by <strong>Stellar Soroban</strong> &amp; <strong>BNB Smart Chain</strong> trust infrastructure.
          </p>
        </div>
      </section>
    </div>
  )
}
