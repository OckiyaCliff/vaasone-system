import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { parseRawCSV, parseExcelBuffer, validateAndNormalizeRows } from '@/lib/import-parser'
import { getOrganization } from '@/lib/vaas-repository'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'system_admin' && user.role !== 'institution_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can import institutional databases.' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const targetOrgId = (formData.get('organizationId') as string) || user.organizationId

    if (!file) {
      return NextResponse.json({ error: 'No file provided for upload.' }, { status: 400 })
    }

    if (!targetOrgId) {
      return NextResponse.json({ error: 'Target organization ID is required.' }, { status: 400 })
    }

    const org = await getOrganization(targetOrgId)
    const orgSlug = org?.slug || 'VAAS'

    const fileName = file.name.toLowerCase()
    let rawHeaders: string[] = []
    let rawData: Record<string, string>[] = []

    const fileBytes = await file.arrayBuffer()

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const parsed = parseExcelBuffer(fileBytes)
      rawHeaders = parsed.headers
      rawData = parsed.data
    } else if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
      const text = new TextDecoder('utf-8').decode(fileBytes)
      const parsed = parseRawCSV(text)
      rawHeaders = parsed.headers
      rawData = parsed.data
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload a .csv, .xlsx, or .xls file.' },
        { status: 400 }
      )
    }

    if (rawData.length === 0) {
      return NextResponse.json(
        { error: 'The uploaded file contains no data rows or could not be read.' },
        { status: 400 }
      )
    }

    // Auto-detect columns
    const normalizedHeaders = rawHeaders.map((h) =>
      h.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_')
    )

    const mapping: Record<string, string> = {}
    const findHeader = (aliases: string[]) => {
      const idx = normalizedHeaders.findIndex((h) => aliases.some((a) => h.includes(a)))
      return idx !== -1 ? rawHeaders[idx] : ''
    }

    mapping.recipientName = findHeader(['recipient', 'student_name', 'name', 'full_name'])
    mapping.programme = findHeader(['programme', 'program', 'course', 'department', 'major'])
    mapping.studentReference = findHeader(['matric', 'student_id', 'reg_no', 'reference', 'id'])
    mapping.recipientEmail = findHeader(['email'])
    mapping.certificateNumber = findHeader(['cert_no', 'certificate', 'serial'])
    mapping.classification = findHeader(['class', 'grade', 'division', 'honours'])
    mapping.graduationDate = findHeader(['grad_date', 'graduation', 'completion', 'year'])
    mapping.issueDate = findHeader(['issue_date', 'date_issued', 'awarded'])
    mapping.credentialType = findHeader(['type', 'credential_type'])
    mapping.credentialId = findHeader(['credential_id', 'id'])

    const result = validateAndNormalizeRows(rawData, mapping, orgSlug)

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      stats: {
        total: result.totalRows,
        valid: result.validRows,
        invalid: result.invalidRows,
      },
      detectedMapping: result.detectedColumns,
      headers: rawHeaders,
      previewRows: result.rows.slice(0, 50),
      allRows: result.rows,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to parse database file.' },
      { status: 500 }
    )
  }
}
