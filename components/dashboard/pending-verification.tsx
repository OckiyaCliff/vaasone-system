'use client'

import { ShieldAlert, Clock, Building2, LogOut, CheckCircle2, ArrowRight } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'

export function PendingVerification() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-5">
      <div className="w-full max-w-xl rounded-3xl border border-v-border bg-v-surface p-8 sm:p-10 shadow-xl text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto mb-6">
          <Clock className="size-7 animate-pulse" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <ShieldAlert className="size-3.5" /> Verification Pending
        </span>

        <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-v-text">
          Awaiting Administrator Approval
        </h1>

        <p className="mt-3 text-sm text-v-secondary leading-relaxed">
          Welcome to Vaasone! Your institution, <strong className="text-v-text font-semibold">{user.organizationName || 'Your Institution'}</strong>, has been registered.
          To maintain network authenticity, an administrator must verify your accreditation before you can issue credentials or import student records.
        </p>

        {/* Multi-step progress indicator */}
        <div className="mt-8 rounded-2xl border border-v-border bg-v-raised p-5 text-left text-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid size-6 place-items-center rounded-full bg-emerald-500 text-white font-bold text-[10px]">
              ✓
            </div>
            <div>
              <span className="font-semibold text-v-text block">1. Account &amp; Institution Registered</span>
              <span className="text-v-muted-text text-[11px]">Completed for {user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid size-6 place-items-center rounded-full bg-amber-500 text-white font-bold text-[10px] animate-pulse">
              2
            </div>
            <div>
              <span className="font-semibold text-v-text block">2. Institutional Accreditation Review</span>
              <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium">In progress by Vaasone admins</span>
            </div>
          </div>

          <div className="flex items-center gap-3 opacity-60">
            <div className="grid size-6 place-items-center rounded-full border border-v-border bg-v-surface text-v-muted-text font-bold text-[10px]">
              3
            </div>
            <div>
              <span className="font-semibold text-v-text block">3. Cryptographic Issuance Active</span>
              <span className="text-v-muted-text text-[11px]">Full access to Stellar anchoring &amp; database migration</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-v-accent px-5 py-2.5 text-xs font-semibold text-v-accent-fg hover:bg-v-accent-hover transition-colors"
          >
            Check Status Again
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-v-border bg-v-surface px-5 py-2.5 text-xs font-medium text-v-text hover:bg-v-hover transition-colors"
          >
            <LogOut className="size-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
