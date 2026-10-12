'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Loader2, Sparkles } from 'lucide-react'

export function HeroVerifySearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = (e?: React.FormEvent, customValue?: string) => {
    if (e) e.preventDefault()
    const target = (customValue ?? query).trim()
    if (!target) return

    setLoading(true)
    // Catch-all route /v/[[...id]] resolves both slashed and unslashed IDs
    router.push(`/v/${target}`)
  }

  return (
    <div className="flex flex-col gap-2.5">
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] p-2 backdrop-blur-md focus-within:border-white/40 transition-all max-w-xl shadow-lg"
      >
        <Search className="size-4 text-neutral-400 ml-2 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Credential ID or Matric No (e.g. APEX/2020/ME/0118)..."
          className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-neutral-500 outline-none font-mono"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Verify</span>
              <ArrowRight className="size-3" />
            </>
          )}
        </button>
      </form>

      {/* Quick sample chips for instant 1-click test */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-neutral-400">
        <span className="flex items-center gap-1 font-mono text-neutral-400 text-[10px] uppercase tracking-wider">
          <Sparkles className="size-3 text-amber-400/80" />
          Test Credentials:
        </span>
        <button
          type="button"
          onClick={() => {
            setQuery('APEX/2020/ME/0118')
            handleSearch(undefined, 'APEX/2020/ME/0118')
          }}
          className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2 py-0.5 font-mono text-neutral-300 hover:text-white transition-all text-[11px] cursor-pointer"
        >
          APEX/2020/ME/0118
        </button>
        <button
          type="button"
          onClick={() => {
            setQuery('APEX/2021/PIL/0101')
            handleSearch(undefined, 'APEX/2021/PIL/0101')
          }}
          className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2 py-0.5 font-mono text-neutral-300 hover:text-white transition-all text-[11px] cursor-pointer"
        >
          APEX/2021/PIL/0101
        </button>
        <button
          type="button"
          onClick={() => {
            setQuery('VAAS-APEX-UNI-2024-CS0042')
            handleSearch(undefined, 'VAAS-APEX-UNI-2024-CS0042')
          }}
          className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2 py-0.5 font-mono text-neutral-300 hover:text-white transition-all text-[11px] cursor-pointer"
        >
          VAAS-APEX-UNI-2024-CS0042
        </button>
      </div>
    </div>
  )
}
