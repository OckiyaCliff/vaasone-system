'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Network, Building2, CheckCircle2, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/constants'

export default function SignUpPage() {
  const router = useRouter()
  const [institutionName, setInstitutionName] = useState('')
  const [country, setCountry] = useState('Nigeria')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage('')

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            institution_name: institutionName,
            country: country,
            full_name: institutionName,
          },
        },
      })

      if (error) {
        setMessage(
          error.message.toLowerCase().includes('password')
            ? 'Use a stronger password (min 8 characters).'
            : error.message || 'Unable to register this account.'
        )
        setIsSuccess(false)
        setPending(false)
        return
      }

      if (data.user?.id) {
        // Register the unverified institution organization
        try {
          await fetch('/api/v1/auth/register-institution', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id,
              institutionName,
              country,
              email,
            }),
          })
        } catch {
          // If secondary registration call fails, user can still be linked on callback
        }
      }

      setMessage(
        'Institution registration submitted! Please confirm your email address, then sign in. Your institution will be reviewed by an administrator for verification.'
      )
      setIsSuccess(true)
    } catch (err: any) {
      setMessage(err.message || 'An unexpected error occurred.')
      setIsSuccess(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-v-bg p-5 text-v-text">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-[28px] bg-v-surface p-8 sm:p-10 shadow-[var(--v-shadow)] border border-v-border"
      >
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-v-accent text-v-accent-fg">
              <Network className="size-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-v-muted-text">
              {APP_NAME}.trust
            </span>
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-v-text">
            Register Institution
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-v-secondary">
            Join the decentralized academic credential registry. New accounts are registered as institutions pending admin verification.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-xs font-semibold text-v-text">
            Institution / University Name
            <input
              required
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="e.g. University of Lagos"
              className="mt-1.5 w-full rounded-xl border border-v-border bg-v-white dark:bg-v-raised px-3.5 py-2.5 text-sm text-v-text outline-none placeholder:text-v-ghost focus:border-v-accent"
            />
          </label>

          <label className="text-xs font-semibold text-v-text">
            Country
            <input
              required
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Nigeria, Ghana, Kenya"
              className="mt-1.5 w-full rounded-xl border border-v-border bg-v-white dark:bg-v-raised px-3.5 py-2.5 text-sm text-v-text outline-none placeholder:text-v-ghost focus:border-v-accent"
            />
          </label>

          <label className="text-xs font-semibold text-v-text">
            Official Institutional Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="registrar@university.edu"
              className="mt-1.5 w-full rounded-xl border border-v-border bg-v-white dark:bg-v-raised px-3.5 py-2.5 text-sm text-v-text outline-none placeholder:text-v-ghost focus:border-v-accent"
            />
          </label>

          <label className="text-xs font-semibold text-v-text">
            Password (min 8 characters)
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-v-border bg-v-white dark:bg-v-raised px-3.5 py-2.5 text-sm text-v-text outline-none placeholder:text-v-ghost focus:border-v-accent"
            />
          </label>
        </div>

        {/* Verification Note */}
        <div className="mt-5 rounded-xl border border-v-border bg-v-raised p-3.5 text-xs text-v-secondary flex items-start gap-2.5">
          <ShieldAlert className="size-4 text-v-text shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-v-text font-semibold">Institutional Review:</strong> All new issuer accounts undergo accreditation verification by Vaasone system administrators before credentials can be issued.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className={`mt-4 rounded-xl p-3 text-xs leading-relaxed ${
              isSuccess
                ? 'bg-v-success-bg text-v-success flex items-start gap-2'
                : 'bg-v-error-bg text-v-error'
            }`}
          >
            {isSuccess && <CheckCircle2 className="size-4 shrink-0 mt-0.5" />}
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-xl bg-v-accent px-4 py-3 text-sm font-semibold text-v-accent-fg transition-all hover:bg-v-accent-hover disabled:opacity-50"
        >
          {pending ? <Loader2 className="mx-auto size-4 animate-spin" /> : 'Submit Registration'}
        </button>

        <p className="mt-4 text-center text-xs text-v-tertiary">
          Already registered?{' '}
          <Link href="/auth/login" className="font-semibold text-v-text hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  )
}
