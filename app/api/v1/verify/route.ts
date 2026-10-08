import { NextResponse } from 'next/server'
import { verifyCredential, verifyCredentialByHash, verifyCertificatesBySearch } from '@/lib/credential-service'
import { createVerificationRequest } from '@/lib/vaas-repository'
import { checkRateLimit, getClientIdentifier, applyRateLimitHeaders } from '@/lib/rate-limit'
import { RATE_LIMITS } from '@/lib/constants'

/**
 * GET /api/v1/verify
 * Parameters:
 *  - ?id=VAAS-UNILAG-2026-001 (Direct certificate ID)
 *  - ?hash=0x... (Cryptographic document SHA-256 hash)
 *  - ?org=unilag & year=2026 & matric=UNILAG/2022/CSC/089 (Multi-criteria search)
 *  - ?mode=employer (Enables authorized employer search for accredited institutions)
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
  const certificateId = (url.searchParams.get('id') || url.searchParams.get('certificate_id'))?.trim()
  const documentHash = url.searchParams.get('hash')?.trim()

  const org = (url.searchParams.get('org') || url.searchParams.get('institution') || url.searchParams.get('institution_id'))?.trim()
  const graduationYear = url.searchParams.get('year')?.trim()
  const studentReference = (url.searchParams.get('matric') || url.searchParams.get('student_id') || url.searchParams.get('student_reference'))?.trim()
  const certificateNumber = (url.searchParams.get('cert_no') || url.searchParams.get('certificate_number'))?.trim()
  const candidateName = (url.searchParams.get('name') || url.searchParams.get('recipient_name'))?.trim()
  const mode = url.searchParams.get('mode')?.trim() || 'public'
  const isEmployer = mode === 'employer'

  // If direct ID or hash is provided
  if (certificateId || documentHash) {
    const lookupValue = certificateId || documentHash!
    const lookupType = certificateId ? 'credential_id' : 'api'
    const startTime = Date.now()

    try {
      const result = certificateId
        ? await verifyCredential(certificateId)
        : await verifyCredentialByHash(documentHash!)

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
        { error: 'Certificate verification is temporarily unavailable.' },
        { status: 503 }
      )
    }
  }

  // Multi-criteria search
  const hasSearchFields = Boolean(org || graduationYear || studentReference || certificateNumber || candidateName)
  if (!hasSearchFields) {
    return NextResponse.json(
      { error: 'A valid Certificate ID (?id=), hash (?hash=), or search parameters (?org=&matric=) is required.' },
      { status: 400 }
    )
  }

  const startTime = Date.now()
  try {
    const result = await verifyCertificatesBySearch(
      {
        institutionSlug: org && !org.includes('-') && org.length < 30 ? org : undefined,
        institutionId: org && org.length > 30 ? org : undefined,
        graduationYear: graduationYear || undefined,
        studentReference: studentReference || undefined,
        certificateNumber: certificateNumber || undefined,
        candidateName: candidateName || undefined,
      },
      isEmployer
    )

    if (result.policy_restricted) {
      return NextResponse.json(result, { status: 400 })
    }

    try {
      await createVerificationRequest({
        lookup_value: `search:${org || '*'}:${graduationYear || '*'}:${studentReference || candidateName || '*'}`,
        lookup_type: 'api',
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
      { error: 'Certificate search and verification is temporarily unavailable.' },
      { status: 503 }
    )
  }
}

/**
 * POST /api/v1/verify
 * Accepts structured search payload for public or employer verification.
 */
export async function POST(request: Request) {
  const ip = getClientIdentifier(request)
  const rl = checkRateLimit(`verify:${ip}`, RATE_LIMITS.publicVerify)
  if (!rl.allowed) {
    return applyRateLimitHeaders(
      NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 }),
      rl
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const {
      id,
      hash,
      institutionId,
      institutionSlug,
      graduationYear,
      matriculationNo,
      certificateNumber,
      candidateName,
      mode = 'public',
    } = body

    const isEmployer = mode === 'employer'

    if (id || hash) {
      const result = id ? await verifyCredential(id) : await verifyCredentialByHash(hash)
      const status = result.outcome === 'unknown' ? 404 : 200
      return applyRateLimitHeaders(NextResponse.json(result, { status }), rl)
    }

    const result = await verifyCertificatesBySearch(
      {
        institutionId: institutionId || undefined,
        institutionSlug: institutionSlug || undefined,
        graduationYear: graduationYear || undefined,
        studentReference: matriculationNo || undefined,
        certificateNumber: certificateNumber || undefined,
        candidateName: candidateName || undefined,
      },
      isEmployer
    )

    const status = result.policy_restricted ? 400 : result.outcome === 'unknown' ? 404 : 200
    return applyRateLimitHeaders(NextResponse.json(result, { status }), rl)
  } catch {
    return NextResponse.json(
      { error: 'Failed to process certificate verification request.' },
      { status: 500 }
    )
  }
}
