/* ──────────────────────────────────────────────────────────
   Vaasone — Mock / fallback data
   Used when Supabase is not configured. Also provides
   static data shapes for UI components.
   ────────────────────────────────────────────────────────── */

import type { ActivityEvent } from '@/lib/types'

export type MockCredential = {
  id: string
  recipient: string
  program: string
  institution: string
  issuedAt: string
  status: 'verified' | 'pending' | 'revoked'
  network: 'Stellar'
  hash: string
}

export const workspace = {
  name: 'Vaasone Trust Network',
  shortName: 'VO',
  role: 'Network administrator',
  environment: 'Testnet',
}

export const credentials: MockCredential[] = [
  { id: 'VO-2024-00482', recipient: 'Amara Okafor', program: 'BSc Computer Science', institution: 'University of Lagos', issuedAt: 'Sep 10, 2024', status: 'verified', network: 'Stellar', hash: '7b4e…91c2' },
  { id: 'VO-2024-00481', recipient: 'Kwame Mensah', program: 'MSc Data Engineering', institution: 'Ashesi University', issuedAt: 'Sep 10, 2024', status: 'verified', network: 'Stellar', hash: '2ef8…0a6d' },
  { id: 'VO-2024-00480', recipient: 'Fatima Abdullahi', program: 'BEng Civil Engineering', institution: 'Ahmadu Bello University', issuedAt: 'Sep 09, 2024', status: 'pending', network: 'Stellar', hash: 'pending' },
  { id: 'VO-2024-00479', recipient: 'Daniel Ndlovu', program: 'BA Economics', institution: 'University of Cape Town', issuedAt: 'Sep 08, 2024', status: 'verified', network: 'Stellar', hash: 'd8a0…4f77' },
  { id: 'VO-2024-00478', recipient: 'Nia Kamau', program: 'LLB Law', institution: 'Strathmore University', issuedAt: 'Sep 07, 2024', status: 'revoked', network: 'Stellar', hash: '5ac1…c932' },
]

export const activities: (Pick<ActivityEvent, 'id' | 'event_type' | 'label' | 'subject'> & { created_at: string })[] = [
  { id: '1', label: 'Credential issued', subject: 'Amara Okafor · BSc Computer Science', created_at: new Date(Date.now() - 12 * 60_000).toISOString(), event_type: 'issued' },
  { id: '2', label: 'Credential verified', subject: 'Kwame Mensah · MSc Data Engineering', created_at: new Date(Date.now() - 38 * 60_000).toISOString(), event_type: 'verified' },
  { id: '3', label: 'Institution sync completed', subject: 'University of Lagos · 248 records', created_at: new Date(Date.now() - 3600_000).toISOString(), event_type: 'synced' },
  { id: '4', label: 'Credential revoked', subject: 'Nia Kamau · LLB Law', created_at: new Date(Date.now() - 3 * 3600_000).toISOString(), event_type: 'revoked' },
  { id: '5', label: 'Credential anchored', subject: 'Fatima Abdullahi · BEng Civil Engineering', created_at: new Date(Date.now() - 5 * 3600_000).toISOString(), event_type: 'anchored' },
  { id: '6', label: 'Institution registered', subject: 'Covenant University · Nigeria', created_at: new Date(Date.now() - 8 * 3600_000).toISOString(), event_type: 'registered' },
]

export const institutionStats = [
  { name: 'University of Lagos', country: 'Nigeria', credentials: '4,218', status: 'Healthy', initials: 'UL' },
  { name: 'Ashesi University', country: 'Ghana', credentials: '1,862', status: 'Healthy', initials: 'AU' },
  { name: 'University of Cape Town', country: 'South Africa', credentials: '3,104', status: 'Syncing', initials: 'CT' },
  { name: 'Ahmadu Bello University', country: 'Nigeria', credentials: '2,841', status: 'Healthy', initials: 'AB' },
  { name: 'Strathmore University', country: 'Kenya', credentials: '1,012', status: 'Healthy', initials: 'SU' },
]

export const verificationVolume = [34, 42, 38, 56, 49, 68, 62, 74, 70, 84, 78, 91]

export const platformStats = [
  { label: 'Credentials issued', value: '12,480', change: '+18.4%', detail: 'this month' },
  { label: 'Verification requests', value: '8,924', change: '+24.8%', detail: 'this month' },
  { label: 'Connected institutions', value: '27', change: '+3', detail: 'this quarter' },
]
