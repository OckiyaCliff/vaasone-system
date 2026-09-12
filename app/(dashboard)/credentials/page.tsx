import { getCurrentUser } from '@/lib/auth'
import { listCredentials } from '@/lib/vaas-repository'
import { CredentialsTable } from '@/components/dashboard/credentials-table'

export const dynamic = 'force-dynamic'

export default async function CredentialsPage() {
  const user = await getCurrentUser()
  const orgId = user?.organizationId ?? undefined

  const { credentials } = await listCredentials({
    organizationId: orgId,
    limit: 100,
  }).catch(() => ({ credentials: [] }))

  return <CredentialsTable credentials={credentials as any} />
}
