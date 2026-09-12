export type ChainWriteResult = {
  network: 'Stellar'
  status: 'submitted' | 'not_configured'
  transactionId?: string
  reason?: string
}

export type CredentialAnchor = {
  credentialId: string
  digest: string
}

export interface BlockchainProvider {
  anchorCredential(input: CredentialAnchor): Promise<ChainWriteResult>
}

export class StellarProvider implements BlockchainProvider {
  async anchorCredential(): Promise<ChainWriteResult> {
    return {
      network: 'Stellar',
      status: 'not_configured',
      reason: 'Stellar signing configuration is not configured. Credential remains pending until an issuer wallet is connected.',
    }
  }
}

export const stellarProvider = new StellarProvider()
