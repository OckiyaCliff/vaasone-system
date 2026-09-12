/* ──────────────────────────────────────────────────────────
   Vaasone — Record Normalizer
   Transforms heterogeneous SIS source records into the
   canonical credential model regardless of origin format.
   ────────────────────────────────────────────────────────── */

import type { CanonicalCredential, CredentialType } from '@/lib/types'

/**
 * Normalize a raw record from any source into the canonical model.
 * Handles various field naming conventions across different SIS.
 */
export function normalizeRecord(raw: Record<string, unknown>): CanonicalCredential {
  return {
    student_reference: getString(raw, ['student_id', 'studentId', 'student_reference', 'matric_no', 'matricNo', 'reg_number', 'id']),
    recipient_name: getString(raw, ['student_name', 'studentName', 'recipient_name', 'recipientName', 'name', 'full_name', 'fullName']),
    recipient_email: getOptionalString(raw, ['email', 'student_email', 'studentEmail', 'recipient_email']),
    credential_type: normalizeCredentialType(raw),
    programme: getString(raw, ['programme', 'program', 'course', 'degree', 'course_title', 'courseTitle', 'degree_title']),
    programme_code: getOptionalString(raw, ['programme_code', 'programCode', 'course_code', 'courseCode']),
    award_title: getOptionalString(raw, ['award_title', 'awardTitle', 'award', 'degree_type', 'degreeType']),
    classification: getOptionalString(raw, ['classification', 'class', 'grade', 'honours', 'honors', 'cgpa', 'gpa']),
    graduation_date: getOptionalString(raw, ['graduation_date', 'graduationDate', 'grad_date', 'completion_date', 'completionDate']),
    certificate_number: getOptionalString(raw, ['certificate_number', 'certificateNumber', 'cert_no', 'certNo']),
    issue_date: getString(raw, ['issue_date', 'issueDate', 'issued_date', 'issuedDate', 'date_issued', 'dateIssued', 'date'], new Date().toISOString().slice(0, 10)),
    metadata: extractMetadata(raw),
  }
}

/**
 * Normalize an array of raw records.
 */
export function normalizeRecords(raws: Record<string, unknown>[]): CanonicalCredential[] {
  return raws.map(normalizeRecord)
}

/**
 * Validate a normalized credential has minimum required fields.
 */
export function validateCanonical(cred: CanonicalCredential): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!cred.student_reference) errors.push('Missing student reference')
  if (!cred.recipient_name) errors.push('Missing recipient name')
  if (!cred.programme) errors.push('Missing programme')
  if (!cred.issue_date) errors.push('Missing issue date')
  return { valid: errors.length === 0, errors }
}

// ── Helpers ─────────────────────────────────────────────

function getString(obj: Record<string, unknown>, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const val = obj[key]
    if (typeof val === 'string' && val.trim()) return val.trim()
  }
  return fallback
}

function getOptionalString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  const val = getString(obj, keys)
  return val || undefined
}

function normalizeCredentialType(raw: Record<string, unknown>): CredentialType {
  const val = getString(raw, ['credential_type', 'credentialType', 'type', 'award_type', 'awardType']).toLowerCase()
  if (val.includes('diploma')) return 'diploma'
  if (val.includes('certificate') || val.includes('cert')) return 'certificate'
  if (val.includes('professional') || val.includes('prof')) return 'professional'
  return 'degree'
}

function extractMetadata(raw: Record<string, unknown>): Record<string, unknown> {
  const known = new Set([
    'student_id', 'studentId', 'student_reference', 'matric_no', 'matricNo', 'reg_number', 'id',
    'student_name', 'studentName', 'recipient_name', 'recipientName', 'name', 'full_name', 'fullName',
    'email', 'student_email', 'studentEmail', 'recipient_email',
    'credential_type', 'credentialType', 'type', 'award_type', 'awardType',
    'programme', 'program', 'course', 'degree', 'course_title', 'courseTitle', 'degree_title',
    'programme_code', 'programCode', 'course_code', 'courseCode',
    'award_title', 'awardTitle', 'award', 'degree_type', 'degreeType',
    'classification', 'class', 'grade', 'honours', 'honors', 'cgpa', 'gpa',
    'graduation_date', 'graduationDate', 'grad_date', 'completion_date', 'completionDate',
    'certificate_number', 'certificateNumber', 'cert_no', 'certNo',
    'issue_date', 'issueDate', 'issued_date', 'issuedDate', 'date_issued', 'dateIssued', 'date',
  ])

  const extra: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(raw)) {
    if (!known.has(k) && v !== null && v !== undefined && v !== '') {
      extra[k] = v
    }
  }
  return extra
}
