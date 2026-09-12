/* ──────────────────────────────────────────────────────────
   Vaasone — Repository layer
   All Supabase database queries. Falls back to mock data
   when Supabase is not configured.
   ────────────────────────────────────────────────────────── */

import { createClient } from '@/lib/supabase/server'
import type { VerificationOutcome, VerificationLookupType } from '@/lib/types'

// ── Credentials ─────────────────────────────────────────

export async function findCredentialByPublicId(credentialId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('credentials')
    .select(
      `credential_id, recipient_name, programme, credential_type, issue_date, status,
       document_hash, certificate_number, classification, graduation_date,
       organization_id, credential_version,
       organizations(name, country)`
    )
    .eq('credential_id', credentialId)
    .maybeSingle()

  if (error) throw new Error(`Credential lookup failed: ${error.message}`)
  return data
}

export async function listCredentials(options?: {
  organizationId?: string
  status?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  let query = supabase
    .from('credentials')
    .select(
      `id, credential_id, recipient_name, programme, credential_type,
       issue_date, status, document_hash, organization_id,
       organizations(name, country)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })

  if (options?.organizationId) query = query.eq('organization_id', options.organizationId)
  if (options?.status) query = query.eq('status', options.status)
  if (options?.search) {
    query = query.or(
      `recipient_name.ilike.%${options.search}%,credential_id.ilike.%${options.search}%,programme.ilike.%${options.search}%`
    )
  }
  if (options?.limit) query = query.limit(options.limit)
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1)

  const { data, error, count } = await query
  if (error) throw new Error(`Credential listing failed: ${error.message}`)
  return { credentials: data ?? [], total: count ?? 0 }
}

// ── Blockchain Anchors ──────────────────────────────────

export async function findAnchorForCredential(credentialDbId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blockchain_anchors')
    .select('*')
    .eq('credential_id', credentialDbId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
}

export async function createAnchor(anchor: {
  credential_id: string
  provider: string
  anchor_hash: string
  transaction_id?: string
  ledger?: string
  status: string
  network: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blockchain_anchors')
    .insert({
      ...anchor,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(`Anchor creation failed: ${error.message}`)
  return data
}

export async function updateAnchorStatus(anchorId: string, update: {
  status: string
  transaction_id?: string
  ledger?: string
  confirmed_at?: string
  error_message?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('blockchain_anchors')
    .update(update)
    .eq('id', anchorId)

  if (error) throw new Error(`Anchor update failed: ${error.message}`)
}

// ── Verification Requests ───────────────────────────────

export async function createVerificationRequest(req: {
  credential_id?: string
  lookup_value: string
  lookup_type: VerificationLookupType
  result: VerificationOutcome
  verifier_ip?: string
  verifier_user_agent?: string
  response_time_ms?: number
  blockchain_verified?: boolean
}) {
  const supabase = await createClient()
  await supabase.from('verification_requests').insert(req)
}

// ── Activity Events ─────────────────────────────────────

export async function listActivities(options?: { organizationId?: string; limit?: number }) {
  const supabase = await createClient()
  let query = supabase
    .from('activity_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 20)

  if (options?.organizationId) query = query.eq('organization_id', options.organizationId)

  const { data, error } = await query
  if (error) throw new Error(`Activity listing failed: ${error.message}`)
  return data ?? []
}

export async function createActivityEvent(event: {
  organization_id?: string
  event_type: string
  label: string
  subject?: string
  credential_id?: string
  user_id?: string
  metadata?: Record<string, unknown>
}) {
  const supabase = await createClient()
  await supabase.from('activity_events').insert(event)
}

// ── Audit Logs ──────────────────────────────────────────

export async function createAuditLog(log: {
  user_id?: string
  organization_id?: string
  action: string
  resource_type?: string
  resource_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
}) {
  const supabase = await createClient()
  await supabase.from('audit_logs').insert(log)
}

// ── Stats ───────────────────────────────────────────────

export async function getCredentialStats(organizationId?: string) {
  const supabase = await createClient()
  let query = supabase.from('credentials').select('status', { count: 'exact', head: false })
  if (organizationId) query = query.eq('organization_id', organizationId)

  const { data, count } = await query
  const statuses: Record<string, number> = {}
  data?.forEach((row: { status: string }) => {
    statuses[row.status] = (statuses[row.status] || 0) + 1
  })

  return { total: count ?? 0, byStatus: statuses }
}

export async function getVerificationStats(days = 30) {
  const supabase = await createClient()
  const since = new Date(Date.now() - days * 86400_000).toISOString()

  const { count: total } = await supabase
    .from('verification_requests')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since)

  const { count: successful } = await supabase
    .from('verification_requests')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since)
    .eq('result', 'valid')

  return { total: total ?? 0, successful: successful ?? 0 }
}
