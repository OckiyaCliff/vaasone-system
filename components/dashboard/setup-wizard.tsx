'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Globe2, Loader2 } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

export function SetupWizard({ userDisplayName }: { userDisplayName: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [type, setType] = useState('university')
  const [country, setCountry] = useState('Nigeria')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(val: string) {
    setName(val)
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, -1)) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-'))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          type,
          country: country.trim(),
          website: website.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create organization')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-6 sm:py-10">
      <div className="relative overflow-hidden rounded-[28px] bg-v-surface p-7 shadow-[var(--v-shadow)] sm:p-10 border border-v-border">
        {/* Glow badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-v-border bg-v-raised px-3 py-1 text-xs font-semibold text-v-accent">
          <Sparkles className="size-3.5" />
          First-time System Setup
        </div>

        <h1 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-[-0.06em] text-v-text">
          Welcome to {APP_NAME}, {userDisplayName}.
        </h1>
        <p className="mt-3 text-sm leading-6 text-v-secondary max-w-xl">
          Get started by setting up your first academic institution or issuing organization. This initializes your multi-tenant trust layer with Stellar & BNB blockchain anchoring capabilities.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-v-text">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. University of Lagos"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="mt-2 w-full rounded-xl border border-v-border bg-v-inset px-3.5 py-2.5 text-sm text-v-text outline-none transition focus:border-v-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-v-text">
                URL Identifier / Slug <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 flex items-center rounded-xl border border-v-border bg-v-inset px-3.5 py-2.5">
                <span className="text-xs text-v-faint mr-1 select-none">vaasone.org/</span>
                <input
                  required
                  type="text"
                  placeholder="unilag"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-transparent text-sm text-v-text outline-none focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-v-text">
                Organization Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-2 w-full rounded-xl border border-v-border bg-v-inset px-3.5 py-2.5 text-sm text-v-text outline-none transition focus:border-v-accent"
              >
                <option value="university">University / Higher Education</option>
                <option value="employer">Employer / Corporate Partner</option>
                <option value="government">Government Agency</option>
                <option value="professional_body">Professional Accreditation Body</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-v-text">
                Country
              </label>
              <input
                type="text"
                placeholder="e.g. Nigeria, Ghana, Kenya"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-2 w-full rounded-xl border border-v-border bg-v-inset px-3.5 py-2.5 text-sm text-v-text outline-none transition focus:border-v-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-v-text">
              Official Website <span className="text-xs font-normal text-v-faint">(Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://www.unilag.edu.ng"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="mt-2 w-full rounded-xl border border-v-border bg-v-inset px-3.5 py-2.5 text-sm text-v-text outline-none transition focus:border-v-accent"
            />
          </div>

          {/* Features preview */}
          <div className="mt-3 grid gap-3 rounded-2xl bg-v-raised p-4 sm:grid-cols-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="size-4 shrink-0 text-v-accent mt-0.5" />
              <div className="text-[11px] leading-4 text-v-secondary">
                <strong className="font-semibold text-v-text block">Instant Anchoring</strong>
                Stellar testnet & BNB ledger readiness.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Globe2 className="size-4 shrink-0 text-v-accent mt-0.5" />
              <div className="text-[11px] leading-4 text-v-secondary">
                <strong className="font-semibold text-v-text block">Public Verification</strong>
                Shareable QR code and cryptographic proof URLs.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Building2 className="size-4 shrink-0 text-v-accent mt-0.5" />
              <div className="text-[11px] leading-4 text-v-secondary">
                <strong className="font-semibold text-v-text block">Multi-Tenant Admin</strong>
                Assign operators and manage role permissions.
              </div>
            </div>
          </div>

          <button
            disabled={submitting}
            type="submit"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-v-accent py-3.5 text-sm font-semibold text-v-accent-fg shadow-md transition hover:opacity-95 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Initializing {name || 'Organization'}...
              </>
            ) : (
              <>
                Create Organization &amp; Launch Dashboard
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
