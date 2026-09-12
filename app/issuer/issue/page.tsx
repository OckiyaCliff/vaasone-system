'use client'

import { FormEvent, useState } from 'react'

export default function IssuePage() {
  const [form, setForm] = useState({ credentialId: '', recipientName: '', recipientEmail: '', program: '', institutionId: '' })
  const [result, setResult] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setResult('')
    const response = await fetch('/api/credentials/issue', { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': form.credentialId }, body: JSON.stringify(form) })
    const body = await response.json().catch(() => ({}))
    setResult(response.ok ? `Created ${body.credential?.credential_id || form.credentialId}. Status: ${body.credential?.status || 'pending'}.` : body.error || 'Issuance failed.')
    setPending(false)
  }
  function update(key: keyof typeof form, value: string) { setForm((current) => ({ ...current, [key]: value })) }
  return <main className="min-h-screen bg-[#d7d7d5] p-5 text-[#171717]"><div className="mx-auto max-w-2xl rounded-[28px] bg-[#f5f5f3] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.13)] sm:p-10"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">Axiom.trust / issuer</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.07em]">Issue credential</h1><p className="mt-3 text-sm leading-6 text-black/50">Authenticated issuers can create a pending credential record. It becomes verified only after a real Stellar anchor confirms.</p><form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2">{([['credentialId','Credential ID','AXM-2026-00001'],['recipientName','Recipient name','Amara Okafor'],['recipientEmail','Recipient email','amara@university.edu'],['program','Program','BSc Computer Science'],['institutionId','Institution ID','Paste Supabase institution UUID']] as const).map(([key,label,placeholder]) => <label key={key} className="text-xs font-semibold sm:col-span-2">{label}<input required={key !== 'recipientEmail'} value={form[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-black" /></label>)}<button disabled={pending} className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2">{pending ? 'Submitting…' : 'Submit issuance'}</button></form>{result && <p role="status" className="mt-5 rounded-xl bg-black/[0.05] px-4 py-3 text-sm">{result}</p>}</div></main>
}
