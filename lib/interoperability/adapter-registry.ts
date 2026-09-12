/* ──────────────────────────────────────────────────────────
   Vaasone — Adapter Registry
   Factory that creates the correct SIS adapter based on type.
   ────────────────────────────────────────────────────────── */

import type { AdapterType, SISAdapter } from '@/lib/types'
import { RESTAdapter } from './rest-adapter'
import { SOAPAdapter } from './soap-adapter'
import { CSVAdapter } from './csv-adapter'

export function createAdapter(type: AdapterType): SISAdapter {
  switch (type) {
    case 'rest':
      return new RESTAdapter()
    case 'soap':
    case 'xml':
      return new SOAPAdapter()
    case 'csv':
    case 'json':
      return new CSVAdapter()
    case 'database':
      /* Database adapter would connect directly to external DBs.
         For MVP, REST/SOAP adapters cover this via the SIS's own API layer. */
      return new RESTAdapter()
    default:
      throw new Error(`Unsupported adapter type: ${type}`)
  }
}

export function getSupportedAdapters(): { type: AdapterType; label: string; description: string }[] {
  return [
    { type: 'rest', label: 'REST API', description: 'Connect to a SIS via RESTful JSON API (PostgreSQL, etc.)' },
    { type: 'soap', label: 'SOAP / XML', description: 'Connect to a legacy SIS via SOAP web service (MySQL, etc.)' },
    { type: 'csv', label: 'CSV Import', description: 'Import credentials from a CSV file export' },
    { type: 'json', label: 'JSON Import', description: 'Import credentials from a JSON file export' },
    { type: 'database', label: 'Direct Database', description: 'Connect directly to an external database' },
  ]
}
