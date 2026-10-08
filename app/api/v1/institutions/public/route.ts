import { NextResponse } from 'next/server'
import { listPublicInstitutions } from '@/lib/vaas-repository'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/institutions/public
 * Public directory of participating and accredited universities/institutions
 * for search and verification dropdowns.
 */
export async function GET() {
  try {
    const institutions = await listPublicInstitutions()
    return NextResponse.json({
      success: true,
      institutions,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve institutions list' },
      { status: 500 }
    )
  }
}
