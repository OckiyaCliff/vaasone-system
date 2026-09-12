'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity as ActivityIcon,
  ArrowUpRight,
  Blocks,
  FileCheck2,
  LayoutDashboard,
  MoreHorizontal,
  Network,
  ShieldCheck,
  University,
  X,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { APP_NAME } from '@/lib/constants'

type NavItem = { label: string; href: string; icon: typeof LayoutDashboard; badge?: string }

const navItems: NavItem[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Credentials', href: '/credentials', icon: FileCheck2, badge: '12.4k' },
  { label: 'Verify credential', href: '/verify', icon: ShieldCheck },
  { label: 'Institutions', href: '/institutions', icon: University },
  { label: 'Activity log', href: '/activity', icon: ActivityIcon },
]

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`${
        mobileOpen ? 'fixed inset-3 z-40 flex' : 'hidden'
      } flex-col border-v-border bg-v-surface p-5 lg:static lg:flex lg:border-r lg:p-6`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-left" aria-label="Go to overview">
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
          {navItems.map(({ label, href, icon: Icon, badge }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${
                  active
                    ? 'bg-v-accent text-v-accent-fg'
                    : 'text-v-secondary hover:bg-v-hover hover:text-v-text'
                }`}
              >
                <Icon className="size-4" />
                <span>{label}</span>
                {badge && (
                  <span className={`ml-auto text-[11px] ${active ? 'text-v-accent-fg/60' : 'text-v-ghost'}`}>
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Trust layer indicator */}
        <div className="mt-auto hidden rounded-2xl bg-v-raised p-4 lg:block">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-v-text">Trust layer</span>
            <span className="flex items-center gap-1 text-[10px] text-v-tertiary">
              <span className="size-1.5 rounded-full bg-v-success-dot" />
              Operational
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-v-secondary">
            <Blocks className="size-3.5" /> Stellar Network{' '}
            <ArrowUpRight className="ml-auto size-3" />
          </div>
        </div>
      </div>

      {/* User + Theme */}
      <div className="mt-6 flex items-center gap-3 border-t border-v-border pt-5">
        <div className="grid size-8 place-items-center rounded-full bg-v-accent text-[11px] font-semibold text-v-accent-fg">
          VO
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-v-text">{APP_NAME}</p>
          <p className="text-[10px] text-v-muted-text">Network administrator</p>
        </div>
        <ThemeToggle />
        <MoreHorizontal className="size-4 text-v-faint" />
      </div>
    </aside>
  )
}
