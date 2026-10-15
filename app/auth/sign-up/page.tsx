'use client'

import Link from 'next/link'
import { ArrowLeft, Network, ShieldCheck, Lock, Mail } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-v-bg p-5 text-v-text">
      <div className="w-full max-w-lg rounded-[28px] bg-v-surface p-8 sm:p-10 shadow-[var(--v-shadow)] border border-v-border">
        {/* Back to Landing Page Navigation */}
        <div className="mb-6 flex items-center justify-between border-b border-v-border pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-v-tertiary hover:text-v-text transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to landing page</span>
          </Link>
          <Link
            href="/"
            className="text-[11px] font-mono text-v-faint hover:text-v-accent transition-colors"
          >
            {APP_NAME}.trust
          </Link>
        </div>

        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-85 transition-opacity">
            <span className="grid size-7 place-items-center rounded-lg bg-v-accent text-v-accent-fg">
              <Network className="size-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-v-muted-text">
              {APP_NAME}.trust
            </span>
          </Link>
        </div>

        {/* Closed Registration Notice */}
        <div className="flex flex-col items-center text-center py-4">
          <div className="grid size-16 place-items-center rounded-2xl bg-v-accent/10 mb-5">
            <Lock className="size-7 text-v-accent" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-v-text">
            Registration Closed
          </h1>
          <p className="mt-3 text-sm text-v-secondary leading-relaxed max-w-sm">
            Public self-registration is not available. Institutional accounts are provisioned by system administrators to ensure accredited access only.
          </p>
        </div>

        {/* How to get access */}
        <div className="mt-6 rounded-xl border border-v-border bg-v-raised p-4 space-y-3">
          <h2 className="text-xs font-semibold text-v-text flex items-center gap-2">
            <ShieldCheck className="size-4 text-v-accent" />
            How to get access
          </h2>
          <ul className="text-xs text-v-secondary space-y-2.5 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-md bg-v-accent/10 text-v-accent text-[10px] font-bold mt-0.5">1</span>
              <span>Contact a <strong className="text-v-text">Vaasone system administrator</strong> with your institution&apos;s details and accreditation documents.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-md bg-v-accent/10 text-v-accent text-[10px] font-bold mt-0.5">2</span>
              <span>The admin will <strong className="text-v-text">verify and register</strong> your institution, then provision your admin login credentials.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-md bg-v-accent/10 text-v-accent text-[10px] font-bold mt-0.5">3</span>
              <span>You&apos;ll receive your <strong className="text-v-text">email and password</strong> to sign in and start issuing certificates.</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="mt-4 rounded-xl border border-v-border bg-v-raised p-3.5 flex items-center gap-3">
          <Mail className="size-4 text-v-accent shrink-0" />
          <div className="text-xs">
            <span className="text-v-secondary">Inquiries: </span>
            <a href="mailto:yaum.technologies@gmail.com" className="font-semibold text-v-text hover:text-v-accent transition-colors">
              yaum.technologies@gmail.com
            </a>
          </div>
        </div>

        {/* Sign in link */}
        <Link
          href="/auth/login"
          className="mt-6 w-full flex items-center justify-center rounded-xl bg-v-accent px-4 py-3 text-sm font-semibold text-v-accent-fg transition-all hover:bg-v-accent-hover"
        >
          Sign in to existing account
        </Link>

        <p className="mt-4 text-center text-xs text-v-tertiary">
          Already have credentials?{' '}
          <Link href="/auth/login" className="font-semibold text-v-text hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
