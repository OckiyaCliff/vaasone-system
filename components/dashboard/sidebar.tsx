'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity as ActivityIcon,
  ArrowUpRight,
  Blocks,
  FileCheck2,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Network,
  ShieldCheck,
  University,
  X,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { APP_NAME } from '@/lib/constants'
import { useAuth } from '@/components/auth-provider'

type NavItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
  roles?: string[]
}

const allNavItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Credentials',
    href: '/credentials',
    icon: FileCheck2,
    roles: ['system_admin', 'institution_admin', 'institution_operator', 'student'],
  },
  {
    label: 'Import data',
    href: '/import',
    icon: FileSpreadsheet,
    roles: ['system_admin', 'institution_admin'],
  },
  { label: 'Verify credential', href: '/verify', icon: ShieldCheck },
  {
    label: 'Institutions',
    href: '/institutions',
    icon: University,
    roles: ['system_admin', 'institution_admin', 'institution_operator'],
  },
  {
    label: 'Activity log',
    href: '/activity',
    icon: ActivityIcon,
    roles: ['system_admin', 'institution_admin', 'institution_operator'],
  },
]

function formatRoleName(role: string): string {
  switch (role) {
    case 'system_admin':
      return 'System Administrator'
    case 'institution_admin':
      return 'Institution Admin'
    case 'institution_operator':
      return 'Operator'
    case 'verifier':
      return 'Verifier'
    case 'student':
      return 'Student / Holder'
    default:
      return 'Member'
  }
}

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const visibleNavItems = allNavItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(user.role)
  })

  return (
    <aside
      className={`${
        mobileOpen ? 'fixed inset-3 z-50 flex shadow-2xl rounded-2xl' : 'hidden'
      } flex-col border-v-border bg-v-surface p-5 lg:flex lg:w-[240px] lg:shrink-0 lg:border-r lg:p-6 h-full overflow-y-auto`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-left" aria-label="Go to overview">
          <span className="grid size-8 place-items-center rounded-xl bg-v-accent text-v-accent-fg">
            <Network className="size-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.03em] text-v-text">
            {APP_NAME}<span className="font-normal text-v-tertiary">.trust</span>
          </span>
        </Link>
        <button className="rounded-lg p-2 lg:hidden" onClick={onClose} aria-label="Close navigation">
          <X className="size-4 text-v-text" />
        </button>
      </div>

      {/* Navigation */}
      <div className="mt-10 flex flex-1 flex-col">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-v-faint">
          Workspace
        </p>
        <nav className="flex flex-col gap-1" aria-label="Primary navigation">
          {visibleNavItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${
                  active
                    ? 'bg-v-accent text-v-accent-fg font-medium'
                    : 'text-v-secondary hover:bg-v-hover hover:text-v-text'
                }`}
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Trust layer indicator */}
        <div className="mt-auto hidden rounded-2xl bg-v-raised p-4 lg:block">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-v-text">Trust layer</span>
            <span className="flex items-center gap-1 text-[10px] text-v-tertiary">
              <span className="size-1.5 rounded-full bg-v-success-dot animate-pulse" />
              Operational
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-v-secondary">
            <Blocks className="size-3.5 text-v-accent" />
            <span>Stellar &amp; BNB</span>
            <ArrowUpRight className="ml-auto size-3" />
          </div>
        </div>
      </div>

      {/* User + Theme + Sign Out */}
      <div className="mt-6 flex items-center gap-2.5 border-t border-v-border pt-5">
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-v-accent text-[11px] font-semibold text-v-accent-fg">
          {user.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-v-text">
            {user.displayName}
          </p>
          <p className="truncate text-[10px] text-v-muted-text">
            {user.organizationName || formatRoleName(user.role)}
          </p>
        </div>
        <ThemeToggle />
        <button
          onClick={() => signOut()}
          title="Sign out"
          aria-label="Sign out"
          className="rounded-lg p-1.5 text-v-faint hover:bg-v-hover hover:text-red-500 transition-colors"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  )
}
