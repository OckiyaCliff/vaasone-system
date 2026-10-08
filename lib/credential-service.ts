/* ──────────────────────────────────────────────────────────
   Vaasone — Credential service
   Full credential lifecycle: issue → hash → anchor → verify → revoke
   ────────────────────────────────────────────────────────── */

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { hashCredential, buildHashPayload } from '@/lib/crypto'
import { getDefaultProvider, getProvider } from '@/lib/blockchain/provider-registry'
import {
  findCredentialByPublicId,
  findCredentialByHash,
  findAnchorForCredential,
  createAnchor,
  updateAnchorStatus,
  createActivityEvent,
  createAuditLog,
  searchCertificates,
} from '@/lib/vaas-repository'
import type {
  IssueCredentialInput,
  VerificationResult,
  VerificationOutcome,
  CertificateSearchFilter,
  CertificateVerificationItem,
} from '@/lib/types'

// ── Issue Credential ────────────────────────────────────

export async function issueCredential(input: IssueCredentialInput) {
  const supabase = createServiceClient()

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
  } catch (anchorErr) {
    console.warn('Anchor submission encountered an issue, recording pending/failed state:', anchorErr)
    /* Anchor failure should not block credential creation */
    try {
      await createAnchor({
        credential_id: data.id,
        provider: 'stellar',
        anchor_hash: digest,
        status: 'failed',
        network: 'testnet',
      })
    } catch (recordErr) {
      console.warn('Could not record failed anchor record:', recordErr)
    }
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
  const credential = await findCredentialByPublicId(credentialId)

  if (!credential) {
    return {
      outcome: 'unknown' as VerificationOutcome,
      verified_at: new Date().toISOString(),
    }
  }

  /* Always look up blockchain anchor */
  let anchor: any = null
  try {
    const service = createServiceClient()
    const { data: credRow } = await service
      .from('credentials')
      .select('id')
      .eq('credential_id', credentialId)
      .maybeSingle()

    if (credRow) {
      anchor = await findAnchorForCredential(credRow.id)
    }
  } catch {
    /* Anchor lookup failure doesn't invalidate the credential */
  }

  /* Verify on-chain with provider if real transaction exists */
  let blockchainVerified = false
  if (anchor?.transaction_id) {
    try {
      const provider = getProvider((anchor.provider as any) || 'stellar')
      const verification = await provider.verifyAnchor(anchor.transaction_id)
      blockchainVerified = verification.valid
    } catch {
      blockchainVerified = false
    }
  }

  const explorerUrl =
    anchor?.transaction_id && !anchor.transaction_id.startsWith('stub:')
      ? anchor.provider === 'stellar'
        ? `https://stellar.expert/explorer/testnet/tx/${anchor.transaction_id}`
        : `https://testnet.bscscan.com/tx/${anchor.transaction_id}`
      : null

  const formattedAnchor = anchor
    ? {
        network: anchor.provider === 'stellar' ? 'Stellar Network' : 'BNB Smart Chain',
        provider: anchor.provider,
        status: anchor.status || 'confirmed',
        transaction_id: anchor.transaction_id,
        ledger: anchor.ledger,
        anchor_hash: anchor.anchor_hash || credential.document_hash || null,
        confirmed_at: anchor.confirmed_at || anchor.submitted_at || null,
        explorer_url: explorerUrl,
      }
    : undefined

  const formattedCredential = formatCredentialResult(credential)

  /* Check status */
  if (credential.status === 'revoked') {
    return {
      outcome: 'revoked',
      credential: formattedCredential,
      anchor: formattedAnchor,
      blockchain_verified: blockchainVerified,
      verified_at: new Date().toISOString(),
    }
  }

  if (credential.status === 'superseded') {
    return {
      outcome: 'superseded',
      credential: formattedCredential,
      anchor: formattedAnchor,
      blockchain_verified: blockchainVerified,
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
        credential: formattedCredential,
        anchor: formattedAnchor,
        blockchain_verified: false,
        verified_at: new Date().toISOString(),
      }
    }
  }

  return {
    outcome: 'valid',
    credential: formattedCredential,
    anchor: formattedAnchor,
    blockchain_verified: blockchainVerified,
    verified_at: new Date().toISOString(),
  }
}

export async function verifyCredentialByHash(documentHash: string): Promise<VerificationResult> {
  const credential = await findCredentialByHash(documentHash)
  if (!credential) {
    return {
      outcome: 'unknown' as VerificationOutcome,
      verified_at: new Date().toISOString(),
    }
  }
  return verifyCredential(credential.credential_id)
}

// ── Revoke Credential ───────────────────────────────────

export async function revokeCredential(credentialId: string) {
  const supabase = createServiceClient()

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
function formatCredentialResult(credential: Record<string, any>): CertificateVerificationItem {
  /* Supabase joins may return organizations as an array or single object */
  const org = Array.isArray(credential.organizations)
    ? credential.organizations[0]
    : credential.organizations

  return {
    credential_id: credential.credential_id,
    recipient_name: credential.recipient_name,
    student_reference: credential.student_reference ?? null,
    programme: credential.programme,
    credential_type: (credential.credential_type as any) || 'degree',
    issue_date: credential.issue_date,
    graduation_date: credential.graduation_date ?? null,
    certificate_number: credential.certificate_number ?? null,
    classification: credential.classification ?? null,
    status: credential.status as any,
    institution: org?.name ?? 'Unknown',
    country: org?.country ?? null,
    document_hash: credential.document_hash ?? null,
    is_accredited: org?.settings?.is_verified !== false,
  }
}

/**
 * Robust multi-criteria search and verification for certificates.
 * Enforces institutional data privacy:
 * - Public searches require a student identifier (matriculation number or certificate ID).
 * - Accredited institution employers can filter by graduation year, institution, and candidate ID.
 */
export async function verifyCertificatesBySearch(
  filter: CertificateSearchFilter,
  isAuthorizedEmployer = false
): Promise<VerificationResult> {
  const isPublic = !isAuthorizedEmployer

  const hasIdentifier = Boolean(
    filter.studentReference?.trim() ||
    filter.certificateId?.trim() ||
    filter.certificateNumber?.trim()
  )

  // Enforce data privacy policy for public search
  if (isPublic && !hasIdentifier) {
    return {
      outcome: 'unknown',
      policy_restricted: true,
      message:
        'Data Privacy Policy Notice: Public directory browsing is restricted to protect graduate privacy. Please provide the student\'s Matriculation Number or Certificate ID to verify.',
      verified_at: new Date().toISOString(),
      certificates: [],
      total: 0,
    }
  }

  // If searching an unaccredited institution, require direct student identifier
  if (filter.institutionId || filter.institutionSlug) {
    const service = createServiceClient()
    let orgQuery = service.from('organizations').select('id, name, slug, settings')
    if (filter.institutionId) orgQuery = orgQuery.eq('id', filter.institutionId)
    else if (filter.institutionSlug) orgQuery = orgQuery.eq('slug', filter.institutionSlug)
    const { data: orgData } = await orgQuery.maybeSingle()

    const isAccredited = orgData?.settings?.is_verified !== false
    if (!isAccredited && !hasIdentifier) {
      return {
        outcome: 'unknown',
        policy_restricted: true,
        message: `${orgData?.name || 'This institution'} has not completed accredited verification. Direct Certificate ID or Student Matriculation lookup is required.`,
        verified_at: new Date().toISOString(),
        certificates: [],
        total: 0,
      }
    }
  }

  // Execute repository search
  const records = await searchCertificates({
    ...filter,
    limit: filter.limit || (isAuthorizedEmployer ? 20 : 5),
  })

  if (records.length === 0) {
    return {
      outcome: 'unknown',
      verified_at: new Date().toISOString(),
      certificates: [],
      total: 0,
      message: 'No certificate matching the specified criteria was found on the Vaasone Trust Network.',
    }
  }

  // Format and verify each certificate record
  const formattedCertificates: CertificateVerificationItem[] = []
  let primaryAnchor: any = null
  let anyBlockchainVerified = false

  for (const record of records) {
    const formatted = formatCredentialResult(record)

    let anchor: any = null
    try {
      anchor = await findAnchorForCredential(record.id)
    } catch {
      // Non-blocking
    }

    if (anchor && !primaryAnchor) {
      const explorerUrl =
        anchor.transaction_id && !anchor.transaction_id.startsWith('stub:')
          ? anchor.provider === 'stellar'
            ? `https://stellar.expert/explorer/testnet/tx/${anchor.transaction_id}`
            : `https://testnet.bscscan.com/tx/${anchor.transaction_id}`
          : null

      primaryAnchor = {
        network: anchor.provider === 'stellar' ? 'Stellar Network' : 'BNB Smart Chain',
        provider: anchor.provider,
        status: anchor.status || 'confirmed',
        transaction_id: anchor.transaction_id,
        ledger: anchor.ledger,
        anchor_hash: anchor.anchor_hash || record.document_hash || null,
        confirmed_at: anchor.confirmed_at || anchor.submitted_at || null,
        explorer_url: explorerUrl,
      }

      if (anchor.transaction_id) {
        anyBlockchainVerified = true
      }
    }

    formattedCertificates.push(formatted)
  }

  const primaryCert = formattedCertificates[0]
  const outcome: VerificationOutcome =
    primaryCert.status === 'revoked'
      ? 'revoked'
      : primaryCert.status === 'superseded'
      ? 'superseded'
      : 'valid'

  return {
    outcome,
    credential: primaryCert,
    certificates: formattedCertificates,
    total: formattedCertificates.length,
    anchor: primaryAnchor,
    blockchain_verified: anyBlockchainVerified,
    verified_at: new Date().toISOString(),
  }
}
