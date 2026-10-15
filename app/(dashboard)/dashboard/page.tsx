import { getCurrentUser } from '@/lib/auth'
import {
  getCredentialStats,
  getVerificationStats,
  getBlockchainAnchorStats,
  getRecentCredentials,
  getRecentVerificationRequests,
  getVerificationTimeline,
  getIntegrationConnections,
  listActivities,
  listOrganizations,
} from '@/lib/vaas-repository'
import { Overview } from '@/components/dashboard/overview'
import { SetupWizard } from '@/components/dashboard/setup-wizard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const organizations = await listOrganizations().catch(() => [])

  // If no organizations exist yet, show the first-time setup wizard!
  if (organizations.length === 0) {
    return <SetupWizard userDisplayName={user?.displayName || 'Administrator'} />
  }

  // System admin sees all; organization admin/operator sees their tenant
  const orgId = user?.isSystemAdmin ? undefined : (user?.organizationId ?? undefined)

  const [
    credStats,
    verifStats,
    anchorStats,
    recentCredentials,
    recentVerifications,
    timeline,
    activities,
    connections,
  ] = await Promise.all([
    getCredentialStats(orgId).catch(() => ({ total: 0, byStatus: {}, byType: {} })),
    getVerificationStats(30).catch(() => ({ total: 0, successful: 0, unknown: 0, revoked: 0 })),
    getBlockchainAnchorStats(orgId).catch(() => ({ total: 0, confirmed: 0, pending: 0, latestTx: null })),
    getRecentCredentials(orgId, 5).catch(() => []),
    getRecentVerificationRequests(orgId, 5).catch(() => []),
    getVerificationTimeline(12).catch(() => [20, 25, 30, 45, 50, 60, 40, 55, 70, 80, 90, 100]),
    listActivities({ organizationId: orgId, limit: 6 }).catch(() => []),
    getIntegrationConnections(orgId).catch(() => []),
  ])

  const totalCredentials = credStats.total
  const byStatus = (credStats.byStatus || {}) as Record<string, number>
  const activeCredentials = (byStatus['active'] ?? 0) + (byStatus['issued'] ?? 0)
  const revokedCredentials = byStatus['revoked'] ?? 0
  const supersededCredentials = byStatus['superseded'] ?? 0

  const totalVerifications = verifStats.total
  const verificationRate =
    totalVerifications > 0
      ? (verifStats.successful / totalVerifications) * 100
      : 100

  const verifiedInstitutions = organizations.filter((o) => o.isVerified).length
  const pendingInstitutions = organizations.filter((o) => !o.isVerified).length

  // SIS status check
  const activeSisConnection = connections.find((c) => c.status === 'connected') || null
  const sisConnected = Boolean(
    activeSisConnection ||
    organizations.some((o) => (o.settings as any)?.sis_connected)
  )

  return (
    <Overview
      stats={{
        totalCredentials,
        activeCredentials,
        revokedCredentials,
        supersededCredentials,
        verificationRate,
        totalVerifications,
        successfulVerifications: verifStats.successful,
        unknownVerifications: verifStats.unknown,
        connectedInstitutions: organizations.length,
        verifiedInstitutions,
        pendingInstitutions,
        anchoredCount: anchorStats.total,
        anchoredConfirmed: anchorStats.confirmed,
        anchoredPending: anchorStats.pending,
      }}
      userContext={{
        displayName: user?.displayName || 'Administrator',
        role: user?.role || 'verifier',
        organizationName: user?.organizationName || null,
        isSystemAdmin: user?.isSystemAdmin ?? false,
      }}
      latestTx={anchorStats.latestTx}
      sisStatus={{
        connected: sisConnected,
        connection: activeSisConnection,
      }}
      credentialDistribution={credStats.byType || {}}
      recentCredentials={recentCredentials as any}
      recentVerifications={recentVerifications as any}
      activities={activities}
      timelineData={timeline}
      institutions={organizations.slice(0, 5)}
    />
  )
}
