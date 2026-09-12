import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { issueCredential } from '@/lib/credential-service'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const input = body as Record<string, unknown>
  const required = ['credentialId', 'recipientName', 'program', 'institutionId']
  if (required.some((key) => typeof input[key] !== 'string' || !String(input[key]).trim())) {
    return NextResponse.json({ error: 'credentialId, recipientName, program, and institutionId are required' }, { status: 400 })
  }

  try {
    const credential = await issueCredential({
      credentialId: String(input.credentialId).trim(),
      recipientName: String(input.recipientName).trim(),
      recipientEmail: typeof input.recipientEmail === 'string' ? input.recipientEmail.trim() : undefined,
      programme: String(input.program ?? input.programme ?? '').trim(),
      organizationId: String(input.institutionId ?? input.organizationId ?? '').trim(),
      issuedAt: typeof input.issuedAt === 'string' ? input.issuedAt : undefined,
      idempotencyKey: request.headers.get('Idempotency-Key') || undefined,
    })
    return NextResponse.json(credential, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Credential issuance could not be completed' }, { status: 500 })
  }
}
