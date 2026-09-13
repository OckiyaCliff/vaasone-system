import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, institutionName, country = 'Nigeria', email } = body

    if (!userId || !institutionName) {
      return NextResponse.json(
        { error: 'userId and institutionName are required.' },
        { status: 400 }
      )
    }

    const service = createServiceClient()

    // 1. Verify user exists in auth.users
    const { data: userData, error: userError } = await service.auth.admin.getUserById(userId)
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 })
    }

    // 2. Generate slug
    const baseSlug = institutionName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'inst'
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`

    // 3. Create unverified organization
    const { data: newOrg, error: orgError } = await service
      .from('organizations')
      .insert({
        name: institutionName.trim(),
        slug: uniqueSlug,
        type: 'university',
        country: country.trim(),
        settings: { is_verified: false },
      })
      .select()
      .single()

    if (orgError) {
      return NextResponse.json(
        { error: `Could not register institution: ${orgError.message}` },
        { status: 500 }
      )
    }

    // 4. Link user to organization as 'admin'
    const { error: linkError } = await service.from('institution_users').insert({
      user_id: userId,
      organization_id: newOrg.id,
      role: 'admin',
    })

    if (linkError) {
      return NextResponse.json(
        { error: `Could not link user to institution: ${linkError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      organization: newOrg,
      message: 'Institution registered. Pending admin verification.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal registration error.' },
      { status: 500 }
    )
  }
}
