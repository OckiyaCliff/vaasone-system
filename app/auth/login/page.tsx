'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message.toLowerCase().includes('confirm') ? 'Confirm your email before signing in.' : 'Invalid email or password.')
      setPending(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return <main className="grid min-h-screen place-items-center bg-[#d7d7d5] p-5 text-[#171717]"><form onSubmit={submit} className="w-full max-w-md rounded-[28px] bg-[#f5f5f3] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.13)]"><div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">Axiom.trust</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.07em]">Issuer workspace</h1><p className="mt-2 text-sm text-black/50">Sign in to issue and manage credentials.</p></div><div className="flex flex-col gap-4"><label className="text-xs font-semibold">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-black" /></label><label className="text-xs font-semibold">Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-black" /></label></div>{error && <p role="alert" className="mt-4 rounded-xl bg-[#f1dede] px-3 py-2 text-xs text-[#8a3f3f]">{error}</p>}<button disabled={pending} className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Signing in…' : 'Sign in'}</button><p className="mt-5 text-center text-xs text-black/45">Need an issuer account? Contact your Axiom administrator.</p></form></main>
}
