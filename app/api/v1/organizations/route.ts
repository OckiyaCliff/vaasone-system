import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createOrganization, listOrganizations } from '@/lib/vaas-repository'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const orgs = await listOrganizations()

    // If user is system administrator, return full list
    if (user?.isSystemAdmin) {
      return NextResponse.json({
        organizations: orgs,
        isSystemAdmin: true,
        userRole: user.role,
        userOrganizationId: user?.organizationId ?? null,
      })
    }

    // If user belongs to an institution, return ONLY their assigned institution
    if (user?.organizationId) {
      const assigned = orgs.filter((o) => o.id === user.organizationId)
      return NextResponse.json({
        organizations: assigned,
        isSystemAdmin: false,
        userRole: user.role,
        userOrganizationId: user.organizationId,
      })
    }

    // Otherwise return empty list if unassigned or unauthenticated
    return NextResponse.json({
      organizations: [],
      isSystemAdmin: false,
      userRole: user?.role ?? 'verifier',
      userOrganizationId: null,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list organizations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, type, country, website } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Organization name and slug are required' }, { status: 400 })
    }

    const orgs = await listOrganizations()
    const isFirstOrg = orgs.length === 0

    // Only system admins or first-time setup users can create organizations
    if (!isFirstOrg && !user.isSystemAdmin) {
      return NextResponse.json({ error: 'Only system administrators can create organizations' }, { status: 403 })
    }

    const newOrg = await createOrganization({
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      type: type || 'university',
      country: country || undefined,
      website: website || undefined,
      initialAdminUserId: user.id,
    })

    return NextResponse.json({ organization: newOrg }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create organization' }, { status: 500 })
  }
}
