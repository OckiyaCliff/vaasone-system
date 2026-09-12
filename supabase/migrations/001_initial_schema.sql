-- ════════════════════════════════════════════════════════════
-- Vaasone — Initial database schema
-- Blockchain-Based Academic Credential Verification-as-a-Service
-- ════════════════════════════════════════════════════════════

-- ── Organizations (Tenant table) ────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'university'
    CHECK (type IN ('university', 'employer', 'government', 'professional_body')),
  country TEXT,
  website TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_type ON organizations(type);

-- ── Institution Users (links auth.users → organization) ─────
CREATE TABLE IF NOT EXISTS institution_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'operator'
    CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_institution_users_user ON institution_users(user_id);
CREATE INDEX idx_institution_users_org ON institution_users(organization_id);

-- ── Credentials (Canonical credential model) ────────────────
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id TEXT UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  student_reference TEXT,
  credential_type TEXT NOT NULL DEFAULT 'degree'
    CHECK (credential_type IN ('degree', 'diploma', 'certificate', 'professional')),
  programme TEXT NOT NULL,
  programme_code TEXT,
  award_title TEXT,
  classification TEXT,
  graduation_date DATE,
  certificate_number TEXT,
  issue_date DATE DEFAULT CURRENT_DATE,
  credential_version INT DEFAULT 1,
  document_hash TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'validated', 'issued', 'active', 'suspended', 'revoked', 'superseded')),
  issuer_user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_credentials_org ON credentials(organization_id);
CREATE INDEX idx_credentials_status ON credentials(status);
CREATE INDEX idx_credentials_recipient ON credentials(recipient_name);
CREATE INDEX idx_credentials_cert_number ON credentials(certificate_number);
CREATE INDEX idx_credentials_issued ON credentials(issue_date DESC);

-- ── Credential Versions (audit trail for updates) ───────────
CREATE TABLE IF NOT EXISTS credential_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  document_hash TEXT,
  status TEXT NOT NULL,
  changes JSONB DEFAULT '{}',
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_credential_versions_cred ON credential_versions(credential_id);

-- ── Blockchain Anchors ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS blockchain_anchors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'stellar'
    CHECK (provider IN ('stellar', 'bnb')),
  transaction_id TEXT,
  ledger TEXT,
  anchor_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('not_requested', 'pending', 'submitted', 'confirming', 'confirmed', 'failed', 'retrying')),
  network TEXT NOT NULL DEFAULT 'testnet',
  submitted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_anchors_credential ON blockchain_anchors(credential_id);
CREATE INDEX idx_anchors_status ON blockchain_anchors(status);
CREATE INDEX idx_anchors_tx ON blockchain_anchors(transaction_id);

-- ── Verification Requests ───────────────────────────────────
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID REFERENCES credentials(id),
  lookup_value TEXT NOT NULL,
  lookup_type TEXT NOT NULL DEFAULT 'credential_id'
    CHECK (lookup_type IN ('credential_id', 'certificate_number', 'qr_code', 'api', 'blockchain_tx')),
  result TEXT NOT NULL
    CHECK (result IN ('valid', 'revoked', 'superseded', 'altered', 'unknown')),
  verifier_ip TEXT,
  verifier_user_agent TEXT,
  organization_id UUID REFERENCES organizations(id),
  response_time_ms INT,
  blockchain_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_verifications_credential ON verification_requests(credential_id);
CREATE INDEX idx_verifications_created ON verification_requests(created_at DESC);
CREATE INDEX idx_verifications_result ON verification_requests(result);

-- ── Integration Connections ─────────────────────────────────
CREATE TABLE IF NOT EXISTS integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  adapter_type TEXT NOT NULL
    CHECK (adapter_type IN ('rest', 'soap', 'database', 'csv', 'json', 'xml')),
  config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'testing', 'connected', 'error', 'disconnected')),
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,
  records_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_integrations_org ON integration_connections(organization_id);

-- ── Integration Sync Jobs ───────────────────────────────────
CREATE TABLE IF NOT EXISTS integration_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  total_records INT DEFAULT 0,
  processed_records INT DEFAULT 0,
  new_records INT DEFAULT 0,
  updated_records INT DEFAULT 0,
  error_records INT DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sync_jobs_connection ON integration_sync_jobs(connection_id);

-- ── API Clients ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_id TEXT UNIQUE NOT NULL,
  api_key_hash TEXT NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['verify'],
  rate_limit INT DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Activity Events (user-facing feed) ──────────────────────
CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('issued', 'verified', 'synced', 'revoked', 'anchored', 'registered')),
  label TEXT NOT NULL,
  subject TEXT,
  credential_id UUID REFERENCES credentials(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_org ON activity_events(organization_id);
CREATE INDEX idx_activity_created ON activity_events(created_at DESC);
CREATE INDEX idx_activity_type ON activity_events(event_type);

-- ── Audit Logs (append-only system audit) ───────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- ═══════════════════════════════════════════════════════════
-- Row Level Security Policies
-- ═══════════════════════════════════════════════════════════

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user belongs to an organization
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM institution_users WHERE user_id = auth.uid()
$$;

-- Organizations: users see their own orgs
CREATE POLICY "Users see their organizations"
  ON organizations FOR SELECT
  USING (id IN (SELECT user_org_ids()));

CREATE POLICY "Service role full access to organizations"
  ON organizations FOR ALL
  USING (auth.role() = 'service_role');

-- Institution Users: users see co-members
CREATE POLICY "Users see their org members"
  ON institution_users FOR SELECT
  USING (organization_id IN (SELECT user_org_ids()));

CREATE POLICY "Admins manage org members"
  ON institution_users FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM institution_users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Credentials: org-scoped
CREATE POLICY "Users see their org credentials"
  ON credentials FOR SELECT
  USING (organization_id IN (SELECT user_org_ids()));

CREATE POLICY "Users insert credentials for their org"
  ON credentials FOR INSERT
  WITH CHECK (organization_id IN (SELECT user_org_ids()));

CREATE POLICY "Users update credentials for their org"
  ON credentials FOR UPDATE
  USING (organization_id IN (SELECT user_org_ids()));

CREATE POLICY "Service role full access to credentials"
  ON credentials FOR ALL
  USING (auth.role() = 'service_role');

-- Blockchain Anchors: follow credential access
CREATE POLICY "Users see anchors for their credentials"
  ON blockchain_anchors FOR SELECT
  USING (
    credential_id IN (
      SELECT id FROM credentials WHERE organization_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY "Service role full access to anchors"
  ON blockchain_anchors FOR ALL
  USING (auth.role() = 'service_role');

-- Verification Requests: public insert, org-scoped read
CREATE POLICY "Anyone can create verification requests"
  ON verification_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users see verifications for their org"
  ON verification_requests FOR SELECT
  USING (
    credential_id IN (
      SELECT id FROM credentials WHERE organization_id IN (SELECT user_org_ids())
    )
    OR organization_id IN (SELECT user_org_ids())
  );

CREATE POLICY "Service role full access to verifications"
  ON verification_requests FOR ALL
  USING (auth.role() = 'service_role');

-- Integration Connections: org-scoped
CREATE POLICY "Users see their org integrations"
  ON integration_connections FOR SELECT
  USING (organization_id IN (SELECT user_org_ids()));

CREATE POLICY "Users manage their org integrations"
  ON integration_connections FOR ALL
  USING (organization_id IN (SELECT user_org_ids()));

-- Sync Jobs: org-scoped
CREATE POLICY "Users see their org sync jobs"
  ON integration_sync_jobs FOR SELECT
  USING (organization_id IN (SELECT user_org_ids()));

CREATE POLICY "Service role full access to sync jobs"
  ON integration_sync_jobs FOR ALL
  USING (auth.role() = 'service_role');

-- API Clients: org-scoped
CREATE POLICY "Users manage their org API clients"
  ON api_clients FOR ALL
  USING (organization_id IN (SELECT user_org_ids()));

-- Activity Events: org-scoped
CREATE POLICY "Users see their org activity"
  ON activity_events FOR SELECT
  USING (organization_id IN (SELECT user_org_ids()) OR organization_id IS NULL);

CREATE POLICY "Service role full access to activity"
  ON activity_events FOR ALL
  USING (auth.role() = 'service_role');

-- Audit Logs: org-scoped read, service write
CREATE POLICY "Users see their org audit logs"
  ON audit_logs FOR SELECT
  USING (organization_id IN (SELECT user_org_ids()));

CREATE POLICY "Service role full access to audit logs"
  ON audit_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Credential Versions: follow credential access
CREATE POLICY "Users see versions for their credentials"
  ON credential_versions FOR SELECT
  USING (
    credential_id IN (
      SELECT id FROM credentials WHERE organization_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY "Service role full access to versions"
  ON credential_versions FOR ALL
  USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════
-- Updated-at trigger
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON blockchain_anchors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON integration_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON api_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
