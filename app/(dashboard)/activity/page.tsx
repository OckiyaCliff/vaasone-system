import { getCurrentUser } from '@/lib/auth'
import { listActivities } from '@/lib/vaas-repository'
import { ActivityLog } from '@/components/dashboard/activity-log'

export const dynamic = 'force-dynamic'

export default async function ActivityPage() {
  const user = await getCurrentUser()
  const activities = await listActivities({
    organizationId: user?.organizationId ?? undefined,
    limit: 50,
  }).catch(() => [])

  return <ActivityLog activities={activities as any} />
}
