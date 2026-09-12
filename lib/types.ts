/* ──────────────────────────────────────────────────────────
   Vaasone — Centralized type definitions
   Maps to the canonical credential model defined in the PRD.
   ────────────────────────────────────────────────────────── */

// ── User & Roles ─────────────────────────────────────────

export type UserRole =
  | 'system_admin'
  | 'institution_admin'
  | 'institution_operator'
  | 'verifier'
  | 'student'
  | 'api_client'

export type Organization = {
  id: string
  name: string
  slug: string
  type: OrganizationType
  country: string | null
  website: string | null
  logo_url: string | null
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type OrganizationType = 'university' | 'employer' | 'government' | 'professional_body'

export type InstitutionUser = {
  id: string
  user_id: string
  organization_id: string
  role: 'admin' | 'operator' | 'viewer'
  created_at: string
}

// ── Credential (Canonical Model) ────────────────────────

export type CredentialStatus =
  | 'draft'
  | 'validated'
  | 'issued'
  | 'active'
  | 'suspended'
  | 'revoked'
  | 'superseded'

export type CredentialType = 'degree' | 'diploma' | 'certificate' | 'professional'

export type Credential = {
  id: string
  credential_id: string
  organization_id: string
  recipient_name: string
  recipient_email: string | null
  student_reference: string | null
  credential_type: CredentialType
  programme: string
  programme_code: string | null
  award_title: string | null
  classification: string | null
  graduation_date: string | null
  certificate_number: string | null
  issue_date: string
  credential_version: number
  document_hash: string | null
  status: CredentialStatus
  issuer_user_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type CredentialWithOrg = Credential & {
  organizations: Pick<Organization, 'name' | 'country'> | null
}

// ── Blockchain ──────────────────────────────────────────

export type BlockchainNetwork = 'stellar' | 'bnb'

export type AnchorStatus =
  | 'not_requested'
  | 'pending'
  | 'submitted'
  | 'confirming'
  | 'confirmed'
  | 'failed'
  | 'retrying'

export type BlockchainAnchor = {
  id: string
  credential_id: string
  provider: BlockchainNetwork
  transaction_id: string | null
  ledger: string | null
  anchor_hash: string
  status: AnchorStatus
  network: string
  submitted_at: string | null
  confirmed_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export type AnchorRequest = {
  credentialId: string
  digest: string
  provider?: BlockchainNetwork
}

export type AnchorResult = {
  transactionId: string
  ledger: string | null
  network: string
  status: 'submitted' | 'confirmed' | 'failed'
  error?: string
}

export type AnchorVerification = {
  valid: boolean
  network: string
  ledger: string | null
  timestamp: string | null
  transactionId: string
}

// ── Verification ────────────────────────────────────────

export type VerificationOutcome = 'valid' | 'revoked' | 'superseded' | 'altered' | 'unknown'

export type VerificationLookupType =
  | 'credential_id'
  | 'certificate_number'
  | 'qr_code'
  | 'api'
  | 'blockchain_tx'

export type VerificationRequest = {
  id: string
  credential_id: string | null
  lookup_value: string
  lookup_type: VerificationLookupType
  result: VerificationOutcome
  verifier_ip: string | null
  verifier_user_agent: string | null
  organization_id: string | null
  response_time_ms: number | null
  blockchain_verified: boolean
  created_at: string
}

export type VerificationResult = {
  outcome: VerificationOutcome
  credential?: {
    credential_id: string
    recipient_name: string
    programme: string
    credential_type: CredentialType
    issue_date: string
    status: CredentialStatus
    institution: string
    country: string | null
  }
  anchor?: {
    network: string
    transaction_id: string | null
    ledger: string | null
    confirmed_at: string | null
  }
  verified_at: string
}

// ── Integration / Interoperability ──────────────────────

export type AdapterType = 'rest' | 'soap' | 'database' | 'csv' | 'json' | 'xml'

export type IntegrationStatus = 'pending' | 'testing' | 'connected' | 'error' | 'disconnected'

export type IntegrationConnection = {
  id: string
  organization_id: string
  name: string
  adapter_type: AdapterType
  config: Record<string, unknown>
  status: IntegrationStatus
  last_sync_at: string | null
  last_sync_status: string | null
  created_at: string
  updated_at: string
}

export type SyncJobStatus = 'queued' | 'running' | 'completed' | 'failed'

export type IntegrationSyncJob = {
  id: string
  connection_id: string
  organization_id: string
  status: SyncJobStatus
  total_records: number
  processed_records: number
  new_records: number
  updated_records: number
  error_records: number
  error_log: unknown[]
  started_at: string | null
  completed_at: string | null
  created_at: string
}

// ── Activity & Audit ────────────────────────────────────

export type ActivityKind = 'issued' | 'verified' | 'synced' | 'revoked' | 'anchored' | 'registered'

export type ActivityEvent = {
  id: string
  organization_id: string | null
  event_type: ActivityKind
  label: string
  subject: string | null
  credential_id: string | null
  user_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type AuditLog = {
  id: string
  user_id: string | null
  organization_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// ── API ─────────────────────────────────────────────────

export type ApiClient = {
  id: string
  organization_id: string
  name: string
  client_id: string
  api_key_hash: string
  permissions: string[]
  rate_limit: number
  is_active: boolean
  last_used_at: string | null
  created_at: string
  updated_at: string
}

// ── Credential Issuance Input ───────────────────────────

export type IssueCredentialInput = {
  credentialId: string
  recipientName: string
  recipientEmail?: string
  studentReference?: string
  programme: string
  programmeCode?: string
  credentialType?: CredentialType
  awardTitle?: string
  classification?: string
  graduationDate?: string
  certificateNumber?: string
  organizationId: string
  issuedAt?: string
  idempotencyKey?: string
}

// ── Canonical Credential (from SIS adapters) ────────────

export type CanonicalCredential = {
  student_reference: string
  recipient_name: string
  recipient_email?: string
  credential_type: CredentialType
  programme: string
  programme_code?: string
  award_title?: string
  classification?: string
  graduation_date?: string
  certificate_number?: string
  issue_date: string
  metadata?: Record<string, unknown>
}

// ── Blockchain Provider Interface ───────────────────────

export interface BlockchainProvider {
  readonly network: BlockchainNetwork
  anchorCredential(request: AnchorRequest): Promise<AnchorResult>
  anchorBatch(requests: AnchorRequest[]): Promise<AnchorResult>
  verifyAnchor(transactionId: string): Promise<AnchorVerification>
  revokeCredential(request: AnchorRequest): Promise<AnchorResult>
}

// ── SIS Adapter Interface ───────────────────────────────

export type ConnectionConfig = {
  type: AdapterType
  endpoint?: string
  database_url?: string
  api_key?: string
  username?: string
  password?: string
  file_url?: string
  headers?: Record<string, string>
  options?: Record<string, unknown>
}

export type ConnectionTestResult = {
  success: boolean
  message: string
  records_found?: number
  sample?: CanonicalCredential[]
}

export interface SISAdapter {
  readonly adapterType: AdapterType
  connect(config: ConnectionConfig): Promise<void>
  testConnection(): Promise<ConnectionTestResult>
  fetchCredentials(): Promise<CanonicalCredential[]>
  disconnect(): Promise<void>
}
