/* ──────────────────────────────────────────────────────────
   Vaasone — Application constants
   ────────────────────────────────────────────────────────── */

export const APP_NAME = 'Vaasone' as const
export const APP_DOMAIN = 'vaasone' as const

// ── Credential lifecycle states ─────────────────────────
export const CREDENTIAL_STATUSES = [
  'draft',
  'validated',
  'issued',
  'active',
  'suspended',
  'revoked',
  'superseded',
] as const

export const CREDENTIAL_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  validated: 'Validated',
  issued: 'Issued',
  active: 'Active',
  suspended: 'Suspended',
  revoked: 'Revoked',
  superseded: 'Superseded',
}

// ── Blockchain anchor states ────────────────────────────
export const ANCHOR_STATUSES = [
  'not_requested',
  'pending',
  'submitted',
  'confirming',
  'confirmed',
  'failed',
  'retrying',
] as const

export const ANCHOR_STATUS_LABELS: Record<string, string> = {
  not_requested: 'Not Requested',
  pending: 'Pending',
  submitted: 'Submitted',
  confirming: 'Confirming',
  confirmed: 'Confirmed',
  failed: 'Failed',
  retrying: 'Retrying',
}

// ── Verification outcomes ───────────────────────────────
export const VERIFICATION_OUTCOMES = [
  'valid',
  'revoked',
  'superseded',
  'altered',
  'unknown',
] as const

export const VERIFICATION_LABELS: Record<string, string> = {
  valid: 'Valid',
  revoked: 'Revoked',
  superseded: 'Superseded',
  altered: 'Altered',
  unknown: 'Unknown',
}

// ── User roles ──────────────────────────────────────────
export const USER_ROLES = [
  'system_admin',
  'institution_admin',
  'institution_operator',
  'verifier',
  'student',
  'api_client',
] as const

export const ROLE_LABELS: Record<string, string> = {
  system_admin: 'System Administrator',
  institution_admin: 'Institution Administrator',
  institution_operator: 'Institution Operator',
  verifier: 'Verifier',
  student: 'Student',
  api_client: 'API Client',
}

// ── Adapter types ───────────────────────────────────────
export const ADAPTER_TYPES = [
  'rest',
  'soap',
  'database',
  'csv',
  'json',
  'xml',
] as const

export const ADAPTER_LABELS: Record<string, string> = {
  rest: 'REST API',
  soap: 'SOAP / XML',
  database: 'Direct Database',
  csv: 'CSV Import',
  json: 'JSON Import',
  xml: 'XML Import',
}

// ── Credential types ────────────────────────────────────
export const CREDENTIAL_TYPES = [
  'degree',
  'diploma',
  'certificate',
  'professional',
] as const

export const CREDENTIAL_TYPE_LABELS: Record<string, string> = {
  degree: 'Degree',
  diploma: 'Diploma',
  certificate: 'Certificate',
  professional: 'Professional Certification',
}

// ── Blockchain networks ─────────────────────────────────
export const BLOCKCHAIN_NETWORKS = ['stellar', 'bnb'] as const

export const NETWORK_LABELS: Record<string, string> = {
  stellar: 'Stellar Network',
  bnb: 'BNB Smart Chain',
}

// ── Activity event tones ────────────────────────────────
export function getActivityTone(kind: string): 'accent' | 'muted' | 'success' {
  if (kind === 'revoked') return 'accent'
  if (kind === 'synced' || kind === 'anchored') return 'muted'
  return 'success'
}

// ── Public routes (no auth required) ────────────────────
export const PUBLIC_ROUTES = [
  '/auth',
  '/v',
  '/api/v1/verify',
  '/api/v1/demo',
]

// ── Rate limits ─────────────────────────────────────────
export const RATE_LIMITS = {
  publicVerify: { windowMs: 60_000, maxRequests: 60 },
  apiVerify: { windowMs: 60_000, maxRequests: 100 },
  issueCredential: { windowMs: 60_000, maxRequests: 30 },
} as const
