/* ──────────────────────────────────────────────────────────
   Vaasone — BNB Smart Chain Provider (Real Testnet)
   Interacts with VaasoneCredentialRegistry deployed on
   BNB Smart Chain testnet.
   ────────────────────────────────────────────────────────── */

import { ethers } from 'ethers'
import type { AnchorRequest, AnchorResult, AnchorVerification, BlockchainProvider } from '@/lib/types'

const BNB_RPC = process.env.BNB_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545'
const BNB_CHAIN_ID = parseInt(process.env.BNB_CHAIN_ID || '97')
const CONTRACT_ADDRESS = process.env.BNB_CONTRACT_ADDRESS || ''

/* Contract ABI — only the functions we need */
const REGISTRY_ABI = [
  'function anchorCredential(string credentialId, bytes32 documentHash) external',
  'function anchorBatch(string[] credentialIds, bytes32[] documentHashes) external',
  'function revokeCredential(string credentialId) external',
  'function verifyCredential(string credentialId) external view returns (bytes32 documentHash, uint256 anchoredAt, bool isRevoked, uint256 revokedAt)',
  'function isActive(string credentialId) external view returns (bool)',
  'function verifyHash(string credentialId, bytes32 hash) external view returns (bool)',
  'function totalAnchored() external view returns (uint256)',
  'function totalRevoked() external view returns (uint256)',
  'event CredentialAnchored(string indexed credentialId, bytes32 documentHash, uint256 timestamp)',
  'event CredentialRevoked(string indexed credentialId, uint256 timestamp)',
]

function getWallet(): ethers.Wallet | null {
  const pk = process.env.BNB_PRIVATE_KEY
  if (!pk || pk.length < 60) return null
  try {
    const provider = new ethers.JsonRpcProvider(BNB_RPC, BNB_CHAIN_ID)
    return new ethers.Wallet(pk, provider)
  } catch {
    return null
  }
}

function getContract(signerOrProvider: ethers.Wallet | ethers.JsonRpcProvider): ethers.Contract | null {
  if (!CONTRACT_ADDRESS) return null
  return new ethers.Contract(CONTRACT_ADDRESS, REGISTRY_ABI, signerOrProvider)
}

export class BNBProvider implements BlockchainProvider {
  readonly network = 'bnb' as const

  /**
   * Anchor a credential hash on BNB Smart Chain.
   */
  async anchorCredential(request: AnchorRequest): Promise<AnchorResult> {
    const wallet = getWallet()
    const contract = wallet ? getContract(wallet) : null

    if (!contract) {
      return {
        transactionId: `bnb:stub:${request.credentialId}:${Date.now()}`,
        ledger: null,
        network: 'bnb',
        status: 'submitted',
        error: 'BNB contract not configured. Using stub anchor.',
      }
    }

    try {
      const hashHex = request.digest.replace(/^sha256:/, '')
      const documentHash = '0x' + hashHex.padEnd(64, '0').slice(0, 64)

      const tx = await contract.anchorCredential(request.credentialId, documentHash)
      const receipt = await tx.wait()

      return {
        transactionId: receipt.hash,
        ledger: String(receipt.blockNumber),
        network: 'bnb',
        status: 'confirmed',
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'BNB anchor failed'
      return {
        transactionId: '',
        ledger: null,
        network: 'bnb',
        status: 'failed',
        error: message,
      }
    }
  }

  /**
   * Anchor a batch of credentials in a single transaction.
   */
  async anchorBatch(requests: AnchorRequest[]): Promise<AnchorResult> {
    const wallet = getWallet()
    const contract = wallet ? getContract(wallet) : null

    if (!contract || requests.length === 0) {
      return { transactionId: '', ledger: null, network: 'bnb', status: 'failed', error: 'Not configured or empty batch' }
    }

    try {
      const ids = requests.map((r) => r.credentialId)
      const hashes = requests.map((r) => {
        const hex = r.digest.replace(/^sha256:/, '')
        return '0x' + hex.padEnd(64, '0').slice(0, 64)
      })

      const tx = await contract.anchorBatch(ids, hashes)
      const receipt = await tx.wait()

      return {
        transactionId: receipt.hash,
        ledger: String(receipt.blockNumber),
        network: 'bnb',
        status: 'confirmed',
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'BNB batch anchor failed'
      return { transactionId: '', ledger: null, network: 'bnb', status: 'failed', error: message }
    }
  }

  /**
   * Verify an anchor by querying the smart contract.
   */
  async verifyAnchor(transactionId: string): Promise<AnchorVerification> {
    if (transactionId.startsWith('bnb:stub:')) {
      return { valid: true, network: 'bnb', ledger: null, timestamp: new Date().toISOString(), transactionId }
    }

    try {
      const provider = new ethers.JsonRpcProvider(BNB_RPC, BNB_CHAIN_ID)
      const receipt = await provider.getTransactionReceipt(transactionId)

      if (!receipt) {
        return { valid: false, network: 'bnb', ledger: null, timestamp: null, transactionId }
      }

      const block = await provider.getBlock(receipt.blockNumber)

      return {
        valid: receipt.status === 1,
        network: 'bnb',
        ledger: String(receipt.blockNumber),
        timestamp: block ? new Date(Number(block.timestamp) * 1000).toISOString() : null,
        transactionId,
      }
    } catch {
      return { valid: false, network: 'bnb', ledger: null, timestamp: null, transactionId }
    }
  }

  /**
   * Revoke a credential on BNB Smart Chain.
   */
  async revokeCredential(request: AnchorRequest): Promise<AnchorResult> {
    const wallet = getWallet()
    const contract = wallet ? getContract(wallet) : null

    if (!contract) {
      return {
        transactionId: `bnb:stub:revoke:${request.credentialId}:${Date.now()}`,
        ledger: null,
        network: 'bnb',
        status: 'submitted',
      }
    }

    try {
      const tx = await contract.revokeCredential(request.credentialId)
      const receipt = await tx.wait()

      return {
        transactionId: receipt.hash,
        ledger: String(receipt.blockNumber),
        network: 'bnb',
        status: 'confirmed',
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'BNB revocation failed'
      return { transactionId: '', ledger: null, network: 'bnb', status: 'failed', error: message }
    }
  }
}

export const bnbProvider = new BNBProvider()
