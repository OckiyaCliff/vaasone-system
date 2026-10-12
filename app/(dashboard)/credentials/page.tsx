import { getCurrentUser } from '@/lib/auth'
import { listCredentials, listOrganizations } from '@/lib/vaas-repository'
import { CredentialsTable } from '@/components/dashboard/credentials-table'

export const dynamic = 'force-dynamic'

export default async function CredentialsPage() {
  const user = await getCurrentUser()
  const organizations = await listOrganizations().catch(() => [])

  // System admin sees ALL credentials across every institution
  const orgId = user?.isSystemAdmin ? undefined : (user?.organizationId ?? undefined)

  const { credentials } = await listCredentials({
    organizationId: orgId,
    limit: 500,
  }).catch(() => ({ credentials: [] }))

  return (
    <CredentialsTable
      credentials={credentials as any}
      organizations={organizations.map((o) => ({ id: o.id, name: o.name, slug: o.slug }))}
      isSystemAdmin={user?.isSystemAdmin ?? false}
      userOrgId={user?.organizationId ?? null}
    />
  )
}
