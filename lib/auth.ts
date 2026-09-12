/* ──────────────────────────────────────────────────────────
   Vaasone — Server-side auth helpers
   ────────────────────────────────────────────────────────── */

import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types'

export type UserProfile = {
  id: string
  email: string
  displayName: string
  initials: string
  organizationId: string | null
  organizationName: string | null
  role: UserRole
  isSystemAdmin: boolean
}

/**
 * Get the current authenticated user with their organization context.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  /* Check for explicit system admin */
  const metadataRole = user.app_metadata?.role || user.user_metadata?.role
  let isSystemAdmin =
    metadataRole === 'system_admin' ||
    (Boolean(process.env.SYSTEM_ADMIN_EMAIL) && user.email === process.env.SYSTEM_ADMIN_EMAIL)

  /* Look up org membership */
  const { data: membership } = await supabase
    .from('institution_users')
    .select('organization_id, role, organizations(name)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  // Handle Supabase relation return type safely
  const rawOrg = membership?.organizations as unknown
  const orgData = (
    Array.isArray(rawOrg) ? rawOrg[0] : rawOrg
  ) as { name: string } | null | undefined

  /* If there are 0 organizations in the DB yet, promote the logged-in user to system_admin so they can run the setup wizard */
  if (!isSystemAdmin && !membership) {
    const { count: orgCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
    if (orgCount === 0 || orgCount === null) {
      isSystemAdmin = true
    }
  }

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
    role,
    isSystemAdmin,
  }
}
