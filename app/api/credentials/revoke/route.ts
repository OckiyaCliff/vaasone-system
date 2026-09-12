import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revokeCredential } from '@/lib/credential-service'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const credentialId = body && typeof body === 'object' && 'credentialId' in body ? String(body.credentialId).trim() : ''
  if (!credentialId) return NextResponse.json({ error: 'credentialId is required' }, { status: 400 })

  try {
    return NextResponse.json(await revokeCredential(credentialId))
  } catch {
    return NextResponse.json({ error: 'Credential revocation could not be completed' }, { status: 500 })
  }
}
