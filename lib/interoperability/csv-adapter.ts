/* ──────────────────────────────────────────────────────────
   Vaasone — CSV/JSON File Adapter
   Imports credentials from CSV or JSON file sources.
   ────────────────────────────────────────────────────────── */

import type { SISAdapter, CanonicalCredential, ConnectionConfig, ConnectionTestResult } from '@/lib/types'
import { normalizeRecords } from './normalizer'

export class CSVAdapter implements SISAdapter {
  readonly adapterType = 'csv' as const
  private config: ConnectionConfig | null = null

  async connect(config: ConnectionConfig) {
    this.config = config
  }

  async testConnection(): Promise<ConnectionTestResult> {
    if (!this.config?.endpoint && !this.config?.file_url) {
      return { success: false, message: 'CSV/JSON file URL or data is required.' }
    }

    try {
      const records = await this.fetchRaw()
      const normalized = normalizeRecords(records.slice(0, 5))

      return {
        success: true,
        message: `Parsed ${records.length} records.`,
        records_found: records.length,
        sample: normalized,
      }
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : 'File parsing failed' }
    }
  }

  async fetchCredentials(): Promise<CanonicalCredential[]> {
    const raw = await this.fetchRaw()
    return normalizeRecords(raw)
  }

  private async fetchRaw(): Promise<Record<string, unknown>[]> {
    const url = this.config?.endpoint || this.config?.file_url
    if (!url) throw new Error('CSV adapter not configured')

    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
    if (!res.ok) throw new Error(`File fetch returned ${res.status}`)

    const contentType = res.headers.get('content-type') || ''
    const text = await res.text()

    /* Auto-detect format */
    if (contentType.includes('json') || text.trim().startsWith('[') || text.trim().startsWith('{')) {
      return this.parseJSON(text)
    }

    return this.parseCSV(text)
  }

  private parseJSON(text: string): Record<string, unknown>[] {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed
    if (parsed.records) return parsed.records
    if (parsed.data) return parsed.data
    return [parsed]
  }

  private parseCSV(text: string): Record<string, unknown>[] {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length < 2) return []

    const headers = this.parseCSVLine(lines[0])
    const records: Record<string, unknown>[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      const record: Record<string, unknown> = {}
      headers.forEach((header, idx) => {
        record[header] = values[idx] ?? ''
      })
      records.push(record)
    }

    return records
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  async disconnect() {
    this.config = null
  }
}
