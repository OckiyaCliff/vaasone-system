/* ──────────────────────────────────────────────────────────
   Vaasone — Bulk Import Parser (CSV & Excel)
   Supports .csv, .xlsx, .xls formats with automatic column
   mapping, field validation, and normalization.
   ────────────────────────────────────────────────────────── */

import * as XLSX from 'xlsx'

export type ParsedCredentialRow = {
  rowIndex: number
  credentialId?: string
  recipientName: string
  recipientEmail?: string
  studentReference?: string
  programme: string
  credentialType: 'degree' | 'diploma' | 'certificate' | 'professional'
  awardTitle?: string
  classification?: string
  graduationDate?: string
  certificateNumber?: string
  issueDate?: string
  isValid: boolean
  errors: string[]
}

export type ImportParseResult = {
  totalRows: number
  validRows: number
  invalidRows: number
  headers: string[]
  detectedColumns: Record<string, string>
  rows: ParsedCredentialRow[]
}

const COLUMN_ALIASES: Record<string, string[]> = {
  recipientName: ['recipient_name', 'recipient', 'student_name', 'name', 'full_name', 'candidate_name', 'graduate_name'],
  recipientEmail: ['recipient_email', 'email', 'student_email', 'contact_email'],
  studentReference: ['student_reference', 'student_id', 'matric_no', 'matric_number', 'reg_no', 'registration_number', 'id_number'],
  programme: ['programme', 'program', 'course', 'course_of_study', 'department', 'major', 'discipline'],
  credentialType: ['credential_type', 'type', 'award_type', 'qualification_type'],
  awardTitle: ['award_title', 'award', 'degree', 'degree_title', 'title'],
  classification: ['classification', 'class', 'grade', 'division', 'class_of_degree', 'honours'],
  graduationDate: ['graduation_date', 'grad_date', 'completion_date', 'date_of_graduation', 'year'],
  certificateNumber: ['certificate_number', 'cert_no', 'certificate_no', 'serial_number', 'cert_number'],
  issueDate: ['issue_date', 'date_issued', 'date_of_issue', 'awarded_date'],
  credentialId: ['credential_id', 'id', 'record_id', 'ref'],
}

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  const normalizedHeaders = headers.map(normalizeHeader)

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    const idx = normalizedHeaders.findIndex((h) => aliases.includes(h) || aliases.some((a) => h.includes(a)))
    if (idx !== -1) {
      mapping[field] = headers[idx]
    }
  }

  return mapping
}

export function parseRawCSV(csvText: string): { headers: string[]; data: Record<string, string>[] } {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { headers: [], data: [] }

  // Detect delimiter (comma, semicolon, tab)
  const firstLine = lines[0]
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ','

  const parseLine = (line: string): string[] => {
    const values: string[] = []
    let inQuotes = false
    let cur = ''

    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === delimiter && !inQuotes) {
        values.push(cur.trim())
        cur = ''
      } else {
        cur += ch
      }
    }
    values.push(cur.trim())
    return values
  }

  const headers = parseLine(lines[0])
  const data: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i])
    if (cols.every((c) => !c)) continue // skip empty rows
    const rowObj: Record<string, string> = {}
    headers.forEach((h, hIdx) => {
      rowObj[h] = cols[hIdx] ?? ''
    })
    data.push(rowObj)
  }

  return { headers, data }
}

export function parseExcelBuffer(buffer: Buffer | ArrayBuffer): { headers: string[]; data: Record<string, string>[] } {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return { headers: [], data: [] }

  const sheet = workbook.Sheets[sheetName]
  const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

  if (rawRows.length === 0) return { headers: [], data: [] }

  const headers: string[] = (rawRows[0] || []).map((h: any) => String(h).trim()).filter(Boolean)
  const data: Record<string, string>[] = []

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i]
    if (!row || row.length === 0) continue
    const rowObj: Record<string, string> = {}
    headers.forEach((h, hIdx) => {
      const val = row[hIdx]
      if (val instanceof Date) {
        rowObj[h] = val.toISOString().slice(0, 10)
      } else {
        rowObj[h] = val !== undefined && val !== null ? String(val).trim() : ''
      }
    })
    if (Object.values(rowObj).some((v) => v !== '')) {
      data.push(rowObj)
    }
  }

  return { headers, data }
}

export function validateAndNormalizeRows(
  rows: Record<string, string>[],
  mapping: Record<string, string>,
  orgSlug: string = 'UNIV'
): ImportParseResult {
  const parsedRows: ParsedCredentialRow[] = []

  rows.forEach((row, idx) => {
    const errors: string[] = []

    const recipientName = (row[mapping.recipientName] || '').trim()
    const programme = (row[mapping.programme] || '').trim()
    const studentReference = (row[mapping.studentReference] || '').trim() || undefined
    const recipientEmail = (row[mapping.recipientEmail] || '').trim() || undefined
    const certificateNumber = (row[mapping.certificateNumber] || '').trim() || undefined
    const classification = (row[mapping.classification] || '').trim() || undefined
    const awardTitle = (row[mapping.awardTitle] || '').trim() || undefined
    const graduationDate = (row[mapping.graduationDate] || '').trim() || undefined
    const issueDate = (row[mapping.issueDate] || '').trim() || new Date().toISOString().slice(0, 10)
    
    // Type validation
    let credentialType: ParsedCredentialRow['credentialType'] = 'degree'
    const rawType = (row[mapping.credentialType] || '').toLowerCase().trim()
    if (['diploma', 'certificate', 'professional', 'degree'].includes(rawType)) {
      credentialType = rawType as any
    }

    // Required checks
    if (!recipientName) {
      errors.push('Recipient name is required.')
    }
    if (!programme) {
      errors.push('Programme/Course is required.')
    }

    // Generate or clean credential ID
    let credentialId = (row[mapping.credentialId] || '').trim()
    if (!credentialId) {
      const cleanSlug = orgSlug.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'VAAS'
      const year = issueDate ? issueDate.slice(0, 4) : new Date().getFullYear().toString()
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
      const rowPart = String(idx + 1).padStart(3, '0')
      credentialId = `VAAS-${cleanSlug}-${year}-${rowPart}-${randomPart}`
    }

    parsedRows.push({
      rowIndex: idx + 1,
      credentialId,
      recipientName,
      recipientEmail,
      studentReference,
      programme,
      credentialType,
      awardTitle,
      classification,
      graduationDate,
      certificateNumber,
      issueDate,
      isValid: errors.length === 0,
      errors,
    })
  })

  const validRows = parsedRows.filter((r) => r.isValid).length
  const invalidRows = parsedRows.filter((r) => !r.isValid).length

  return {
    totalRows: parsedRows.length,
    validRows,
    invalidRows,
    headers: Object.values(mapping),
    detectedColumns: mapping,
    rows: parsedRows,
  }
}
