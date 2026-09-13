/* ──────────────────────────────────────────────────────────
   Vaasone — Server-side auth helpers
   ────────────────────────────────────────────────────────── */

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { UserRole } from '@/lib/types'

export type UserProfile = {
  id: string
  email: string
  displayName: string
  initials: string
  organizationId: string | null
  organizationName: string | null
  organizationVerified: boolean
  role: UserRole
  isSystemAdmin: boolean
}

/**
 * Get the current authenticated user with their organization context.
 * Uses the service role client for membership lookups to bypass RLS
 * circular dependencies on institution_users → user_org_ids().
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  /* Session-aware client for auth (needs cookies) */
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  /* Check for explicit system admin */
  const metadataRole = user.app_metadata?.role || user.user_metadata?.role
  const isSystemAdmin =
    metadataRole === 'system_admin' ||
    (Boolean(process.env.SYSTEM_ADMIN_EMAIL) && user.email === process.env.SYSTEM_ADMIN_EMAIL)

  /* Service client bypasses RLS for membership lookup */
  const service = createServiceClient()
  const { data: membership } = await service
    .from('institution_users')
    .select('organization_id, role, organizations(name, settings)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  // Handle Supabase relation return type safely
  const rawOrg = membership?.organizations as unknown
  const orgData = (
    Array.isArray(rawOrg) ? rawOrg[0] : rawOrg
  ) as { name: string; settings?: Record<string, unknown>; is_verified?: boolean } | null | undefined

  const organizationVerified =
    orgData?.settings?.is_verified !== undefined
      ? Boolean(orgData.settings.is_verified)
      : orgData?.is_verified !== undefined
      ? Boolean(orgData.is_verified)
      : true

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'User'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'VA'

  let role: UserRole = 'verifier'
  if (isSystemAdmin) {
    role = 'system_admin'
  } else if (membership?.role === 'admin') {
    role = 'institution_admin'
  } else if (membership?.role === 'operator') {
    role = 'institution_operator'
  } else if (membership) {
    role = 'verifier'
  }

  return {
    id: user.id,
    email: user.email || '',
    displayName,
    initials,
    organizationId: membership?.organization_id ?? null,
    organizationName: orgData?.name ?? null,
    organizationVerified,
    role,
    isSystemAdmin,
  }
}
