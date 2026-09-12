import { getCurrentUser } from '@/lib/auth'
import {
  getCredentialStats,
  getVerificationStats,
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

  const orgId = user?.organizationId ?? undefined
  const [credStats, verifStats, activities] = await Promise.all([
    getCredentialStats(orgId).catch(() => ({ total: 0, byStatus: {} as Record<string, number> })),
    getVerificationStats(30).catch(() => ({ total: 0, successful: 0 })),
    listActivities({ organizationId: orgId, limit: 6 }).catch(() => []),
  ])

  const totalCredentials = credStats.total
  const byStatus = credStats.byStatus as Record<string, number>
  const activeCredentials = (byStatus['active'] ?? 0) + (byStatus['issued'] ?? 0)
  const revokedCredentials = byStatus['revoked'] ?? 0

  const totalVerifications = verifStats.total
  const verificationRate =
    totalVerifications > 0
      ? (verifStats.successful / totalVerifications) * 100
      : 100

  return (
    <Overview
      stats={{
        totalCredentials,
        activeCredentials,
        revokedCredentials,
        verificationRate,
        totalVerifications,
        connectedInstitutions: organizations.length,
      }}
      activities={activities}
    />
  )
}
