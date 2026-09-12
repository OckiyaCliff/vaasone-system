import { NextResponse } from 'next/server'
import { findCredentialByPublicId } from '@/lib/vaas-repository'

export async function GET(request: Request) {
  const credentialId = new URL(request.url).searchParams.get('id')?.trim()

  if (!credentialId || credentialId.length > 80) {
    return NextResponse.json({ error: 'A valid credential ID is required.' }, { status: 400 })
  }

  try {
    const credential = await findCredentialByPublicId(credentialId)
    if (!credential || credential.status !== 'verified') {
      return NextResponse.json({ verified: false }, { status: 404 })
    }
    return NextResponse.json({ verified: true, credential })
  } catch {
    return NextResponse.json({ error: 'Credential verification is temporarily unavailable.' }, { status: 503 })
  }
}
