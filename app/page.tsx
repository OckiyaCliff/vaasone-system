import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowRight,
  ExternalLink,
  User,
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { ThemeToggle } from '@/components/theme-toggle'
import { LandingVerifySearch } from '@/components/landing-verify-search'
import {
  WireframeCoil,
  WireframeSpherePedestal,
  WireframeFloatingCubes,
  WireframeCluster,
} from '@/components/landing-wireframes'
import { APP_NAME } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-[#ededef] dark:bg-[#0f0f12] text-[#111113] dark:text-[#f3f3f5] selection:bg-black selection:text-white transition-colors duration-300 font-sans flex flex-col justify-between">
      {/* ── Transparent Top Header ──────────────────────────── */}
      <header className="relative z-50 w-full bg-transparent">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo with Bauhaus Soundwave Badge */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-left transition-opacity hover:opacity-85"
            aria-label="Vaasone home"
          >
            <div className="flex h-7 items-center gap-0.5 rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/10 px-2 shadow-2xs backdrop-blur-xs">
              <span className="h-3 w-[2px] rounded-full bg-black dark:bg-white transition-all group-hover:h-3.5" />
              <span className="h-4.5 w-[2px] rounded-full bg-black dark:bg-white transition-all group-hover:h-2.5" />
              <span className="h-2 w-[2px] rounded-full bg-black dark:bg-white transition-all group-hover:h-4" />
              <span className="h-3.5 w-[2px] rounded-full bg-black dark:bg-white transition-all group-hover:h-2" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold tracking-tight text-[#111113] dark:text-white">
                {APP_NAME}
              </span>
              <span className="text-[11px] font-mono font-medium text-neutral-500 dark:text-neutral-400">
                .trust
              </span>
            </div>
          </Link>



          {/* Right Action Button & Theme Toggle */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-[#111113] dark:text-white shadow-2xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
              >
                <User className="size-3" />
                Portal
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/10 px-3 py-1.5 text-xs font-medium text-[#111113] dark:text-white hover:bg-white dark:hover:bg-white/20 transition-colors shadow-2xs flex items-center gap-1"
                >
                  <User className="size-3 opacity-70" />
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="hidden sm:inline-flex items-center gap-1 rounded-full bg-black dark:bg-white px-3.5 py-1.5 text-xs font-semibold text-white dark:text-black hover:opacity-90 transition-all shadow-2xs"
                >
                  Register
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Area ──────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-center">
        {/* ── HERO SECTION: Trust layer for academic & institutional credentials. ── */}
        <section id="search" className="mx-auto w-full max-w-7xl px-3 sm:px-6 pt-1 sm:pt-2">
          <div className="relative overflow-hidden rounded-[26px] sm:rounded-[32px] border border-neutral-800/90 bg-[#0c0c0e] p-5 sm:p-8 lg:p-10 text-white shadow-2xl">
            {/* Subtle ambient lighting */}
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/[0.04] blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 size-80 rounded-full bg-emerald-500/[0.03] blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Left Column (Span 7): Badges, Title, Subtitle, Search Engine */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-mono font-medium text-white/90 backdrop-blur-xs border border-white/10">
                      <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live Stellar Ledger
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-mono text-neutral-400 border border-white/5">
                      Zero-Bureaucracy
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-[1.15]">
                    Trust layer for academic &amp; institutional credentials.
                  </h1>

                  <p className="mt-3 text-xs sm:text-sm text-neutral-300 dark:text-neutral-400 leading-relaxed max-w-xl">
                    Empowering employers, embassies, and background checkers to verify degrees independently,{' '}
                    <span className="inline-block rounded-full bg-white text-black font-semibold px-2.5 py-0.5 text-xs mx-0.5 shadow-xs">
                      zero fees &amp; zero delays
                    </span>{' '}
                    directly on the public ledger.
                  </p>
                </div>

                {/* Integrated Live Verification Search Engine */}
                <div className="mt-5 sm:mt-6">
                  <LandingVerifySearch variant="dark" />
                </div>

                {/* Network Trust Badges */}
                <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-4 text-[11px] text-neutral-400 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-emerald-400" />
                    <span className="font-mono text-neutral-200">Stellar Consensus</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-blue-400" />
                    <span className="font-mono text-neutral-200">SHA-256 Immutability</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-purple-400" />
                    <span className="font-mono text-neutral-200">0% Student PII On-chain</span>
                  </div>
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors ml-auto text-xs"
                  >
                    Specs <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>

              {/* Right Column (Span 5): Bauhaus 3D Cluster Illustration */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center p-2 sm:p-4">
                  <WireframeCluster className="w-52 h-52 sm:w-60 sm:h-60 lg:w-72 lg:h-72 text-white/85 transition-all duration-700 hover:scale-105 hover:text-white" />
                </div>
                <div className="mt-1 sm:mt-2 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                    Consensus Cluster • Cryptographic State Proofs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRIMMED DOWN ECOSYSTEM SECTION (3 Clean Cards) ── */}
        <section className="mx-auto w-full max-w-7xl px-3 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Card 1: Institutional Issuance */}
            <div
              id="services"
              className="group flex flex-col justify-between rounded-[22px] sm:rounded-[24px] border border-black/[0.07] dark:border-white/[0.08] bg-white dark:bg-[#16161b] p-4 sm:p-5 transition-all duration-300 hover:shadow-md hover:border-black/15 dark:hover:border-white/20"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      For Universities
                    </span>
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#111113] dark:text-white mt-0.5">
                      Accredited Issuance
                    </h2>
                  </div>
                  <Link
                    href="/auth/sign-up"
                    aria-label="Register institution"
                    className="rounded-full p-1 text-neutral-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors"
                  >
                    <ArrowUpRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>

                <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Issue tamper-proof certificates individually or bulk-migrate archives via CSV &amp; Excel wizards.
                </p>

                {/* Wireframe Coil Vector Illustration */}
                <div className="my-3 flex items-center justify-center">
                  <WireframeCoil className="w-24 h-28 sm:w-28 sm:h-32 text-neutral-400 dark:text-neutral-500 transition-all duration-500 group-hover:scale-105 group-hover:text-neutral-800 dark:group-hover:text-neutral-200" />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-white/5">
                <div className="flex flex-wrap gap-1.5 text-left mb-2.5">
                  {['Degrees', 'Transcripts', 'SIS Sync', 'Bulk CSV'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-neutral-200/90 dark:border-white/10 bg-[#f7f7f9] dark:bg-white/5 px-2 py-0.5 text-[10px] font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 dark:text-white hover:underline"
                >
                  Register Institution <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

            {/* Card 2: Public Verification */}
            <div className="group flex flex-col justify-between rounded-[22px] sm:rounded-[24px] border border-black/[0.07] dark:border-white/[0.08] bg-white dark:bg-[#16161b] p-4 sm:p-5 transition-all duration-300 hover:shadow-md hover:border-black/15 dark:hover:border-white/20">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      For Employers
                    </span>
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#111113] dark:text-white mt-0.5">
                      Instant Verification
                    </h2>
                  </div>
                  <Link
                    href="#search"
                    aria-label="Verify credential"
                    className="rounded-full p-1 text-neutral-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors"
                  >
                    <ArrowUpRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>

                <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Validate candidate authenticity in &lt;350ms. Zero fees, no account creation, no bureaucracy.
                </p>

                {/* Wireframe Sphere Pedestal Vector Illustration */}
                <div className="my-3 flex items-center justify-center">
                  <WireframeSpherePedestal className="w-24 h-24 sm:w-28 sm:h-28 text-neutral-400 dark:text-neutral-500 transition-all duration-500 group-hover:scale-105 group-hover:text-neutral-800 dark:group-hover:text-neutral-200" />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-white/5">
                <div className="flex flex-wrap gap-1.5 text-left mb-2.5">
                  {['< 350ms Speed', 'No Account', 'Direct QR', 'Immutable'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-neutral-200/90 dark:border-white/10 bg-[#f7f7f9] dark:bg-white/5 px-2 py-0.5 text-[10px] font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href="#search"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 dark:text-white hover:underline"
                >
                  Try Search Above <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

            {/* Card 3: Developer Platform */}
            <div
              id="developers"
              className="group flex flex-col justify-between rounded-[22px] sm:rounded-[24px] border border-black/[0.07] dark:border-white/[0.08] bg-white dark:bg-[#16161b] p-4 sm:p-5 transition-all duration-300 hover:shadow-md hover:border-black/15 dark:hover:border-white/20"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      For Developers
                    </span>
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#111113] dark:text-white mt-0.5">
                      Developer REST API
                    </h2>
                  </div>
                  <Link
                    href="/docs"
                    aria-label="Developer docs"
                    className="rounded-full p-1 text-neutral-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors"
                  >
                    <ArrowUpRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>

                <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Automate background checks with high-throughput REST APIs and batch verification endpoints.
                </p>

                {/* Wireframe Floating Cubes Vector Illustration */}
                <div className="my-3 flex items-center justify-center">
                  <WireframeFloatingCubes className="w-24 h-24 sm:w-28 sm:h-28 text-neutral-400 dark:text-neutral-500 transition-all duration-500 group-hover:scale-105 group-hover:text-neutral-800 dark:group-hover:text-neutral-200" />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-white/5">
                <div className="flex flex-wrap gap-1.5 text-left mb-2.5">
                  {['GET /verify', 'POST /batch', 'TypeScript', 'Python'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-neutral-200/90 dark:border-white/10 bg-[#f7f7f9] dark:bg-white/5 px-2 py-0.5 text-[10px] font-mono text-neutral-700 dark:text-neutral-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 dark:text-white hover:underline"
                >
                  Read API Specs <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Transparent Minimalist Footer ───────────────────── */}
      <footer className="w-full bg-transparent border-t border-black/[0.06] dark:border-white/[0.08] py-4 px-4 sm:px-6 text-[11px] text-neutral-500 dark:text-neutral-400">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111113] dark:text-white">{APP_NAME}</span>
            <span>— Africa&apos;s Academic Credential Trust Layer</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/docs" className="hover:text-black dark:hover:text-white transition-colors">
              API Docs
            </Link>
            <Link href="/auth/login" className="hover:text-black dark:hover:text-white transition-colors">
              Institution Portal
            </Link>
            <Link href="/auth/sign-up" className="hover:text-black dark:hover:text-white transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
