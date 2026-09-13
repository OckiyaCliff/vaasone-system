import { NextResponse } from 'next/server'
import { verifyCredential, verifyCredentialByHash } from '@/lib/credential-service'
import { createVerificationRequest } from '@/lib/vaas-repository'
import { checkRateLimit, getClientIdentifier, applyRateLimitHeaders } from '@/lib/rate-limit'
import { RATE_LIMITS } from '@/lib/constants'

/**
 * GET /api/v1/verify?id=VAAS-UNILAG-2026-001
 * GET /api/v1/verify?hash=0x...
 * Public credential verification endpoint. No auth required. Rate limited.
 */
export async function GET(request: Request) {
  const ip = getClientIdentifier(request)
  const rl = checkRateLimit(`verify:${ip}`, RATE_LIMITS.publicVerify)
  if (!rl.allowed) {
    return applyRateLimitHeaders(
      NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 }),
      rl
    )
  }

  const url = new URL(request.url)
  const credentialId = url.searchParams.get('id')?.trim()
  const documentHash = url.searchParams.get('hash')?.trim()

  if (!credentialId && !documentHash) {
    return NextResponse.json(
      { error: 'A valid credential ID (?id=) or document hash (?hash=) is required.' },
      { status: 400 }
    )
  }

  const lookupValue = credentialId || documentHash!
  const lookupType = credentialId ? 'credential_id' : 'api'

  const startTime = Date.now()

  try {
    const result = credentialId
      ? await verifyCredential(credentialId)
      : await verifyCredentialByHash(documentHash!)

    /* Log the verification request */
    try {
      await createVerificationRequest({
        lookup_value: lookupValue,
        lookup_type: lookupType,
        result: result.outcome,
        verifier_ip: ip,
        verifier_user_agent: request.headers.get('user-agent') ?? undefined,
        response_time_ms: Date.now() - startTime,
        blockchain_verified: !!result.anchor,
      })
    } catch {
      /* Logging failure should not break verification */
    }

    const status = result.outcome === 'unknown' ? 404 : 200
    const response = NextResponse.json(result, { status })
    return applyRateLimitHeaders(response, rl)
  } catch {
    return NextResponse.json(
      { error: 'Credential verification is temporarily unavailable.' },
      { status: 503 }
    )
  }
}
