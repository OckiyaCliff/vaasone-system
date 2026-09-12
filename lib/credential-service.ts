import { createHash } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { stellarProvider } from '@/lib/blockchain/stellar-provider'

export type IssueCredentialInput = {
  credentialId: string
  recipientName: string
  recipientEmail?: string
  program: string
  institutionId: string
  issuedAt?: string
  idempotencyKey?: string
}

function digestCredential(input: IssueCredentialInput) {
  return `sha256:${createHash('sha256').update(JSON.stringify(input)).digest('hex').slice(0, 12)}`
}

export async function issueCredential(input: IssueCredentialInput) {
  const supabase = await createClient()
  const digest = digestCredential(input)
  const anchor = await stellarProvider.anchorCredential({ credentialId: input.credentialId, digest })
  const status = anchor.status === 'submitted' ? 'verified' : 'pending'

  const { data, error } = await supabase
    .from('credentials')
    .insert({
      credential_id: input.credentialId,
      recipient_name: input.recipientName,
      recipient_email: input.recipientEmail || null,
      program: input.program,
      institution_id: input.institutionId,
      issued_at: input.issuedAt || new Date().toISOString().slice(0, 10),
      status,
      network: 'Stellar',
      digest,
      transaction_id: anchor.transactionId || null,
      ledger: null,
      idempotency_key: input.idempotencyKey || null,
    })
    .select('id, credential_id, status, digest, transaction_id, network')
    .single()

  if (error) {
    if (error.code === '23505') {
      const existing = await supabase.from('credentials').select('id, credential_id, status, digest, transaction_id, network').eq('credential_id', input.credentialId).maybeSingle()
      if (existing.data) return existing.data
    }
    throw new Error(`Credential issuance failed: ${error.message}`)
  }

  await supabase.from('activity_events').insert({
    event_type: 'issued',
    label: 'Credential issuance requested',
    subject: `${input.recipientName} · ${input.program}`,
    credential_id: data.id,
    institution_id: input.institutionId,
  })

  return data
}

export async function revokeCredential(credentialId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('credentials')
    .update({ status: 'revoked', updated_at: new Date().toISOString() })
    .eq('credential_id', credentialId)
    .select('id, credential_id, recipient_name, program, status')
    .single()

  if (error) throw new Error(`Credential revocation failed: ${error.message}`)

  await supabase.from('activity_events').insert({
    event_type: 'revoked',
    label: 'Credential revoked',
    subject: `${data.recipient_name} · ${data.program}`,
    credential_id: data.id,
  })

  return data
}
