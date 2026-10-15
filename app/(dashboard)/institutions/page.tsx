import { getCurrentUser } from '@/lib/auth'
import { listOrganizations, listPlatformUsers } from '@/lib/vaas-repository'
import { InstitutionsPanel } from '@/components/dashboard/institutions-panel'

export const dynamic = 'force-dynamic'

export default async function InstitutionsPage() {
  const user = await getCurrentUser()
  const allInstitutions = await listOrganizations().catch(() => [])

  const institutions = user?.isSystemAdmin
    ? allInstitutions
    : allInstitutions.filter((i) => i.id === user?.organizationId)

  let platformUsers: any[] = []
  if (user?.isSystemAdmin) {
    platformUsers = await listPlatformUsers().catch(() => [])
  }

  return (
    <InstitutionsPanel
      institutions={institutions}
      isSystemAdmin={user?.isSystemAdmin ?? false}
      userOrganizationId={user?.organizationId ?? null}
      currentUserRole={user?.role ?? 'verifier'}
      platformUsers={platformUsers}
    />
  )
}
