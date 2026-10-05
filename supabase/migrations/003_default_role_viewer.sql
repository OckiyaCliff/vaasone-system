/* ============================================================
   Vaasone — Migration 003: Default New User Role to Viewer
   ============================================================ */

-- Alter column default for institution_users role to viewer
ALTER TABLE institution_users 
ALTER COLUMN role SET DEFAULT 'viewer';
