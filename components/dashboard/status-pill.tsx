'use client'

import type { CredentialStatus } from '@/lib/types'
import { CREDENTIAL_STATUS_LABELS } from '@/lib/constants'

const styles: Record<string, { bg: string; text: string; dot: string }> = {
  active:     { bg: 'bg-v-success-bg', text: 'text-v-success', dot: 'bg-v-success-dot' },
  verified:   { bg: 'bg-v-success-bg', text: 'text-v-success', dot: 'bg-v-success-dot' },
  issued:     { bg: 'bg-v-success-bg', text: 'text-v-success', dot: 'bg-v-success-dot' },
  validated:  { bg: 'bg-v-success-bg', text: 'text-v-success', dot: 'bg-v-success-dot' },
  draft:      { bg: 'bg-v-warning-bg', text: 'text-v-warning', dot: 'bg-v-warning-dot' },
  pending:    { bg: 'bg-v-warning-bg', text: 'text-v-warning', dot: 'bg-v-warning-dot' },
  suspended:  { bg: 'bg-v-warning-bg', text: 'text-v-warning', dot: 'bg-v-warning-dot' },
  revoked:    { bg: 'bg-v-accent text-v-accent-fg', text: '', dot: 'bg-v-accent-fg' },
  superseded: { bg: 'bg-v-raised', text: 'text-v-secondary', dot: 'bg-v-faint' },
}

export function StatusPill({ status }: { status: CredentialStatus | string }) {
  const s = styles[status] ?? styles.draft
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {CREDENTIAL_STATUS_LABELS[status] ?? status}
    </span>
  )
}
