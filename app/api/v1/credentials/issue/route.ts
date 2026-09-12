import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { issueCredential } from '@/lib/credential-service'
import { createAuditLog } from '@/lib/vaas-repository'
import type { IssueCredentialInput } from '@/lib/types'

/**
 * POST /api/v1/credentials/issue
 * Authenticated endpoint for issuing new credentials.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const input = body as Record<string, unknown>
  const required = ['credentialId', 'recipientName', 'programme', 'organizationId'] as const
  const missing = required.filter((k) => typeof input[k] !== 'string' || !String(input[k]).trim())
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Required fields missing: ${missing.join(', ')}` },
      { status: 400 }
    )
  }

  try {
    const credential = await issueCredential({
      credentialId: String(input.credentialId).trim(),
      recipientName: String(input.recipientName).trim(),
      recipientEmail: typeof input.recipientEmail === 'string' ? input.recipientEmail.trim() : undefined,
      studentReference: typeof input.studentReference === 'string' ? input.studentReference.trim() : undefined,
      programme: String(input.programme).trim(),
      programmeCode: typeof input.programmeCode === 'string' ? input.programmeCode.trim() : undefined,
      credentialType: typeof input.credentialType === 'string' ? input.credentialType as any : undefined,
      awardTitle: typeof input.awardTitle === 'string' ? input.awardTitle.trim() : undefined,
      classification: typeof input.classification === 'string' ? input.classification.trim() : undefined,
      graduationDate: typeof input.graduationDate === 'string' ? input.graduationDate : undefined,
      certificateNumber: typeof input.certificateNumber === 'string' ? input.certificateNumber.trim() : undefined,
      organizationId: String(input.organizationId).trim(),
      issuedAt: typeof input.issuedAt === 'string' ? input.issuedAt : undefined,
      idempotencyKey: request.headers.get('Idempotency-Key') || undefined,
    } as IssueCredentialInput)

    await createAuditLog({
      user_id: user.id,
      organization_id: String(input.organizationId).trim(),
      action: 'credential.issued',
      resource_type: 'credential',
      resource_id: credential.credential_id,
    })

    return NextResponse.json({ credential }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Credential issuance could not be completed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
