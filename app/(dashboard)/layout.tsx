'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [search, setSearch] = useState('')

  return (
    <main className="min-h-screen bg-v-bg p-3 text-v-text sm:p-5 lg:p-7">
      <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-[1480px] grid-cols-1 overflow-hidden rounded-[28px] bg-v-surface shadow-[var(--v-shadow)] lg:grid-cols-[232px_1fr]">
        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <section className="min-w-0">
          <Header search={search} onSearchChange={setSearch} onMenuOpen={() => setMobileNavOpen(true)} />
          <div className="p-5 sm:p-8">{children}</div>
        </section>
      </div>
    </main>
  )
}
