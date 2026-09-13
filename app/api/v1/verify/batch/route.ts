import { NextResponse } from 'next/server'
import { verifyCredential, verifyCredentialByHash } from '@/lib/credential-service'
import { checkRateLimit, getClientIdentifier, applyRateLimitHeaders } from '@/lib/rate-limit'
import { RATE_LIMITS } from '@/lib/constants'

/**
 * POST /api/v1/verify/batch
 * Batch credential verification endpoint. Publicly accessible with rate limiting.
 * Accepts: { "ids": ["VAAS-001", "VAAS-002"], "hashes": ["0x..."] } (Max 25 items)
 */
export async function POST(request: Request) {
  const ip = getClientIdentifier(request)
  const rl = checkRateLimit(`verify:batch:${ip}`, { maxRequests: 20, windowMs: 60 * 1000 })
  if (!rl.allowed) {
    return applyRateLimitHeaders(
      NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 }),
      rl
    )
  }

  let body: { ids?: string[]; hashes?: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const ids = Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === 'string' && id.trim()) : []
  const hashes = Array.isArray(body.hashes) ? body.hashes.filter((h) => typeof h === 'string' && h.trim()) : []

  const totalLookups = ids.length + hashes.length

  if (totalLookups === 0) {
    return NextResponse.json(
      { error: 'Provide at least one credential ID in "ids" array or document hash in "hashes" array.' },
      { status: 400 }
    )
  }

  if (totalLookups > 25) {
    return NextResponse.json(
      { error: 'Batch verification limit exceeded. Maximum 25 items per request.' },
      { status: 400 }
    )
  }

  try {
    const idPromises = ids.map(async (id) => {
      const res = await verifyCredential(id.trim())
      return { query: id, query_type: 'id', ...res }
    })

    const hashPromises = hashes.map(async (hash) => {
      const res = await verifyCredentialByHash(hash.trim())
      return { query: hash, query_type: 'hash', ...res }
    })

    const results = await Promise.all([...idPromises, ...hashPromises])
    const validCount = results.filter((r) => r.outcome === 'valid').length

    const response = NextResponse.json({
      total: results.length,
      valid_count: validCount,
      results,
      verified_at: new Date().toISOString(),
    })

    return applyRateLimitHeaders(response, rl)
  } catch (error) {
    return NextResponse.json(
      { error: 'Batch verification service encountered an unexpected error.' },
      { status: 500 }
    )
  }
}
