/* ──────────────────────────────────────────────────────────
   Vaasone — Repository layer
   All Supabase database queries. Falls back to mock data
   when Supabase is not configured.
   ────────────────────────────────────────────────────────── */

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { VerificationOutcome, VerificationLookupType, CertificateSearchFilter } from '@/lib/types'

// ── Credentials / Certificates ──────────────────────────

export async function findCredentialByPublicId(credentialId: string) {
  const service = createServiceClient()
  const cleanId = credentialId.trim()
  const SELECT_FIELDS = `
    id, credential_id, recipient_name, programme, credential_type, issue_date, status,
    document_hash, certificate_number, classification, graduation_date, student_reference,
    organization_id, credential_version,
    organizations(id, name, slug, country, settings)
  `

  // 1. Direct match by credential_id (exact or case-insensitive)
  const byCredId = await service
    .from('credentials')
    .select(SELECT_FIELDS)
    .ilike('credential_id', cleanId)
    .maybeSingle()

  if (byCredId.data) return byCredId.data

  // 2. Direct match by student_reference / matriculation number (exact)
  const byStudentRef = await service
    .from('credentials')
    .select(SELECT_FIELDS)
    .ilike('student_reference', cleanId)
    .maybeSingle()

  if (byStudentRef.data) return byStudentRef.data

  // 3. Direct match by certificate_number (exact)
  const byCertNo = await service
    .from('credentials')
    .select(SELECT_FIELDS)
    .ilike('certificate_number', cleanId)
    .maybeSingle()

  if (byCertNo.data) return byCertNo.data

  // 4. Substring partial match (e.g. searching '0118', '0042', '4822')
  if (cleanId.length >= 3) {
    const byPartial = await service
      .from('credentials')
      .select(SELECT_FIELDS)
      .or(
        `student_reference.ilike.%${cleanId}%,certificate_number.ilike.%${cleanId}%,credential_id.ilike.%${cleanId}%`
      )
      .limit(1)
      .maybeSingle()

    if (byPartial.data) return byPartial.data
  }

  return null
}

export async function findCredentialByHash(documentHash: string) {
  const service = createServiceClient()
  const { data, error } = await service
    .from('credentials')
    .select(
      `id, credential_id, recipient_name, programme, credential_type, issue_date, status,
       document_hash, certificate_number, classification, graduation_date, student_reference,
       organization_id, credential_version,
       organizations(id, name, slug, country, settings)`
    )
    .eq('document_hash', documentHash)
    .maybeSingle()

  if (error) throw new Error(`Certificate lookup failed: ${error.message}`)
  return data
}

export async function searchCertificates(filter: CertificateSearchFilter) {
  const service = createServiceClient()
  const SELECT_FIELDS = `
    id, credential_id, recipient_name, programme, credential_type,
    issue_date, graduation_date, student_reference, certificate_number,
    classification, status, document_hash, organization_id, credential_version,
    organizations!inner(id, name, slug, country, settings)
  `

  async function executeQuery(applyYearFilter: boolean) {
    let query = service.from('credentials').select(SELECT_FIELDS)

    if (filter.institutionId) {
      query = query.eq('organization_id', filter.institutionId)
    }

    if (filter.institutionSlug) {
      query = query.eq('organizations.slug', filter.institutionSlug)
    }

    if (applyYearFilter && filter.graduationYear) {
      const yr = String(filter.graduationYear).trim()
      query = query.gte('graduation_date', `${yr}-01-01`).lte('graduation_date', `${yr}-12-31`)
    }

    if (filter.studentReference) {
      const ref = filter.studentReference.trim()
      query = query.or(`student_reference.ilike.%${ref}%,certificate_number.ilike.%${ref}%`)
    }

    if (filter.certificateId) {
      query = query.ilike('credential_id', `%${filter.certificateId.trim()}%`)
    }

    if (filter.certificateNumber) {
      query = query.ilike('certificate_number', `%${filter.certificateNumber.trim()}%`)
    }

    if (filter.candidateName) {
      query = query.ilike('recipient_name', `%${filter.candidateName.trim()}%`)
    }

    query = query.order('issue_date', { ascending: false }).limit(filter.limit || 20)
    const { data, error } = await query
    if (error) throw new Error(`Certificate search failed: ${error.message}`)
    return data ?? []
  }

  // First run with year filter if requested
  let results = await executeQuery(Boolean(filter.graduationYear))

  // If no results found and user entered an identifier (matric / name / cert), retry without strict year
  if (
    results.length === 0 &&
    filter.graduationYear &&
    (filter.studentReference || filter.candidateName || filter.certificateNumber)
  ) {
    results = await executeQuery(false)
  }

  return results
}

export async function listPublicInstitutions() {
  const service = createServiceClient()
  const { data, error } = await service
    .from('organizations')
    .select('id, name, slug, country, logo_url, settings')
    .order('name', { ascending: true })

  if (error) return []
  return (data ?? []).map((org: any) => ({
    id: org.id as string,
    name: org.name as string,
    slug: org.slug as string,
    country: (org.country as string) || 'Global',
    logo_url: org.logo_url as string | null,
    isVerified: org.settings?.is_verified ?? true,
  }))
}

export async function listCredentials(options?: {
  organizationId?: string
  status?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const service = createServiceClient()
  let query = service
    .from('credentials')
    .select(
      `id, credential_id, recipient_name, programme, credential_type,
       issue_date, graduation_date, student_reference, certificate_number,
       classification, status, document_hash, organization_id,
       organizations(id, name, country, slug)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })

  if (options?.organizationId) query = query.eq('organization_id', options.organizationId)
  if (options?.status) query = query.eq('status', options.status)
  if (options?.search) {
    const s = options.search.trim()
    query = query.or(
      `recipient_name.ilike.%${s}%,credential_id.ilike.%${s}%,programme.ilike.%${s}%,student_reference.ilike.%${s}%,certificate_number.ilike.%${s}%`
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
  const service = createServiceClient()
  let query = service.from('credentials').select('status, credential_type', { count: 'exact', head: false })
  if (organizationId) query = query.eq('organization_id', organizationId)

  const { data, count } = await query
  const statuses: Record<string, number> = {}
  const types: Record<string, number> = {}

  data?.forEach((row: { status: string; credential_type?: string }) => {
    statuses[row.status] = (statuses[row.status] || 0) + 1
    const t = row.credential_type || 'degree'
    types[t] = (types[t] || 0) + 1
  })

  return { total: count ?? 0, byStatus: statuses, byType: types }
}

export async function getVerificationStats(days = 30) {
  const service = createServiceClient()
  const since = new Date(Date.now() - days * 86400_000).toISOString()

  const { count: total } = await service
    .from('verification_requests')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since)

  const { count: successful } = await service
    .from('verification_requests')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since)
    .eq('result', 'valid')

  const { count: unknown } = await service
    .from('verification_requests')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since)
    .eq('result', 'unknown')

  const { count: revoked } = await service
    .from('verification_requests')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since)
    .eq('result', 'revoked')

  return {
    total: total ?? 0,
    successful: successful ?? 0,
    unknown: unknown ?? 0,
    revoked: revoked ?? 0,
  }
}

export async function getBlockchainAnchorStats(organizationId?: string) {
  const service = createServiceClient()
  const { data } = await service
    .from('blockchain_anchors')
    .select('id, provider, status, transaction_id, confirmed_at, created_at')
    .order('created_at', { ascending: false })

  const total = data?.length ?? 0
  const confirmed = data?.filter((a: any) => a.status === 'confirmed').length ?? 0
  const pending = data?.filter((a: any) => a.status === 'pending').length ?? 0
  const latestTx = data?.find((a: any) => a.transaction_id) || null

  return {
    total,
    confirmed,
    pending,
    latestTx,
  }
}

export async function getRecentCredentials(organizationId?: string, limit = 5) {
  const service = createServiceClient()
  let query = service
    .from('credentials')
    .select(`
      id, credential_id, recipient_name, programme, credential_type,
      issue_date, graduation_date, student_reference, certificate_number,
      status, document_hash, created_at,
      organizations(id, name, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  const { data } = await query
  return data ?? []
}

export async function getRecentVerificationRequests(organizationId?: string, limit = 6) {
  const service = createServiceClient()
  let query = service
    .from('verification_requests')
    .select('id, lookup_value, lookup_type, result, created_at, blockchain_verified')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  const { data } = await query
  return data ?? []
}

export async function getVerificationTimeline(days = 12) {
  const service = createServiceClient()
  const since = new Date(Date.now() - days * 86400_000).toISOString()
  const { data } = await service
    .from('verification_requests')
    .select('created_at')
    .gte('created_at', since)

  const buckets: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000).toISOString().split('T')[0]
    buckets[d] = 0
  }

  data?.forEach((row: { created_at: string }) => {
    const d = row.created_at.split('T')[0]
    if (buckets[d] !== undefined) {
      buckets[d]++
    }
  })

  const counts = Object.values(buckets)
  const max = Math.max(...counts, 1)
  return counts.map((c) => Math.max(15, Math.round((c / max) * 100)))
}

export async function getIntegrationConnections(organizationId?: string) {
  const service = createServiceClient()
  let query = service.from('integration_connections').select('*')
  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }
  const { data } = await query
  return data ?? []
}

// ── Organizations & Users (Multi-Tenancy) ─────────────────

export async function listOrganizations() {
  const service = createServiceClient()
  const { data: orgs, error } = await service
    .from('organizations')
    .select(`
      id, name, slug, type, country, website, logo_url, settings, created_at,
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
    settings: org.settings || {},
    isVerified: org.settings?.is_verified ?? true,
    created_at: org.created_at as string,
    credentialsCount: (org.credentials?.[0]?.count as number) ?? 0,
    usersCount: (org.institution_users?.[0]?.count as number) ?? 0,
  }))
}

export async function setOrganizationVerified(organizationId: string, isVerified: boolean) {
  const service = createServiceClient()
  const { data: currentOrg } = await service
    .from('organizations')
    .select('settings')
    .eq('id', organizationId)
    .single()

  const currentSettings = (currentOrg?.settings as Record<string, any>) || {}
  const newSettings = { ...currentSettings, is_verified: isVerified }

  const { data, error } = await service
    .from('organizations')
    .update({ settings: newSettings })
    .eq('id', organizationId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update organization status: ${error.message}`)
  return data
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

