import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { provisionInstitutionUser } from '@/lib/vaas-repository'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { organizationId, email, password, fullName, role } = body

    if (!organizationId || !email) {
      return NextResponse.json({ error: 'organizationId and email are required' }, { status: 400 })
    }

    // Security check: Only system_admin or institution_admin of that org can provision users
    const isSysAdmin = user.isSystemAdmin
    const isTenantAdmin = user.organizationId === organizationId && user.role === 'institution_admin'

    if (!isSysAdmin && !isTenantAdmin) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to provision users for this institution' }, { status: 403 })
    }

    const provisionedUser = await provisionInstitutionUser({
      email,
      password,
      fullName: fullName || email.split('@')[0],
      organizationId,
      role: role || 'operator',
    })

    return NextResponse.json({
      success: true,
      user: provisionedUser,
      message: `User ${provisionedUser.email} successfully provisioned as ${provisionedUser.role}.`,
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to provision institutional user' }, { status: 500 })
  }
}
