import Link from 'next/link'
import {
  Network,
  ShieldCheck,
  Code2,
  Building2,
  ArrowRight,
  Lock,
  Zap,
  Globe2,
  FileCheck2,
  ChevronRight,
  Database,
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { ThemeToggle } from '@/components/theme-toggle'
import { LandingVerifySearch } from '@/components/landing-verify-search'
import { APP_NAME } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-v-bg text-v-text flex flex-col selection:bg-v-accent selection:text-v-accent-fg">
      {/* ── Top Navigation Bar ──────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-v-border bg-v-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-left" aria-label="Vaasone home">
            <span className="grid size-8 place-items-center rounded-xl bg-v-accent text-v-accent-fg">
              <Network className="size-4" />
            </span>
            <span className="text-base font-semibold tracking-[-0.03em] text-v-text">
              {APP_NAME}<span className="font-normal text-v-tertiary">.trust</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-v-secondary">
            <Link href="#verify" className="hover:text-v-text transition-colors">
              Verify
            </Link>
            <Link href="/docs" className="hover:text-v-text transition-colors flex items-center gap-1">
              API Docs
              <span className="rounded bg-v-raised px-1.5 py-0.5 text-[10px] font-mono text-v-text">v1</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-v-accent px-4 py-2 text-xs font-semibold text-v-accent-fg transition-transform hover:-translate-y-0.5"
              >
                Dashboard
                <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="rounded-xl border border-v-border px-3.5 py-2 text-xs font-medium text-v-text hover:bg-v-hover transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="rounded-xl bg-v-accent px-3.5 py-2 text-xs font-semibold text-v-accent-fg transition-transform hover:-translate-y-0.5"
                >
                  Register Institution
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Hero Section ───────────────────────────────── */}
      <main className="flex-1">
        <section id="verify" className="relative px-5 py-16 sm:py-24 sm:px-8 text-center max-w-4xl mx-auto">
          {/* Tag badge */}


          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] text-v-text leading-[1.15] max-w-3xl mx-auto">
            Africa&apos;s Trust Layer for Academic &amp; Institutional Credentials
          </h1>

          <p className="mt-5 text-sm sm:text-base text-v-secondary max-w-2xl mx-auto leading-relaxed">
            Instant, cryptographic certificate verification for employers, embassies, and background checkers —
            <strong className="text-v-text font-semibold"> zero login required</strong>. Powered by immutable ledger anchoring on Stellar.
          </p>

          {/* Interactive Live Search Component */}
          <div className="mt-10">
            <LandingVerifySearch />
          </div>

          {/* Quick Metrics */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-v-border pt-8 text-left">
            <div className="rounded-xl border border-v-border bg-v-surface/60 p-4">
              <span className="block text-2xl font-bold tracking-tight text-v-text">&lt; 350ms</span>
              <span className="text-xs text-v-muted-text mt-1 block">Avg Verification Speed</span>
            </div>
            <div className="rounded-xl border border-v-border bg-v-surface/60 p-4">
              <span className="block text-2xl font-bold tracking-tight text-v-text">100%</span>
              <span className="text-xs text-v-muted-text mt-1 block">Public &amp; Fee-Free</span>
            </div>
            <div className="rounded-xl border border-v-border bg-v-surface/60 p-4">
              <span className="block text-2xl font-bold tracking-tight text-v-text">Stellar</span>
              <span className="text-xs text-v-muted-text mt-1 block">Consensus Protocol</span>
            </div>
            <div className="rounded-xl border border-v-border bg-v-surface/60 p-4">
              <span className="block text-2xl font-bold tracking-tight text-v-text">REST API</span>
              <span className="text-xs text-v-muted-text mt-1 block">External Integration</span>
            </div>
          </div>
        </section>

        {/* ── Architecture / How It Works ────────────────────── */}
        <section id="features" className="border-t border-v-border bg-v-surface/50 py-20 px-5 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-v-tertiary">
                Trust Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-v-text mt-2">
                Engineered for Integrity from University to Employer
              </h2>
              <p className="text-sm text-v-secondary mt-3">
                How Vaasone eliminates academic credential fraud without manual registrar phone calls or paper transcript delays.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="rounded-2xl border border-v-border bg-v-surface p-6 flex flex-col justify-between">
                <div>
                  <div className="grid size-10 place-items-center rounded-xl bg-v-raised text-v-text font-mono font-bold text-sm mb-4">
                    01
                  </div>
                  <h3 className="text-base font-semibold text-v-text">Accredited Issuance</h3>
                  <p className="mt-2 text-xs text-v-secondary leading-relaxed">
                    Verified universities and awarding bodies issue certificates individually or bulk-import legacy records via CSV/Excel.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-v-border flex items-center gap-2 text-xs text-v-muted-text">
                  <Building2 className="size-3.5" />
                  Admin-verified institutions
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-v-border bg-v-surface p-6 flex flex-col justify-between">
                <div>
                  <div className="grid size-10 place-items-center rounded-xl bg-v-raised text-v-text font-mono font-bold text-sm mb-4">
                    02
                  </div>
                  <h3 className="text-base font-semibold text-v-text">Ledger Anchoring</h3>
                  <p className="mt-2 text-xs text-v-secondary leading-relaxed">
                    A SHA-256 canonical hash of the student&apos;s award is permanently recorded on the Stellar distributed ledger. Zero student PII stored on-chain.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-v-border flex items-center gap-2 text-xs text-v-muted-text">
                  <Lock className="size-3.5" />
                  Tamper-evident cryptography
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-v-border bg-v-surface p-6 flex flex-col justify-between">
                <div>
                  <div className="grid size-10 place-items-center rounded-xl bg-v-raised text-v-text font-mono font-bold text-sm mb-4">
                    03
                  </div>
                  <h3 className="text-base font-semibold text-v-text">Frictionless Verification</h3>
                  <p className="mt-2 text-xs text-v-secondary leading-relaxed">
                    Employers and background checkers verify in milliseconds via the public web search, QR code scan, or our developer REST API.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-v-border flex items-center gap-2 text-xs text-v-muted-text">
                  <Zap className="size-3.5" />
                  No login or signup required
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── API Integration Section ────────────────────────── */}
        <section className="py-20 px-5 sm:px-8 border-t border-v-border">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-v-raised px-2.5 py-1 text-[11px] font-mono text-v-secondary mb-4">
                <Code2 className="size-3" /> External Integration API
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-v-text">
                Integrate Credential Verification Into Any Enterprise Stack
              </h2>
              <p className="mt-3 text-sm text-v-secondary leading-relaxed">
                HR portals, recruitment agencies, and immigration authorities can integrate directly into Vaasone.
                Verify single credentials or batch check hundreds of graduate references programmatically.
              </p>

              <div className="mt-6 space-y-3 text-xs text-v-secondary">
                <div className="flex items-center gap-2.5">
                  <div className="size-1.5 rounded-full bg-emerald-500" />
                  <span>Public single verification endpoint with zero API key requirement</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="size-1.5 rounded-full bg-emerald-500" />
                  <span>High-throughput batch verification (<code className="font-mono text-v-text">POST /api/v1/verify/batch</code>)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="size-1.5 rounded-full bg-emerald-500" />
                  <span>Returns cryptographic proof, issuing authority, and Stellar ledger transaction link</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-xl bg-v-accent px-5 py-3 text-xs font-semibold text-v-accent-fg hover:bg-v-accent-hover transition-colors"
                >
                  Read the API Documentation
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="rounded-2xl border border-v-border bg-v-surface overflow-hidden shadow-xl text-left">
              <div className="flex items-center justify-between border-b border-v-border bg-v-raised px-4 py-3 text-xs font-mono text-v-muted-text">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-red-400/80" />
                  <span className="size-2.5 rounded-full bg-yellow-400/80" />
                  <span className="size-2.5 rounded-full bg-green-400/80" />
                  <span className="ml-2 text-v-text font-medium">curl verify.sh</span>
                </div>
                <span>REST API</span>
              </div>
              <div className="p-5 font-mono text-xs overflow-x-auto space-y-3">
                <div className="text-v-muted-text"># Verify a credential via public endpoint</div>
                <div className="text-v-text">
                  <span className="text-purple-600 dark:text-purple-400">curl</span> -X GET \
                  <br />
                  &nbsp;&nbsp;&quot;https://vaasone-system.vercel.app/api/v1/verify?id=VAAS-UNILAG-2026-001&quot;
                </div>
                <div className="text-v-muted-text pt-2"># Response (200 OK)</div>
                <pre className="text-[11px] text-v-secondary leading-tight">
                  {`{
  "outcome": "valid",
  "blockchain_verified": true,
  "credential": {
    "credential_id": "VAAS-UNILAG-2026-001",
    "recipient_name": "Amina Bello",
    "programme": "B.Sc Computer Science",
    "organization": {
      "name": "University of Lagos"
    }
  },
  "anchor": {
    "network": "Stellar Network",
    "transaction_id": "90e2f5b863d043ff8e..."
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── Institution CTA Section ────────────────────────── */}
        <section id="institutions" className="border-t border-v-border bg-v-raised/40 py-20 px-5 sm:px-8 text-center">
          <div className="max-w-3xl mx-auto rounded-3xl border border-v-border bg-v-surface p-8 sm:p-12 shadow-xl">
            <div className="grid size-12 place-items-center rounded-2xl bg-v-raised text-v-text mx-auto mb-5">
              <Database className="size-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-v-text">
              Are you an Accredited Institution?
            </h2>
            <p className="mt-3 text-sm text-v-secondary leading-relaxed max-w-xl mx-auto">
              Join universities and professional bodies protecting their graduates. Migrate legacy student databases with our
              CSV &amp; Excel import wizard, anchor diplomas to the blockchain, and automate verifications.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/sign-up"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-v-accent px-6 py-3.5 text-xs font-semibold text-v-accent-fg hover:bg-v-accent-hover transition-colors shadow-md"
              >
                Register Your Institution
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/docs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-v-border bg-v-raised px-6 py-3.5 text-xs font-medium text-v-text hover:bg-v-hover transition-colors"
              >
                Developer Docs
              </Link>
            </div>

            <p className="mt-4 text-[11px] text-v-muted-text">
              All institution accounts are reviewed and verified by Vaasone administrators to ensure network authenticity.
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-v-border bg-v-surface py-10 px-5 sm:px-8 text-xs text-v-muted-text">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Network className="size-4 text-v-text" />
            <span className="font-semibold text-v-text">{APP_NAME}</span>
            <span>— Africa&apos;s Academic Credential Trust Layer</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/docs" className="hover:text-v-text transition-colors">
              API Documentation
            </Link>
            <Link href="/auth/login" className="hover:text-v-text transition-colors">
              Admin &amp; Institution Login
            </Link>
            <Link href="/auth/sign-up" className="hover:text-v-text transition-colors">
              Institution Signup
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
