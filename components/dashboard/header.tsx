'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, Plus, Search } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { useAuth } from '@/components/auth-provider'

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/credentials': 'Credentials Registry',
  '/verify': 'Verify Credential',
  '/institutions': 'Institutions & Network',
  '/institutions/connect': 'Connect SIS',
  '/activity': 'Activity & Audit Log',
}

export function Header({
  search,
  onSearchChange,
  onMenuOpen,
}: {
  search: string
  onSearchChange: (value: string) => void
  onMenuOpen: () => void
}) {
  const pathname = usePathname()
  const { user } = useAuth()
  const title = pageTitles[pathname] ?? 'Dashboard'
  const breadcrumb = pathname === '/' ? 'Overview' : title

  const firstName = user.displayName.split(' ')[0] || APP_NAME
  const canIssue = user.role === 'system_admin' || user.role === 'institution_admin' || user.role === 'institution_operator'

  return (
    <header className="flex h-[76px] items-center justify-between border-b border-v-border px-5 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 hover:bg-v-hover lg:hidden"
          onClick={onMenuOpen}
          aria-label="Open navigation"
        >
          <Menu className="size-5 text-v-text" />
        </button>
        <div>
          <p className="text-[11px] text-v-muted-text">Workspace / {breadcrumb}</p>
          <h1 className="text-lg font-semibold tracking-[-0.04em] text-v-text">
            {pathname === '/' ? `Good morning, ${firstName}` : title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-xl border border-v-border bg-v-inset px-3 py-2 sm:flex">
          <Search className="size-3.5 text-v-faint" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search records"
            className="w-28 bg-transparent text-xs text-v-text outline-none placeholder:text-v-faint focus:w-40 transition-all"
          />
        </div>
        {canIssue && (
          <Link
            href="/issuer/issue"
            className="flex items-center gap-2 rounded-xl bg-v-accent px-3.5 py-2.5 text-xs font-semibold text-v-accent-fg transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Issue credential</span>
          </Link>
        )}
      </div>
    </header>
  )
}
