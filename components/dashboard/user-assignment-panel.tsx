'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck, Shield, Check, Loader2, Users } from 'lucide-react'

export type PlatformUserItem = {
  id: string
  email: string
  displayName: string
  createdAt: string
  organizationId: string | null
  organizationName: string | null
  role: string
  membershipId: string | null
}

export type OrgOption = {
  id: string
  name: string
}

export function UserAssignmentPanel({
  users,
  organizations,
}: {
  users: PlatformUserItem[]
  organizations: OrgOption[]
}) {
  const router = useRouter()
  const [selectedOrgs, setSelectedOrgs] = useState<Record<string, string>>({})
  const [selectedRoles, setSelectedRoles] = useState<Record<string, 'admin' | 'operator' | 'viewer'>>({})
  const [savingUser, setSavingUser] = useState<string | null>(null)
  const [successUser, setSuccessUser] = useState<string | null>(null)
  const [errorUser, setErrorUser] = useState<string | null>(null)

  function handleOrgChange(userId: string, orgId: string) {
    setSelectedOrgs((prev) => ({ ...prev, [userId]: orgId }))
  }

  function handleRoleChange(userId: string, role: 'admin' | 'operator' | 'viewer') {
    setSelectedRoles((prev) => ({ ...prev, [userId]: role }))
  }

  async function handleAssign(userId: string) {
    const orgId = selectedOrgs[userId] || organizations[0]?.id
    const role = selectedRoles[userId] || 'operator'

    if (!orgId) return

    setSavingUser(userId)
    setErrorUser(null)

    try {
      const res = await fetch('/api/v1/organizations/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, organizationId: orgId, role }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign user')
      }

      setSuccessUser(userId)
      setTimeout(() => setSuccessUser(null), 3000)
      router.refresh()
    } catch (err: any) {
      setErrorUser(err.message || 'Failed to assign')
    } finally {
      setSavingUser(null)
    }
  }

  return (
    <section className="rounded-[24px] bg-v-overlay p-6 mt-6">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-v-muted-text">
            Access Control &amp; Membership
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-v-text flex items-center gap-2">
            <Users className="size-5 text-v-accent" />
            User Role Assignment
          </h3>
        </div>
        <span className="text-xs text-v-tertiary">
          System Admin: assign users to institution tenants manually
        </span>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl bg-v-inset p-8 text-center text-xs text-v-tertiary">
          No registered users found yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b border-v-border text-[10px] uppercase tracking-[0.12em] text-v-faint">
              <tr>
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Current Organization</th>
                <th className="pb-3 font-semibold">Current Role</th>
                <th className="pb-3 font-semibold">Assign Organization</th>
                <th className="pb-3 font-semibold">Assign Role</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSaving = savingUser === u.id
                const isSuccess = successUser === u.id
                const currentTargetOrg = selectedOrgs[u.id] ?? u.organizationId ?? organizations[0]?.id ?? ''
                const currentTargetRole = selectedRoles[u.id] ?? (u.role === 'admin' || u.role === 'operator' || u.role === 'viewer' ? u.role : 'operator')

                return (
                  <tr key={u.id} className="border-b border-v-border-light last:border-0">
                    <td className="py-3 font-semibold text-v-text">
                      {u.displayName}
                      <span className="mt-0.5 block text-[10px] font-mono font-normal text-v-muted-text">
                        {u.email}
                      </span>
                    </td>
                    <td className="py-3 text-v-secondary">
                      {u.organizationName || (
                        <span className="rounded-md bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-600 dark:text-yellow-400">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-v-tertiary font-mono capitalize">
                      {u.role}
                    </td>
                    <td className="py-3">
                      <select
                        disabled={organizations.length === 0}
                        value={currentTargetOrg}
                        onChange={(e) => handleOrgChange(u.id, e.target.value)}
                        className="rounded-lg border border-v-border bg-v-inset px-2.5 py-1.5 text-xs text-v-text outline-none focus:border-v-accent"
                      >
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3">
                      <select
                        value={currentTargetRole}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                        className="rounded-lg border border-v-border bg-v-inset px-2.5 py-1.5 text-xs text-v-text outline-none focus:border-v-accent"
                      >
                        <option value="operator">Operator (Issue/Revoke)</option>
                        <option value="admin">Institution Admin</option>
                        <option value="viewer">Viewer (Read-only)</option>
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        disabled={isSaving || organizations.length === 0}
                        onClick={() => handleAssign(u.id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          isSuccess
                            ? 'bg-v-success-bg text-v-success'
                            : 'bg-v-accent text-v-accent-fg hover:opacity-90 disabled:opacity-40'
                        }`}
                      >
                        {isSaving ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : isSuccess ? (
                          <>
                            <Check className="size-3" /> Assigned
                          </>
                        ) : (
                          <>
                            <UserCheck className="size-3" /> Save
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {errorUser && (
        <p className="mt-3 text-xs text-red-500">{errorUser}</p>
      )}
    </section>
  )
}
