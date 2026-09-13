/* ============================================================
   Vaasone — Migration 002: Institution Verification
   ============================================================ */

-- 1. Add is_verified column if not present
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Mark existing accredited universities as verified
UPDATE organizations 
SET is_verified = true 
WHERE is_verified IS FALSE OR is_verified IS NULL;

-- 3. Add index on is_verified for high performance filtering
CREATE INDEX IF NOT EXISTS idx_organizations_verified ON organizations(is_verified);
