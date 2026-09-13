'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [search, setSearch] = useState('')

  return (
    <main className="h-screen w-screen overflow-hidden bg-v-bg p-2 sm:p-3 lg:p-4 text-v-text flex flex-col">
      <div className="mx-auto flex h-full w-full max-w-[1540px] overflow-hidden rounded-[22px] lg:rounded-[28px] bg-v-surface shadow-[var(--v-shadow)] border border-v-border">
        {/* Fixed Sidebar */}
        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        {/* Fixed Header + Scrollable Content Area */}
        <section className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
          <Header search={search} onSearchChange={setSearch} onMenuOpen={() => setMobileNavOpen(true)} />
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}
