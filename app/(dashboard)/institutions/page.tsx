import { getCurrentUser } from '@/lib/auth'
import { listOrganizations, listPlatformUsers } from '@/lib/vaas-repository'
import { InstitutionsPanel } from '@/components/dashboard/institutions-panel'

export const dynamic = 'force-dynamic'

export default async function InstitutionsPage() {
  const user = await getCurrentUser()
  const institutions = await listOrganizations().catch(() => [])

  let platformUsers: any[] = []
  if (user?.isSystemAdmin) {
    platformUsers = await listPlatformUsers().catch(() => [])
  }

  return (
    <InstitutionsPanel
      institutions={institutions}
      isSystemAdmin={user?.isSystemAdmin ?? false}
      platformUsers={platformUsers}
    />
  )
}
