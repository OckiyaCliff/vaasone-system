export type CredentialStatus = 'verified' | 'pending' | 'revoked'

export type Credential = {
  id: string
  recipient: string
  program: string
  institution: string
  issuedAt: string
  status: CredentialStatus
  network: 'Stellar'
  hash: string
}

export type Activity = {
  id: string
  label: string
  subject: string
  time: string
  kind: 'issued' | 'verified' | 'synced' | 'revoked'
}

export const workspace = {
  name: 'Axiom Trust Network',
  shortName: 'AT',
  role: 'Network administrator',
  environment: 'Production',
}

export const credentials: Credential[] = [
  { id: 'AXM-2024-00482', recipient: 'Amara Okafor', program: 'BSc Computer Science', institution: 'University of Lagos', issuedAt: 'Sep 10, 2024', status: 'verified', network: 'Stellar', hash: '7b4e…91c2' },
  { id: 'AXM-2024-00481', recipient: 'Kwame Mensah', program: 'MSc Data Engineering', institution: 'Ashesi University', issuedAt: 'Sep 10, 2024', status: 'verified', network: 'Stellar', hash: '2ef8…0a6d' },
  { id: 'AXM-2024-00480', recipient: 'Fatima Abdullahi', program: 'BEng Civil Engineering', institution: 'Ahmadu Bello University', issuedAt: 'Sep 09, 2024', status: 'pending', network: 'Stellar', hash: 'pending', },
  { id: 'AXM-2024-00479', recipient: 'Daniel Ndlovu', program: 'BA Economics', institution: 'University of Cape Town', issuedAt: 'Sep 08, 2024', status: 'verified', network: 'Stellar', hash: 'd8a0…4f77' },
  { id: 'AXM-2024-00478', recipient: 'Nia Kamau', program: 'LLB Law', institution: 'Strathmore University', issuedAt: 'Sep 07, 2024', status: 'revoked', network: 'Stellar', hash: '5ac1…c932' },
]

export const activities: Activity[] = [
  { id: '1', label: 'Credential issued', subject: 'Amara Okafor · BSc Computer Science', time: '12 min ago', kind: 'issued' },
  { id: '2', label: 'Credential verified', subject: 'Kwame Mensah · MSc Data Engineering', time: '38 min ago', kind: 'verified' },
  { id: '3', label: 'Institution sync completed', subject: 'University of Lagos · 248 records', time: '1 hr ago', kind: 'synced' },
  { id: '4', label: 'Credential revoked', subject: 'Nia Kamau · LLB Law', time: '3 hrs ago', kind: 'revoked' },
]

export const institutionStats = [
  { name: 'University of Lagos', country: 'Nigeria', credentials: '4,218', status: 'Healthy', initials: 'UL' },
  { name: 'Ashesi University', country: 'Ghana', credentials: '1,862', status: 'Healthy', initials: 'AU' },
  { name: 'University of Cape Town', country: 'South Africa', credentials: '3,104', status: 'Syncing', initials: 'CT' },
]

export const verificationVolume = [34, 42, 38, 56, 49, 68, 62, 74, 70, 84, 78, 91]

export const platformStats = [
  { label: 'Credentials issued', value: '12,480', change: '+18.4%', detail: 'this month' },
  { label: 'Verification requests', value: '8,924', change: '+24.8%', detail: 'this month' },
  { label: 'Connected institutions', value: '27', change: '+3', detail: 'this quarter' },
]

export function getStatusLabel(status: CredentialStatus) {
  return status === 'verified' ? 'Verified' : status === 'pending' ? 'Pending' : 'Revoked'
}

export function getActivityTone(kind: Activity['kind']) {
  return kind === 'revoked' ? 'dark' : kind === 'synced' ? 'muted' : 'light'
}

export type BlockchainProvider = {
  network: 'Stellar'
  environment: 'Production'
  status: 'operational'
  ledger: string
  explorerUrl: string
}

export const stellarProvider: BlockchainProvider = {
  network: 'Stellar',
  environment: 'Production',
  status: 'operational',
  ledger: '51,248,901',
  explorerUrl: 'https://stellar.expert',
}

export const blockchainProviders = [stellarProvider]

// New networks implement this boundary without changing credential workflows.
export interface CredentialTrustProvider {
  readonly network: string
  anchorCredential(payload: { credentialId: string; digest: string }): Promise<{ transactionId: string }>
  verifyCredential(transactionId: string): Promise<{ valid: boolean; ledger: string }>
}

export class StellarTrustProvider implements CredentialTrustProvider {
  readonly network = 'Stellar'

  async anchorCredential(payload: { credentialId: string; digest: string }) {
    return { transactionId: `stellar:${payload.credentialId}:${payload.digest}` }
  }

  async verifyCredential(transactionId: string) {
    return { valid: transactionId.startsWith('stellar:'), ledger: stellarProvider.ledger }
  }
}

export const trustProvider = new StellarTrustProvider()
