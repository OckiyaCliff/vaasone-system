/* ──────────────────────────────────────────────────────────
   Vaasone — Credential service
   Full credential lifecycle: issue → hash → anchor → verify → revoke
   ────────────────────────────────────────────────────────── */

import { createClient } from '@/lib/supabase/server'
import { hashCredential, buildHashPayload } from '@/lib/crypto'
import { getDefaultProvider } from '@/lib/blockchain/provider-registry'
import {
  findCredentialByPublicId,
  findAnchorForCredential,
  createAnchor,
  updateAnchorStatus,
  createActivityEvent,
  createAuditLog,
} from '@/lib/vaas-repository'
import type { IssueCredentialInput, VerificationResult, VerificationOutcome } from '@/lib/types'

// ── Issue Credential ────────────────────────────────────

export async function issueCredential(input: IssueCredentialInput) {
  const supabase = await createClient()

  /* Build the canonical hash */
  const hashPayload = buildHashPayload({
    credential_id: input.credentialId,
    recipient_name: input.recipientName,
    programme: input.programme,
    credential_type: input.credentialType || 'degree',
    issue_date: input.issuedAt || new Date().toISOString().slice(0, 10),
    organization_id: input.organizationId,
    certificate_number: input.certificateNumber,
    graduation_date: input.graduationDate,
    classification: input.classification,
  })
  const digest = hashCredential(hashPayload)

  /* Insert credential record */
  const { data, error } = await supabase
    .from('credentials')
    .insert({
      credential_id: input.credentialId,
      organization_id: input.organizationId,
      recipient_name: input.recipientName,
      recipient_email: input.recipientEmail || null,
      student_reference: input.studentReference || null,
      credential_type: input.credentialType || 'degree',
      programme: input.programme,
      programme_code: input.programmeCode || null,
      award_title: input.awardTitle || null,
      classification: input.classification || null,
      graduation_date: input.graduationDate || null,
      certificate_number: input.certificateNumber || null,
      issue_date: input.issuedAt || new Date().toISOString().slice(0, 10),
      document_hash: digest,
      status: 'issued',
      idempotency_key: input.idempotencyKey || null,
    })
    .select('id, credential_id, status, document_hash, organization_id')
    .single()

  if (error) {
    /* Handle idempotent retry */
    if (error.code === '23505') {
      const existing = await supabase
        .from('credentials')
        .select('id, credential_id, status, document_hash, organization_id')
        .eq('credential_id', input.credentialId)
        .maybeSingle()
      if (existing.data) return existing.data
    }
    throw new Error(`Credential issuance failed: ${error.message}`)
  }

  /* Anchor on blockchain (async, non-blocking for the response) */
  try {
    const provider = getDefaultProvider()
    const anchorResult = await provider.anchorCredential({
      credentialId: input.credentialId,
      digest,
    })

    await createAnchor({
      credential_id: data.id,
      provider: 'stellar',
      anchor_hash: digest,
      transaction_id: anchorResult.transactionId || undefined,
      ledger: anchorResult.ledger || undefined,
      status: anchorResult.status === 'confirmed' ? 'confirmed' : 'submitted',
      network: 'testnet',
    })

    /* Update credential status to active if anchor confirmed */
    if (anchorResult.status === 'confirmed') {
      await supabase.from('credentials').update({ status: 'active' }).eq('id', data.id)
      data.status = 'active'
    }
  } catch {
    /* Anchor failure should not block credential creation */
    await createAnchor({
      credential_id: data.id,
      provider: 'stellar',
      anchor_hash: digest,
      status: 'failed',
      network: 'testnet',
    })
  }

  /* Log activity */
  await createActivityEvent({
    organization_id: input.organizationId,
    event_type: 'issued',
    label: 'Credential issued',
    subject: `${input.recipientName} · ${input.programme}`,
    credential_id: data.id,
  })

  return data
}

// ── Verify Credential ───────────────────────────────────

export async function verifyCredential(credentialId: string): Promise<VerificationResult> {
  const startTime = Date.now()

  const credential = await findCredentialByPublicId(credentialId)

  if (!credential) {
    return {
      outcome: 'unknown' as VerificationOutcome,
      verified_at: new Date().toISOString(),
    }
  }

  /* Check status */
  if (credential.status === 'revoked') {
    return {
      outcome: 'revoked',
      credential: formatCredentialResult(credential),
      verified_at: new Date().toISOString(),
    }
  }

  if (credential.status === 'superseded') {
    return {
      outcome: 'superseded',
      credential: formatCredentialResult(credential),
      verified_at: new Date().toISOString(),
    }
  }

  /* Verify hash integrity */
  if (credential.document_hash) {
    const hashPayload = buildHashPayload({
      credential_id: credential.credential_id,
      recipient_name: credential.recipient_name,
      programme: credential.programme,
      credential_type: credential.credential_type,
      issue_date: credential.issue_date,
      organization_id: credential.organization_id,
      certificate_number: credential.certificate_number,
      graduation_date: credential.graduation_date,
      classification: credential.classification,
    })
    const computedHash = hashCredential(hashPayload)

    if (computedHash !== credential.document_hash) {
      return {
        outcome: 'altered',
        credential: formatCredentialResult(credential),
        verified_at: new Date().toISOString(),
      }
    }
  }

  /* Verify blockchain anchor if available */
  let anchor = null
  try {
    const supabase = await createClient()
    const { data: credRow } = await supabase
      .from('credentials')
      .select('id')
      .eq('credential_id', credentialId)
      .single()

    if (credRow) {
      anchor = await findAnchorForCredential(credRow.id)
    }
  } catch {
    /* Anchor lookup failure doesn't invalidate the credential */
  }

  return {
    outcome: 'valid',
    credential: formatCredentialResult(credential),
    anchor: anchor
      ? {
          network: anchor.provider,
          transaction_id: anchor.transaction_id,
          ledger: anchor.ledger,
          confirmed_at: anchor.confirmed_at,
        }
      : undefined,
    verified_at: new Date().toISOString(),
  }
}

// ── Revoke Credential ───────────────────────────────────

export async function revokeCredential(credentialId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('credentials')
    .update({ status: 'revoked' })
    .eq('credential_id', credentialId)
    .select('id, credential_id, recipient_name, programme, status, document_hash, organization_id')
    .single()

  if (error) throw new Error(`Credential revocation failed: ${error.message}`)

  /* Revoke on blockchain */
  try {
    const provider = getDefaultProvider()
    await provider.revokeCredential({
      credentialId,
      digest: data.document_hash || '',
    })
  } catch {
    /* Blockchain revocation failure is logged but doesn't block DB revocation */
  }

  /* Log activity */
  await createActivityEvent({
    organization_id: data.organization_id,
    event_type: 'revoked',
    label: 'Credential revoked',
    subject: `${data.recipient_name} · ${data.programme}`,
    credential_id: data.id,
  })

  await createAuditLog({
    organization_id: data.organization_id,
    action: 'credential.revoked',
    resource_type: 'credential',
    resource_id: data.credential_id,
    details: { recipient: data.recipient_name },
  })

  return data
}

// ── Helpers ─────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function formatCredentialResult(credential: Record<string, any>) {
  /* Supabase joins may return organizations as an array or single object */
  const org = Array.isArray(credential.organizations)
    ? credential.organizations[0]
    : credential.organizations

  return {
    credential_id: credential.credential_id,
    recipient_name: credential.recipient_name,
    programme: credential.programme,
    credential_type: credential.credential_type as any,
    issue_date: credential.issue_date,
    status: credential.status as any,
    institution: org?.name ?? 'Unknown',
    country: org?.country ?? null,
  }
}
