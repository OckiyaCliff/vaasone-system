/* ──────────────────────────────────────────────────────────
   Vaasone — Repository layer
   All Supabase database queries. Falls back to mock data
   when Supabase is not configured.
   ────────────────────────────────────────────────────────── */

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { VerificationOutcome, VerificationLookupType } from '@/lib/types'

// ── Credentials ─────────────────────────────────────────

export async function findCredentialByPublicId(credentialId: string) {
  const service = createServiceClient()
  const { data, error } = await service
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
  const service = createServiceClient()
  const { data } = await service
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
  const service = createServiceClient()
  const { data, error } = await service
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
  const service = createServiceClient()
  const { error } = await service
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
  const service = createServiceClient()
  await service.from('verification_requests').insert(req)
}

// ── Activity Events ─────────────────────────────────────

export async function listActivities(options?: { organizationId?: string; limit?: number }) {
  const service = createServiceClient()
  let query = service
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
  const service = createServiceClient()
  await service.from('activity_events').insert(event)
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
  const service = createServiceClient()
  await service.from('audit_logs').insert(log)
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

// ── Organizations & Users (Multi-Tenancy) ─────────────────

export async function listOrganizations() {
  const service = createServiceClient()
  const { data: orgs, error } = await service
    .from('organizations')
    .select(`
      id, name, slug, type, country, website, logo_url, created_at,
      credentials:credentials(count),
      institution_users:institution_users(count)
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Organization listing failed: ${error.message}`)

  return (orgs ?? []).map((org: any) => ({
    id: org.id as string,
    name: org.name as string,
    slug: org.slug as string,
    type: org.type as string,
    country: (org.country as string) || 'Global',
    website: org.website as string | null,
    logo_url: org.logo_url as string | null,
    created_at: org.created_at as string,
    credentialsCount: (org.credentials?.[0]?.count as number) ?? 0,
    usersCount: (org.institution_users?.[0]?.count as number) ?? 0,
  }))
}

export async function getOrganization(id: string) {
  const service = createServiceClient()
  const { data, error } = await service
    .from('organizations')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Organization lookup failed: ${error.message}`)
  return data
}

export async function createOrganization(org: {
  name: string
  slug: string
  type?: string
  country?: string
  website?: string
  logo_url?: string
  initialAdminUserId?: string
}) {
  const service = createServiceClient()
  const { data, error } = await service
    .from('organizations')
    .insert({
      name: org.name,
      slug: org.slug,
      type: org.type || 'university',
      country: org.country || null,
      website: org.website || null,
      logo_url: org.logo_url || null,
    })
    .select()
    .single()

  if (error) throw new Error(`Organization creation failed: ${error.message}`)

  // If initial admin user ID was passed, associate them as admin
  if (org.initialAdminUserId && data?.id) {
    await service.from('institution_users').upsert({
      user_id: org.initialAdminUserId,
      organization_id: data.id,
      role: 'admin',
    })
  }

  return data
}

export async function listOrganizationUsers(organizationId?: string) {
  const service = createServiceClient()
  let query = service
    .from('institution_users')
    .select(`
      id, user_id, organization_id, role, created_at,
      organizations(name, slug)
    `)
    .order('created_at', { ascending: false })

  if (organizationId) query = query.eq('organization_id', organizationId)

  const { data, error } = await query
  if (error) throw new Error(`Institution users listing failed: ${error.message}`)
  return data ?? []
}

export async function listPlatformUsers() {
  const service = createServiceClient()
  // Fetch auth users using service client auth admin api
  const { data: { users }, error } = await service.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  })

  if (error) {
    console.error('Failed to list auth users:', error)
    return []
  }

  // Also fetch current memberships to know which organization they belong to
  const { data: memberships } = await service
    .from('institution_users')
    .select('id, user_id, organization_id, role, organizations(name)')

  const memberMap = new Map<string, any>()
  memberships?.forEach((m: any) => {
    memberMap.set(m.user_id, m)
  })

  return users.map((u) => {
    const membership = memberMap.get(u.id)
    const org = membership?.organizations
    const orgName = Array.isArray(org) ? org[0]?.name : org?.name

    return {
      id: u.id,
      email: u.email || '',
      displayName: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
      createdAt: u.created_at,
      organizationId: membership?.organization_id || null,
      organizationName: orgName || null,
      role: membership?.role || (u.app_metadata?.role === 'system_admin' ? 'system_admin' : 'unassigned'),
      membershipId: membership?.id || null,
    }
  })
}

export async function assignUserToOrganization(params: {
  userId: string
  organizationId: string
  role: 'admin' | 'operator' | 'viewer'
}) {
  const service = createServiceClient()
  const { data, error } = await service
    .from('institution_users')
    .upsert(
      {
        user_id: params.userId,
        organization_id: params.organizationId,
        role: params.role,
      },
      { onConflict: 'user_id,organization_id' }
    )
    .select()
    .single()

  if (error) throw new Error(`User assignment failed: ${error.message}`)
  return data
}

