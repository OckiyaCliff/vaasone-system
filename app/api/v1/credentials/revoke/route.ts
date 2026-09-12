import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revokeCredential } from '@/lib/credential-service'
import { createAuditLog } from '@/lib/vaas-repository'

/**
 * POST /api/v1/credentials/revoke
 * Authenticated endpoint for revoking credentials.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const credentialId =
    body && typeof body === 'object' && 'credentialId' in body
      ? String(body.credentialId).trim()
      : ''

  if (!credentialId) {
    return NextResponse.json({ error: 'credentialId is required' }, { status: 400 })
  }

  try {
    const result = await revokeCredential(credentialId)

    await createAuditLog({
      user_id: user.id,
      organization_id: result.organization_id,
      action: 'credential.revoked',
      resource_type: 'credential',
      resource_id: credentialId,
    })

    return NextResponse.json({ credential: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Credential revocation could not be completed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
