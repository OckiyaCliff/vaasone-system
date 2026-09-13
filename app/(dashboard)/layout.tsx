import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { AuthProvider } from '@/components/auth-provider'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { PendingVerification } from '@/components/dashboard/pending-verification'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  /* If user belongs to an unverified institution and is not system admin, show pending screen */
  if (user.organizationId && user.organizationVerified === false && !user.isSystemAdmin) {
    return (
      <AuthProvider user={user}>
        <PendingVerification />
      </AuthProvider>
    )
  }

  return (
    <AuthProvider user={user}>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  )
}
