/* ──────────────────────────────────────────────────────────
   Vaasone — REST API Adapter
   Connects to PostgreSQL-backed SIS via REST endpoints.
   ────────────────────────────────────────────────────────── */

import type { SISAdapter, CanonicalCredential, ConnectionConfig, ConnectionTestResult } from '@/lib/types'
import { normalizeRecords } from './normalizer'

export class RESTAdapter implements SISAdapter {
  readonly adapterType = 'rest' as const
  private config: ConnectionConfig | null = null

  async connect(config: ConnectionConfig) {
    this.config = config
  }

  async testConnection(): Promise<ConnectionTestResult> {
    if (!this.config?.endpoint) {
      return { success: false, message: 'REST endpoint URL is required.' }
    }

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...this.config.headers,
      }
      if (this.config.api_key) headers['Authorization'] = `Bearer ${this.config.api_key}`

      const res = await fetch(this.config.endpoint, { headers, signal: AbortSignal.timeout(10_000) })
      if (!res.ok) return { success: false, message: `REST endpoint returned ${res.status}` }

      const data = await res.json()
      const records = Array.isArray(data) ? data : data.records ?? data.data ?? data.results ?? []
      const normalized = normalizeRecords(records.slice(0, 5))

      return {
        success: true,
        message: `Connected. Found ${records.length} records.`,
        records_found: records.length,
        sample: normalized,
      }
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : 'Connection failed' }
    }
  }

  async fetchCredentials(): Promise<CanonicalCredential[]> {
    if (!this.config?.endpoint) throw new Error('REST adapter not configured')

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...this.config.headers,
    }
    if (this.config.api_key) headers['Authorization'] = `Bearer ${this.config.api_key}`

    const res = await fetch(this.config.endpoint, { headers })
    if (!res.ok) throw new Error(`REST endpoint returned ${res.status}`)

    const data = await res.json()
    const records = Array.isArray(data) ? data : data.records ?? data.data ?? data.results ?? []
    return normalizeRecords(records)
  }

  async disconnect() {
    this.config = null
  }
}
