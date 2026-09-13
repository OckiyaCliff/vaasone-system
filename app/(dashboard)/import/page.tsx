import { getCurrentUser } from '@/lib/auth'
import { listOrganizations } from '@/lib/vaas-repository'
import { ImportWizard } from '@/components/dashboard/import-wizard'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ImportPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Only admins can access data migration
  if (user.role !== 'system_admin' && user.role !== 'institution_admin') {
    redirect('/dashboard')
  }

  const organizations = await listOrganizations().catch(() => [])

  return (
    <div className="space-y-6">
      <ImportWizard
        organizations={organizations.map((o) => ({ id: o.id, name: o.name }))}
        userOrganizationId={user.organizationId}
        isSystemAdmin={user.isSystemAdmin}
      />
    </div>
  )
}
