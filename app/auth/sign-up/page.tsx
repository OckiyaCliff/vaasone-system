'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Network } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/constants'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage('')
    const { error } = await createClient().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setMessage(error.message.toLowerCase().includes('password') ? 'Use a stronger password (min 8 characters).' : 'Unable to create this account.')
      setIsSuccess(false)
    } else {
      setMessage('Account created. Confirm your email, then sign in.')
      setIsSuccess(true)
    }
    setPending(false)
  }

  return (
    <main className="grid min-h-screen place-items-center bg-v-bg p-5 text-v-text">
      <form onSubmit={submit} className="w-full max-w-md rounded-[28px] bg-v-surface p-8 shadow-[var(--v-shadow)]">
        <div className="mb-7">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-v-accent text-v-accent-fg">
              <Network className="size-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-v-muted-text">{APP_NAME}.trust</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.07em] text-v-text">Create issuer account</h1>
          <p className="mt-2 text-sm text-v-secondary">Use a verified institutional email.</p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-xs font-semibold text-v-text">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-v-border bg-v-white px-3 py-3 text-sm text-v-text outline-none placeholder:text-v-ghost focus:border-v-accent"
            />
          </label>
          <label className="text-xs font-semibold text-v-text">
            Password
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-v-border bg-v-white px-3 py-3 text-sm text-v-text outline-none placeholder:text-v-ghost focus:border-v-accent"
            />
          </label>
        </div>

        {message && (
          <p
            role="status"
            className={`mt-4 rounded-xl px-3 py-2 text-xs ${
              isSuccess ? 'bg-v-success-bg text-v-success' : 'bg-v-error-bg text-v-error'
            }`}
          >
            {message}
          </p>
        )}

        <button
          disabled={pending}
          className="mt-6 w-full rounded-xl bg-v-accent px-4 py-3 text-sm font-semibold text-v-accent-fg disabled:opacity-50"
        >
          {pending ? <Loader2 className="mx-auto size-4 animate-spin" /> : 'Create account'}
        </button>

        <p className="mt-4 text-center text-xs text-v-tertiary">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-v-text hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  )
}
