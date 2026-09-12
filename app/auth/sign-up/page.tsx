'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
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
    if (error) setMessage(error.message.toLowerCase().includes('password') ? 'Use a stronger password.' : 'Unable to create this account.')
    else setMessage('Account created. Confirm your email, then sign in.')
    setPending(false)
  }

  return <main className="grid min-h-screen place-items-center bg-[#d7d7d5] p-5 text-[#171717]"><form onSubmit={submit} className="w-full max-w-md rounded-[28px] bg-[#f5f5f3] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.13)]"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">Axiom.trust</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.07em]">Create issuer account</h1><p className="mt-2 text-sm text-black/50">Use a verified institutional email.</p><div className="mt-7 flex flex-col gap-4"><label className="text-xs font-semibold">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-black" /></label><label className="text-xs font-semibold">Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-black" /></label></div>{message && <p role="status" className="mt-4 rounded-xl bg-black/[0.05] px-3 py-2 text-xs">{message}</p>}<button disabled={pending} className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Creating…' : 'Create account'}</button><button type="button" onClick={() => router.push('/auth/login')} className="mt-3 w-full text-xs text-black/45">Back to sign in</button></form></main>
}
