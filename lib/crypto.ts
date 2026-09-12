/* ──────────────────────────────────────────────────────────
   Vaasone — Cryptographic integrity utilities
   Handles credential canonicalization, hashing, and
   hash comparison for tamper detection.
   ────────────────────────────────────────────────────────── */

import { createHash } from 'node:crypto'

/**
 * Deterministic JSON canonicalization.
 * Sorts keys at every depth so the same credential always
 * produces the same hash regardless of property order.
 */
export function canonicalize(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, Object.keys(obj).sort())
}

/**
 * Generate a SHA-256 digest of a credential payload.
 * Returns a hex-encoded string prefixed with `sha256:`.
 */
export function hashCredential(payload: Record<string, unknown>): string {
  const canonical = canonicalize(payload)
  const hash = createHash('sha256').update(canonical).digest('hex')
  return `sha256:${hash}`
}

/**
 * Generate a raw SHA-256 hex digest (no prefix).
 * Used when the full 64-char hex is needed for blockchain operations.
 */
export function sha256Hex(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

/**
 * Generate a SHA-256 Buffer (32 bytes).
 * Used for Stellar memo hash operations.
 */
export function sha256Buffer(data: string): Buffer {
  return createHash('sha256').update(data).digest()
}

/**
 * Compare a presented credential's hash against the stored hash.
 * Returns true if they match (credential is unaltered).
 */
export function verifyHash(storedHash: string, presentedPayload: Record<string, unknown>): boolean {
  const computedHash = hashCredential(presentedPayload)
  return storedHash === computedHash
}

/**
 * Build the canonical payload from credential fields.
 * Only includes the fields that contribute to the integrity hash.
 */
export function buildHashPayload(credential: {
  credential_id: string
  recipient_name: string
  programme: string
  credential_type?: string
  issue_date: string
  organization_id: string
  certificate_number?: string | null
  graduation_date?: string | null
  classification?: string | null
}): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    credential_id: credential.credential_id,
    recipient_name: credential.recipient_name,
    programme: credential.programme,
    credential_type: credential.credential_type || 'degree',
    issue_date: credential.issue_date,
    organization_id: credential.organization_id,
  }

  if (credential.certificate_number) payload.certificate_number = credential.certificate_number
  if (credential.graduation_date) payload.graduation_date = credential.graduation_date
  if (credential.classification) payload.classification = credential.classification

  return payload
}

/**
 * Build a Merkle tree root from an array of hashes.
 * Used for batch anchoring multiple credentials in a single transaction.
 */
export function merkleRoot(hashes: string[]): string {
  if (hashes.length === 0) throw new Error('Cannot compute Merkle root of empty array')
  if (hashes.length === 1) return hashes[0]

  /* Strip any `sha256:` prefix for uniform processing */
  let layer = hashes.map((h) => h.replace(/^sha256:/, ''))

  while (layer.length > 1) {
    const next: string[] = []
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i]
      const right = layer[i + 1] ?? left /* Duplicate last if odd count */
      next.push(createHash('sha256').update(left + right).digest('hex'))
    }
    layer = next
  }

  return `sha256:${layer[0]}`
}
