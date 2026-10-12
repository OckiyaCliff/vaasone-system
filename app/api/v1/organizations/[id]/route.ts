import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/v1/organizations/[id]
 * Admin-only: Delete or disconnect a tenant institution from the platform.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser().catch(() => null)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: orgId } = await params
    const action = request.nextUrl.searchParams.get('action') || 'delete'
    const service = createServiceClient()

    // Check the org exists
    const { data: org } = await service
      .from('organizations')
      .select('id, name, slug')
      .eq('id', orgId)
      .maybeSingle()

    if (!org) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 })
    }

    const isSystemAdmin = Boolean(user.isSystemAdmin)
    const isInstitutionAdmin = user.role === 'institution_admin' && user.organizationId === orgId

    if (action === 'delete') {
      if (!isSystemAdmin) {
        return NextResponse.json({ error: 'Forbidden — only system administrators can delete an institution' }, { status: 403 })
      }
    } else if (action === 'disconnect') {
      if (!isSystemAdmin && !isInstitutionAdmin) {
        return NextResponse.json({ error: 'Forbidden — insufficient privileges to disconnect this institution' }, { status: 403 })
      }
    }

    if (action === 'disconnect') {
      // Just remove SIS connection settings, keep the org
      const { data: currentOrg } = await service
        .from('organizations')
        .select('settings')
        .eq('id', orgId)
        .single()

      const settings = { ...(currentOrg?.settings || {}) }
      delete settings.sis_adapter
      delete settings.sis_endpoint
      delete settings.sis_last_sync
      settings.sis_connected = false

      const { error: updateErr } = await service
        .from('organizations')
        .update({ settings })
        .eq('id', orgId)

      if (updateErr) {
        throw new Error(`Failed to disconnect SIS: ${updateErr.message}`)
      }

      return NextResponse.json({
        success: true,
        action: 'disconnected',
        message: `SIS integration for "${org.name}" has been disconnected. Existing credentials remain securely anchored.`,
      })
    }

    // Full delete: Remove all related data safely respecting foreign keys
    const { data: creds } = await service
      .from('credentials')
      .select('id')
      .eq('organization_id', orgId)

    const credIds: string[] = (creds || []).map((c: any) => c.id)

    // Helper to chunk IDs to avoid URL / PostgREST payload limits with hundreds of records
    const chunkArray = <T>(arr: T[], size: number): T[][] => {
      const chunks: T[][] = []
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size))
      }
      return chunks
    }

    if (credIds.length > 0) {
      const chunks = chunkArray(credIds, 50)
      for (const chunk of chunks) {
        await service.from('verification_requests').delete().in('credential_id', chunk)
        await service.from('blockchain_anchors').delete().in('credential_id', chunk)
      }
    }

    await service.from('verification_requests').delete().eq('organization_id', orgId)

    // Delete credentials
    await service.from('credentials').delete().eq('organization_id', orgId)

    // Delete related integration and telemetry records
    await service.from('activity_events').delete().eq('organization_id', orgId)
    await service.from('sync_jobs').delete().eq('organization_id', orgId)
    await service.from('integrations').delete().eq('organization_id', orgId)
    await service.from('api_clients').delete().eq('organization_id', orgId)
    await service.from('institution_users').delete().eq('organization_id', orgId)

    // Delete the organization record
    const { error: delErr } = await service
      .from('organizations')
      .delete()
      .eq('id', orgId)

    if (delErr) {
      throw new Error(`Failed to delete institution record: ${delErr.message}`)
    }

    return NextResponse.json({
      success: true,
      action: 'deleted',
      message: `Institution "${org.name}" and all associated credentials have been permanently deleted.`,
      deletedCredentials: credIds.length,
    })
  } catch (err: any) {
    console.error('[Organization action error]:', err)
    return NextResponse.json({ error: err.message || 'Failed to manage institution' }, { status: 500 })
  }
}

/**
 * PATCH /api/v1/organizations/[id]
 * Admin-only: Update organization settings (verify, disconnect SIS, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser().catch(() => null)
    if (!user?.isSystemAdmin) {
      return NextResponse.json({ error: 'Forbidden — system admin only' }, { status: 403 })
    }

    const { id: orgId } = await params
    const body = await request.json().catch(() => ({}))
    const service = createServiceClient()

    const updateFields: Record<string, any> = {}
    if (body.name !== undefined) updateFields.name = body.name
    if (body.country !== undefined) updateFields.country = body.country
    if (body.website !== undefined) updateFields.website = body.website

    // Handle settings merge
    if (body.settings) {
      const { data: currentOrg } = await service
        .from('organizations')
        .select('settings')
        .eq('id', orgId)
        .single()

      updateFields.settings = { ...(currentOrg?.settings || {}), ...body.settings }
    }

    if (Object.keys(updateFields).length > 0) {
      const { error } = await service
        .from('organizations')
        .update(updateFields)
        .eq('id', orgId)

      if (error) throw new Error(error.message)
    }

    return NextResponse.json({ success: true, message: 'Institution updated successfully' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update institution' }, { status: 500 })
  }
}
