/* ──────────────────────────────────────────────────────────
   Vaasone — Blockchain Provider Registry
   Factory that returns the correct provider based on config.
   Credential logic NEVER references a specific blockchain.
   ────────────────────────────────────────────────────────── */

import type { BlockchainNetwork, BlockchainProvider } from '@/lib/types'
import { StellarProvider } from './stellar-provider'
import { BNBProvider } from './bnb-provider'

const providers = new Map<BlockchainNetwork, BlockchainProvider>()

export function getProvider(network: BlockchainNetwork = 'stellar'): BlockchainProvider {
  const existing = providers.get(network)
  if (existing) return existing

  let provider: BlockchainProvider
  switch (network) {
    case 'stellar':
      provider = new StellarProvider()
      break
    case 'bnb':
      provider = new BNBProvider()
      break
    default:
      throw new Error(`Unsupported blockchain network: ${network}`)
  }

  providers.set(network, provider)
  return provider
}

/** Get the default (primary) provider — Stellar */
export function getDefaultProvider(): BlockchainProvider {
  return getProvider('stellar')
}

/** List all available blockchain networks */
export function getAvailableNetworks(): BlockchainNetwork[] {
  return ['stellar', 'bnb']
}

/**
 * Check if a provider is operational (has required config).
 */
export function isProviderConfigured(network: BlockchainNetwork): boolean {
  switch (network) {
    case 'stellar':
      return !!process.env.STELLAR_SECRET_KEY
    case 'bnb':
      return !!process.env.BNB_PRIVATE_KEY
    default:
      return false
  }
}
