import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { assignUserToOrganization } from '@/lib/vaas-repository'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, organizationId, role } = body

    if (!userId || !organizationId || !role) {
      return NextResponse.json({ error: 'Missing required parameters (userId, organizationId, role)' }, { status: 400 })
    }

    // Only system_admin or admin of that organization can assign roles
    const canAssign = user.isSystemAdmin || (user.role === 'institution_admin' && user.organizationId === organizationId)
    if (!canAssign) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges to assign users' }, { status: 403 })
    }

    const membership = await assignUserToOrganization({
      userId,
      organizationId,
      role: role as 'admin' | 'operator' | 'viewer',
    })

    // Sync role to Supabase Auth user metadata
    try {
      const service = (await import('@/lib/supabase/service')).createServiceClient()
      await service.auth.admin.updateUserById(userId, {
        app_metadata: { role },
        user_metadata: { role },
      })
    } catch {
      // Non-blocking if auth metadata sync fails
    }

    return NextResponse.json({ membership, success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to assign user' }, { status: 500 })
  }
}
