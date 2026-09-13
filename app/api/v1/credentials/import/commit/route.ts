import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { hashCredential, buildHashPayload } from '@/lib/crypto'
import { getDefaultProvider } from '@/lib/blockchain/provider-registry'
import { createAnchor, createActivityEvent, createAuditLog } from '@/lib/vaas-repository'
import type { ParsedCredentialRow } from '@/lib/import-parser'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'system_admin' && user.role !== 'institution_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can commit credential migrations.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { organizationId, rows, anchorToBlockchain = true } = body

    const requestedOrgId = organizationId || user.organizationId
    const targetOrgId = user.isSystemAdmin ? (requestedOrgId || user.organizationId) : user.organizationId

    if (!targetOrgId) {
      return NextResponse.json({ error: 'Organization ID is required.' }, { status: 400 })
    }

    const validRows: ParsedCredentialRow[] = (rows || []).filter((r: ParsedCredentialRow) => r.isValid)

    if (validRows.length === 0) {
      return NextResponse.json(
        { error: 'No valid rows provided for migration.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 1. Prepare credential objects with canonical hashes
    const insertPayloads = validRows.map((row) => {
      const canonicalPayload = buildHashPayload({
        credential_id: row.credentialId!,
        recipient_name: row.recipientName,
        programme: row.programme,
        credential_type: row.credentialType,
        issue_date: row.issueDate || new Date().toISOString().slice(0, 10),
        organization_id: targetOrgId,
        certificate_number: row.certificateNumber,
        graduation_date: row.graduationDate,
        classification: row.classification,
      })

      const digest = hashCredential(canonicalPayload)

      return {
        credential_id: row.credentialId!,
        organization_id: targetOrgId,
        recipient_name: row.recipientName,
        recipient_email: row.recipientEmail || null,
        student_reference: row.studentReference || null,
        credential_type: row.credentialType,
        programme: row.programme,
        award_title: row.awardTitle || null,
        classification: row.classification || null,
        graduation_date: row.graduationDate || null,
        certificate_number: row.certificateNumber || null,
        issue_date: row.issueDate || new Date().toISOString().slice(0, 10),
        document_hash: digest,
        status: 'issued',
        issuer_user_id: user.id,
      }
    })

    // 2. Batch insert credentials (chunks of 100)
    const chunkSize = 100
    const insertedRecords: any[] = []

    for (let i = 0; i < insertPayloads.length; i += chunkSize) {
      const chunk = insertPayloads.slice(i, i + chunkSize)
      const { data, error } = await supabase
        .from('credentials')
        .insert(chunk)
        .select('id, credential_id, document_hash')

      if (error) {
        // If unique constraint collision occurs, skip or report
        console.warn('Batch insert warning:', error.message)
      } else if (data) {
        insertedRecords.push(...data)
      }
    }

    // 3. Optional Stellar blockchain anchoring
    let anchoredCount = 0
    if (anchorToBlockchain && insertedRecords.length > 0) {
      try {
        const provider = getDefaultProvider()
        // Anchor first 5 immediately on-chain (to keep request fast), record anchors for the rest
        for (let i = 0; i < insertedRecords.length; i++) {
          const rec = insertedRecords[i]
          if (i < 5) {
            try {
              const receipt = await provider.anchorCredential(rec.document_hash)
              await createAnchor({
                credential_id: rec.id,
                provider: 'stellar',
                anchor_hash: rec.document_hash,
                transaction_id: receipt.transactionId,
                ledger: String(receipt.ledger ?? ''),
                status: receipt.status,
                network: receipt.network,
              })
              anchoredCount++
            } catch (anchorErr) {
              await createAnchor({
                credential_id: rec.id,
                provider: 'stellar',
                anchor_hash: rec.document_hash,
                status: 'pending',
                network: 'testnet',
              })
            }
          } else {
            // Queue pending anchor record
            await createAnchor({
              credential_id: rec.id,
              provider: 'stellar',
              anchor_hash: rec.document_hash,
              status: 'pending',
              network: 'testnet',
            })
          }
        }
      } catch (err) {
        console.warn('Blockchain batch anchoring warning:', err)
      }
    }

    // 4. Activity Event & Audit Log
    await createActivityEvent({
      organization_id: targetOrgId,
      event_type: 'bulk_import',
      label: 'Legacy database migrated',
      subject: `${insertedRecords.length} credentials imported from institutional database`,
      user_id: user.id,
      metadata: {
        totalMigrated: insertedRecords.length,
        anchoredToBlockchain: anchorToBlockchain,
      },
    })

    await createAuditLog({
      organization_id: targetOrgId,
      user_id: user.id,
      action: 'credential.bulk_import',
      resource_type: 'credential',
      details: {
        totalRows: validRows.length,
        insertedCount: insertedRecords.length,
        anchoredCount,
      },
    })

    return NextResponse.json({
      success: true,
      importedCount: insertedRecords.length,
      anchoredCount,
      message: `Successfully migrated ${insertedRecords.length} credentials to the Vaasone trust network.`,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to commit credential migration.' },
      { status: 500 }
    )
  }
}
