/* ──────────────────────────────────────────────────────────
   Vaasone — Stellar Blockchain Provider (Testnet)
   Real Stellar integration using @stellar/stellar-sdk v17.
   
   v17 Compatibility Notes:
   - Uses Uint8Array instead of Buffer (no polyfill needed)
   - XDR unions are discriminated classes
   - No Buffer dependency for browser/edge runtime compat
   ────────────────────────────────────────────────────────── */

import * as Stellar from '@stellar/stellar-sdk'
import type { AnchorRequest, AnchorResult, AnchorVerification, BlockchainProvider } from '@/lib/types'

const HORIZON_URL = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
const NETWORK = process.env.STELLAR_NETWORK || 'testnet'
const PASSPHRASE = NETWORK === 'mainnet' ? Stellar.Networks.PUBLIC : Stellar.Networks.TESTNET

function getKeypair(): Stellar.Keypair | null {
  const secret = process.env.STELLAR_SECRET_KEY
  if (!secret || !secret.startsWith('S')) return null
  try {
    return Stellar.Keypair.fromSecret(secret)
  } catch {
    return null
  }
}

/**
 * Convert a hex string to Uint8Array (v17-compatible, no Buffer needed).
 */
function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.replace(/^0x/, '')
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.substring(i, i + 2), 16)
  }
  return bytes
}

export class StellarProvider implements BlockchainProvider {
  readonly network = 'stellar' as const
  private server: Stellar.Horizon.Server

  constructor() {
    this.server = new Stellar.Horizon.Server(HORIZON_URL)
  }

  /**
   * Anchor a single credential hash on Stellar via a manageData operation.
   * Key format: `vaas:{credentialId}`, value: first 32 bytes of the SHA-256 hash.
   * 
   * v17: Uses Uint8Array for the data value instead of Buffer.
   */
  async anchorCredential(request: AnchorRequest): Promise<AnchorResult> {
    const keypair = getKeypair()
    if (!keypair) {
      return {
        transactionId: `stub:${request.credentialId}:${Date.now()}`,
        ledger: null,
        network: 'stellar',
        status: 'submitted',
        error: 'Stellar signing key not configured. Using stub anchor.',
      }
    }

    try {
      const account = await this.server.loadAccount(keypair.publicKey())

      /* Use credential hash (strip sha256: prefix) for the data value.
         v17: Use Uint8Array instead of Buffer for edge/browser compat. */
      const hashHex = request.digest.replace(/^sha256:/, '').slice(0, 64)
      const dataValue = hexToBytes(hashHex)

      const transaction = new Stellar.TransactionBuilder(account, {
        fee: Stellar.BASE_FEE,
        networkPassphrase: PASSPHRASE,
      })
        .addOperation(
          Stellar.Operation.manageData({
            name: `vaas:${request.credentialId}`,
            value: dataValue,
          })
        )
        .setTimeout(30)
        .build()

      transaction.sign(keypair)
      const result = await this.server.submitTransaction(transaction)

      return {
        transactionId: result.hash,
        ledger: String(result.ledger),
        network: 'stellar',
        status: 'confirmed',
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Stellar error'
      return {
        transactionId: '',
        ledger: null,
        network: 'stellar',
        status: 'failed',
        error: message,
      }
    }
  }

  /**
   * Anchor a batch of credentials using a Merkle root.
   * Stores the Merkle root as a single manageData entry.
   */
  async anchorBatch(requests: AnchorRequest[]): Promise<AnchorResult> {
    if (requests.length === 0) {
      return { transactionId: '', ledger: null, network: 'stellar', status: 'failed', error: 'Empty batch' }
    }

    const { merkleRoot } = await import('@/lib/crypto')
    const hashes = requests.map((r) => r.digest)
    const root = merkleRoot(hashes)
    const batchId = `batch:${Date.now()}`

    return this.anchorCredential({ credentialId: batchId, digest: root })
  }

  /**
   * Verify an anchor by looking up the transaction on Stellar Horizon.
   */
  async verifyAnchor(transactionId: string): Promise<AnchorVerification> {
    /* Stub anchors */
    if (transactionId.startsWith('stub:')) {
      return {
        valid: true,
        network: 'stellar',
        ledger: null,
        timestamp: new Date().toISOString(),
        transactionId,
      }
    }

    try {
      const res = await fetch(`${HORIZON_URL}/transactions/${transactionId}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      if (res.ok) {
        const tx = await res.json()
        return {
          valid: tx.successful === true,
          network: 'stellar',
          ledger: String(tx.ledger_attr || tx.ledger || ''),
          timestamp: tx.created_at || new Date().toISOString(),
          transactionId,
        }
      }
      return {
        valid: false,
        network: 'stellar',
        ledger: null,
        timestamp: null,
        transactionId,
      }
    } catch {
      return {
        valid: false,
        network: 'stellar',
        ledger: null,
        timestamp: null,
        transactionId,
      }
    }
  }

  /**
   * Revoke a credential by clearing its manageData entry on Stellar.
   * Setting value to null removes the data entry from the account.
   */
  async revokeCredential(request: AnchorRequest): Promise<AnchorResult> {
    const keypair = getKeypair()
    if (!keypair) {
      return {
        transactionId: `stub:revoke:${request.credentialId}:${Date.now()}`,
        ledger: null,
        network: 'stellar',
        status: 'submitted',
        error: 'Stellar signing key not configured. Using stub revocation.',
      }
    }

    try {
      const account = await this.server.loadAccount(keypair.publicKey())

      const transaction = new Stellar.TransactionBuilder(account, {
        fee: Stellar.BASE_FEE,
        networkPassphrase: PASSPHRASE,
      })
        .addOperation(
          Stellar.Operation.manageData({
            name: `vaas:${request.credentialId}`,
            value: null, /* null = delete the data entry */
          })
        )
        .setTimeout(30)
        .build()

      transaction.sign(keypair)
      const result = await this.server.submitTransaction(transaction)

      return {
        transactionId: result.hash,
        ledger: String(result.ledger),
        network: 'stellar',
        status: 'confirmed',
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Stellar error'
      return {
        transactionId: '',
        ledger: null,
        network: 'stellar',
        status: 'failed',
        error: message,
      }
    }
  }
}

export const stellarProvider = new StellarProvider()
