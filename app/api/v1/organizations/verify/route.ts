import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { setOrganizationVerified } from '@/lib/vaas-repository'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isSystemAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Only system administrators can verify institutions.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { organizationId, isVerified = true } = body

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required.' }, { status: 400 })
    }

    const updated = await setOrganizationVerified(organizationId, Boolean(isVerified))
    return NextResponse.json({ success: true, organization: updated })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update institution verification state.' },
      { status: 500 }
    )
  }
}
