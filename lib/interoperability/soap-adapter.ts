/* ──────────────────────────────────────────────────────────
   Vaasone — SOAP/XML Adapter
   Connects to legacy SIS via SOAP/XML endpoints.
   Parses XML responses into normalized credentials.
   ────────────────────────────────────────────────────────── */

import type { SISAdapter, CanonicalCredential, ConnectionConfig, ConnectionTestResult } from '@/lib/types'
import { normalizeRecords } from './normalizer'

export class SOAPAdapter implements SISAdapter {
  readonly adapterType = 'soap' as const
  private config: ConnectionConfig | null = null

  async connect(config: ConnectionConfig) {
    this.config = config
  }

  async testConnection(): Promise<ConnectionTestResult> {
    if (!this.config?.endpoint) {
      return { success: false, message: 'SOAP endpoint URL is required.' }
    }

    try {
      const records = await this.fetchRaw()
      const normalized = normalizeRecords(records.slice(0, 5))

      return {
        success: true,
        message: `Connected. Found ${records.length} records.`,
        records_found: records.length,
        sample: normalized,
      }
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : 'SOAP connection failed' }
    }
  }

  async fetchCredentials(): Promise<CanonicalCredential[]> {
    const raw = await this.fetchRaw()
    return normalizeRecords(raw)
  }

  private async fetchRaw(): Promise<Record<string, unknown>[]> {
    if (!this.config?.endpoint) throw new Error('SOAP adapter not configured')

    /* Build minimal SOAP envelope */
    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetCredentials xmlns="urn:sis-service" />
  </soap:Body>
</soap:Envelope>`

    const res = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'urn:sis-service/GetCredentials',
        ...this.config.headers,
      },
      body: soapBody,
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) throw new Error(`SOAP endpoint returned ${res.status}`)

    const text = await res.text()
    return parseXMLRecords(text)
  }

  async disconnect() {
    this.config = null
  }
}

/**
 * Simple XML to records parser.
 * Handles common SIS XML structures without full XML library dependency.
 */
function parseXMLRecords(xml: string): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = []

  /* Try JSON-wrapped XML responses first */
  try {
    const parsed = JSON.parse(xml)
    if (Array.isArray(parsed)) return parsed
    if (parsed.records || parsed.data) return parsed.records ?? parsed.data
  } catch {
    /* Not JSON, continue with XML parsing */
  }

  /* Simple regex-based XML extraction for <record> or <credential> elements */
  const recordPattern = /<(?:record|credential|student|entry)[^>]*>([\s\S]*?)<\/(?:record|credential|student|entry)>/gi
  let match: RegExpExecArray | null = recordPattern.exec(xml)

  while (match) {
    const content = match[1]
    const record: Record<string, unknown> = {}
    const fieldPattern = /<(\w+)>([^<]*)<\/\1>/g
    let fieldMatch: RegExpExecArray | null = fieldPattern.exec(content)

    while (fieldMatch) {
      record[fieldMatch[1]] = fieldMatch[2].trim()
      fieldMatch = fieldPattern.exec(content)
    }

    if (Object.keys(record).length > 0) records.push(record)
    match = recordPattern.exec(xml)
  }

  return records
}
