'use client'

import { useState } from 'react'
import { Check, CircleHelp, Fingerprint, Loader2 } from 'lucide-react'

type VerifyState = 'idle' | 'loading' | 'valid' | 'revoked' | 'altered' | 'unknown'

export function VerifyPanel() {
  const [credentialId, setCredentialId] = useState('')
  const [state, setState] = useState<VerifyState>('idle')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  async function verify() {
    const normalizedId = credentialId.trim()
    if (!normalizedId) { setState('unknown'); return }

    setState('loading')
    try {
      const res = await fetch(`/api/v1/verify?id=${encodeURIComponent(normalizedId)}`)
      const body = await res.json().catch(() => ({}))
      if (res.ok && body.outcome === 'valid') {
        setState('valid')
        setResult(body)
      } else if (body.outcome === 'revoked') {
        setState('revoked')
        setResult(body)
      } else if (body.outcome === 'altered') {
        setState('altered')
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

  const statusConfig: Record<string, { bg: string; icon: typeof Check; text: string }> = {
    valid:   { bg: 'bg-v-success-bg text-v-success-strong', icon: Check, text: 'Credential verified on Stellar testnet.' },
    revoked: { bg: 'bg-v-error-bg text-v-error', icon: CircleHelp, text: 'This credential has been revoked by the issuing institution.' },
    altered: { bg: 'bg-v-error-bg text-v-error', icon: CircleHelp, text: 'Credential integrity check failed. Document may have been altered.' },
    unknown: { bg: 'bg-v-raised text-v-secondary', icon: CircleHelp, text: 'No active verified credential found for this ID.' },
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
      {/* Verify form */}
      <section className="rounded-[24px] bg-v-hero p-7 text-v-hero-text sm:p-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-v-hero-faint">
          Public verification
        </p>
        <h2 className="mt-4 max-w-[430px] text-4xl font-medium leading-[0.94] tracking-[-0.07em]">
          Check a credential
          <br />
          <span className="text-v-hero-ghost">in seconds.</span>
        </h2>
        <p className="mt-6 max-w-[350px] text-sm leading-6 text-v-hero-muted">
          Enter a credential ID to confirm its issuer, recipient, and immutable trust record.
        </p>

        <div className="mt-10 flex max-w-[470px] gap-2 rounded-2xl bg-v-white p-2">
          <input
            value={credentialId}
            onChange={(e) => { setCredentialId(e.target.value); setState('idle') }}
            onKeyDown={(e) => e.key === 'Enter' && verify()}
            placeholder="e.g. VO-2024-00482"
            className="min-w-0 flex-1 bg-transparent px-3 text-sm text-v-text outline-none placeholder:text-v-ghost"
          />
          <button
            onClick={verify}
            disabled={state === 'loading'}
            className="rounded-xl bg-v-accent px-4 py-3 text-xs font-semibold text-v-accent-fg disabled:opacity-50"
          >
            {state === 'loading' ? <Loader2 className="size-4 animate-spin" /> : 'Verify'}
          </button>
        </div>

        {state !== 'idle' && state !== 'loading' && (() => {
          const cfg = statusConfig[state]
          const Icon = cfg.icon
          return (
            <div className={`mt-5 flex items-center gap-3 rounded-xl px-4 py-3 text-xs ${cfg.bg}`}>
              <Icon className="size-4 shrink-0" />
              <span>{cfg.text}</span>
            </div>
          )
        })()}

        {result && result.credential ? (
          <div className="mt-4 grid gap-2 rounded-xl bg-v-hero-border p-4 text-xs text-v-hero-muted">
            {(['credential_id', 'recipient_name', 'programme', 'institution', 'issue_date'] as const).map((key) => {
              const val = (result.credential as Record<string, string>)[key]
              if (!val) return null
              return (
                <div key={key} className="flex justify-between">
                  <span className="text-v-hero-faint">{key.replace(/_/g, ' ')}</span>
                  <span className="text-v-hero-text">{val}</span>
                </div>
              )
            })}
          </div>
        ) : null}
      </section>

      {/* Info panel */}
      <section className="rounded-[24px] bg-v-raised p-7 sm:p-10">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-v-white">
          <Fingerprint className="size-6 text-v-text" />
        </div>
        <h3 className="mt-7 text-xl font-semibold tracking-[-0.05em] text-v-text">
          Verification is public by design
        </h3>
        <p className="mt-3 max-w-[330px] text-sm leading-6 text-v-secondary">
          Anyone can independently verify a credential without creating an account or contacting the issuing institution.
        </p>
        <div className="mt-8 flex flex-col gap-3 text-xs text-v-secondary">
          <div className="flex items-center gap-3">
            <span className="grid size-6 place-items-center rounded-full bg-v-white text-[10px] font-semibold text-v-text">01</span>
            Issuer signature checked
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-6 place-items-center rounded-full bg-v-white text-[10px] font-semibold text-v-text">02</span>
            Credential hash matched
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-6 place-items-center rounded-full bg-v-white text-[10px] font-semibold text-v-text">03</span>
            Trust record confirmed
          </div>
        </div>
      </section>
    </div>
  )
}
