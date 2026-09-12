import { Metadata } from 'next'
import { Check, CircleHelp, XCircle, Network, ArrowUpRight, ShieldCheck } from 'lucide-react'
import { verifyCredential } from '@/lib/credential-service'
import { generateQRDataUrl, getVerificationUrl } from '@/lib/qr'
import { APP_NAME } from '@/lib/constants'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Verify ${id} — ${APP_NAME}`,
    description: `Independently verify academic credential ${id} on the ${APP_NAME} trust network.`,
  }
}

const outcomeConfig: Record<string, { icon: typeof Check; color: string; bg: string; label: string; description: string }> = {
  valid: {
    icon: Check,
    color: 'text-v-success',
    bg: 'bg-v-success-bg',
    label: 'Verified',
    description: 'This credential is authentic, active, and anchored on the blockchain.',
  },
  revoked: {
    icon: XCircle,
    color: 'text-v-error',
    bg: 'bg-v-error-bg',
    label: 'Revoked',
    description: 'This credential has been revoked by the issuing institution.',
  },
  altered: {
    icon: XCircle,
    color: 'text-v-error',
    bg: 'bg-v-error-bg',
    label: 'Altered',
    description: 'The integrity check failed. This credential may have been tampered with.',
  },
  superseded: {
    icon: CircleHelp,
    color: 'text-v-warning',
    bg: 'bg-v-warning-bg',
    label: 'Superseded',
    description: 'A newer version of this credential has been issued.',
  },
  unknown: {
    icon: CircleHelp,
    color: 'text-v-secondary',
    bg: 'bg-v-raised',
    label: 'Unknown',
    description: 'No verified credential found for this identifier.',
  },
}

export default async function PublicVerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const credentialId = decodeURIComponent(id)

  let result
  try {
    result = await verifyCredential(credentialId)
  } catch {
    result = { outcome: 'unknown' as const, verified_at: new Date().toISOString() }
  }

  const cfg = outcomeConfig[result.outcome] ?? outcomeConfig.unknown
  const Icon = cfg.icon
  let qrDataUrl = ''
  try { qrDataUrl = await generateQRDataUrl(credentialId) } catch { /* QR not critical */ }

  return (
    <main className="min-h-screen bg-v-bg p-4 text-v-text sm:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-v-accent text-v-accent-fg">
              <Network className="size-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.03em] text-v-text">
              {APP_NAME}<span className="font-normal text-v-tertiary">.trust</span>
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-v-faint">
            Public verification
          </span>
        </div>

        {/* Result card */}
        <div className="overflow-hidden rounded-[28px] bg-v-surface shadow-[var(--v-shadow)]">
          {/* Status banner */}
          <div className={`flex items-center gap-4 p-7 sm:p-9 ${cfg.bg}`}>
            <div className={`grid size-14 place-items-center rounded-2xl bg-v-white ${cfg.color}`}>
              <Icon className="size-7" />
            </div>
            <div>
              <h1 className={`text-2xl font-semibold tracking-[-0.05em] ${cfg.color}`}>{cfg.label}</h1>
              <p className="mt-1 text-sm text-v-secondary">{cfg.description}</p>
            </div>
          </div>

          {/* Credential details */}
          {result.credential && (
            <div className="border-t border-v-border p-7 sm:p-9">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-v-faint">
                Credential details
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Credential ID" value={result.credential.credential_id} mono />
                <Detail label="Recipient" value={result.credential.recipient_name} />
                <Detail label="Programme" value={result.credential.programme} />
                <Detail label="Type" value={result.credential.credential_type} />
                <Detail label="Institution" value={result.credential.institution} />
                <Detail label="Country" value={result.credential.country ?? '—'} />
                <Detail label="Issued" value={result.credential.issue_date} />
                <Detail label="Status" value={result.credential.status} />
              </div>
            </div>
          )}

          {/* Blockchain anchor */}
          {result.anchor && (
            <div className="border-t border-v-border p-7 sm:p-9">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-v-faint">
                  Blockchain Trust Record
                </p>
                {result.anchor.explorer_url && (
                  <a
                    href={result.anchor.explorer_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-v-accent hover:underline"
                  >
                    <span>View on Ledger Explorer</span>
                    <ArrowUpRight className="size-3" />
                  </a>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail
                  label="Blockchain Hash (SHA-256)"
                  value={result.anchor.anchor_hash || result.credential?.document_hash || '—'}
                  mono
                />
                <Detail label="Network" value={result.anchor.network} />
                <Detail label="Transaction ID" value={result.anchor.transaction_id ?? '—'} mono />
                <Detail label="Ledger / Block" value={result.anchor.ledger ?? 'Settled'} />
                <Detail
                  label="Confirmed At"
                  value={
                    result.anchor.confirmed_at
                      ? new Date(result.anchor.confirmed_at).toLocaleString()
                      : '—'
                  }
                />
                <Detail
                  label="Ledger State"
                  value={result.anchor.status ? result.anchor.status.toUpperCase() : 'CONFIRMED'}
                />
              </div>
            </div>
          )}

          {/* QR code */}
          {qrDataUrl && result.outcome === 'valid' && (
            <div className="border-t border-v-border p-7 sm:p-9">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <img src={qrDataUrl} alt="Verification QR code" className="size-24 rounded-xl" />
                <div>
                  <p className="text-sm font-semibold text-v-text">Scan to verify</p>
                  <p className="mt-1 text-xs text-v-tertiary">
                    This QR code links to the permanent verification URL for this credential.
                  </p>
                  <p className="mt-2 break-all font-mono text-[10px] text-v-faint">
                    {getVerificationUrl(credentialId)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-v-border bg-v-raised p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-v-tertiary">
              <ShieldCheck className="size-3.5" />
              Verified at {new Date(result.verified_at).toLocaleString()} via {APP_NAME}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-v-faint">
          This verification is publicly accessible. No account required.
        </p>
      </div>
    </main>
  )
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-v-faint">{label}</p>
      <p className={`mt-1 text-sm text-v-text ${mono ? 'break-all font-mono text-[12px]' : ''}`}>{value}</p>
    </div>
  )
}
