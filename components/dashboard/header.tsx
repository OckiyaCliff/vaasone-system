'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, Plus, Search } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/credentials': 'Credentials',
  '/verify': 'Verify credential',
  '/institutions': 'Institutions',
  '/institutions/connect': 'Connect SIS',
  '/activity': 'Activity log',
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
  const title = pageTitles[pathname] ?? 'Dashboard'
  const breadcrumb = pathname === '/' ? 'Overview' : title

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
            {pathname === '/' ? `Good morning, ${APP_NAME}` : title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-xl border border-v-border bg-v-white-50 px-3 py-2 sm:flex">
          <Search className="size-3.5 text-v-faint" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search records"
            className="w-28 bg-transparent text-xs text-v-text outline-none placeholder:text-v-faint"
          />
        </div>
        <Link
          href="/verify"
          className="flex items-center gap-2 rounded-xl bg-v-accent px-3 py-2.5 text-xs font-semibold text-v-accent-fg transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-3.5" />
          <span className="hidden sm:inline">Issue credential</span>
        </Link>
      </div>
    </header>
  )
}
