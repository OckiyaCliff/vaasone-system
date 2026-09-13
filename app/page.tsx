import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowRight,
  Building2,
  Code2,
  Database,
  ExternalLink,
  Lock,
  ShieldCheck,
  User,
  Zap,
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { ThemeToggle } from '@/components/theme-toggle'
import { LandingVerifySearch } from '@/components/landing-verify-search'
import {
  WireframeCoil,
  WireframeSpherePedestal,
  WireframeFloatingCubes,
  WireframeSteppedBlock,
  WireframeCluster,
} from '@/components/landing-wireframes'
import { APP_NAME } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-[#ededef] dark:bg-[#0f0f12] text-[#111113] dark:text-[#f3f3f5] selection:bg-black selection:text-white transition-colors duration-300 font-sans">
      {/* ── Transparent Top Header ──────────────────────────── */}
      {/* User requirement: "header background should be transparent" */}
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

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-medium tracking-tight text-neutral-600 dark:text-neutral-300">
            <Link
              href="/docs"
              className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              Docs
              <span className="rounded-full bg-black/5 dark:bg-white/10 px-1.5 py-0.2 text-[9px] font-mono font-normal">
                v1
              </span>
            </Link>
          </nav>

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

      {/* ── Main Container: The Bento Grid Presentation ─────── */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 pb-14 pt-0 sm:pt-1">
        {/* The Outer Frame / Canvas */}
        <div className="rounded-[28px] sm:rounded-[32px] bg-[#f7f7f9] dark:bg-[#141418] border border-black/[0.07] dark:border-white/[0.08] p-3 sm:p-5 shadow-lg">
          {/* ── 5-Card Bento Grid Layout Matching Reference ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
            {/* ═════════════════════════════════════════════════════
                LEFT COLUMN (Span 4):
                - Card 1: Tall Vertical Card (Institutional Services + Wireframe Coil + Pill Tags)
                - Card 4: Compact Stepped Card (Decentralized Trust + Stepped Geometry)
               ═════════════════════════════════════════════════════ */}
            <div className="lg:col-span-4 flex flex-col gap-3.5 sm:gap-4">
              {/* CARD 1: Tall Vertical Card */}
              <div
                id="services"
                className="group relative flex flex-col justify-between rounded-[22px] sm:rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1a1a20] p-4 sm:p-5 transition-all duration-300 hover:shadow-md hover:border-black/15 dark:hover:border-white/20"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#111113] dark:text-white">
                        Institutional Services
                      </h2>
                      <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                        Accredited credential issuance &amp; registry
                      </p>
                    </div>
                    <Link
                      href="/auth/sign-up"
                      aria-label="Institutional services"
                      className="rounded-full p-1 text-neutral-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors"
                    >
                      <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>

                  {/* Wireframe Coil Vector Illustration (compact) */}
                  <div className="my-3 sm:my-4 flex items-center justify-center">
                    <WireframeCoil className="w-32 h-36 sm:w-36 sm:h-40 text-neutral-400 dark:text-neutral-500 transition-all duration-500 group-hover:scale-105 group-hover:text-neutral-800 dark:group-hover:text-neutral-200" />
                  </div>
                </div>

                {/* Pill Tag Matrix */}
                <div className="pt-1">
                  <div className="flex flex-wrap gap-1.5 text-left">
                    {[
                      'Degree Certificates',
                      'Official Transcripts',
                      'Accredited Universities',
                      'Ministry of Education',
                      'SIS Integration',
                      'CSV & Excel Migration',
                      'Batch Anchoring',
                      'Instant Revocation',
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-neutral-200/90 dark:border-white/10 bg-[#f7f7f9] dark:bg-white/5 px-2.5 py-0.5 text-[10px] sm:text-[10.5px] font-medium text-neutral-700 dark:text-neutral-300 shadow-2xs hover:border-black/20 dark:hover:border-white/25 hover:bg-white dark:hover:bg-white/10 transition-colors cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD 4: Bottom-Left Stepped Block Card */}
              <div
                id="architecture"
                className="group relative flex flex-col sm:flex-row items-center justify-between gap-3 rounded-[22px] sm:rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1a1a20] p-3.5 sm:p-4 transition-all duration-300 hover:shadow-md hover:border-black/15 dark:hover:border-white/20"
              >
                <div className="flex-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Ledger Anchored
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[#111113] dark:text-white mt-0.5">
                    Decentralized Trust Architecture
                  </h3>
                  <p className="mt-1 text-[10.5px] text-neutral-500 dark:text-neutral-400 leading-snug">
                    0% student PII stored on-chain. Immutable SHA-256 state hashes anchored into Stellar consensus.
                  </p>
                </div>
                <div className="shrink-0 flex items-center justify-center">
                  <WireframeSteppedBlock className="w-20 h-20 sm:w-22 sm:h-22 text-neutral-500 dark:text-neutral-400 transition-all duration-500 group-hover:scale-105 group-hover:text-neutral-900 dark:group-hover:text-white" />
                </div>
              </div>
            </div>

            {/* ═════════════════════════════════════════════════════
                RIGHT COLUMN (Span 8):
                - Top Row: Card 2 (Public Verification) & Card 3 (Developer REST API)
                - Bottom Row: Card 5 (Large Feature Obsidian Dark Card with Search)
               ═════════════════════════════════════════════════════ */}
            <div className="lg:col-span-8 flex flex-col gap-3.5 sm:gap-4">
              {/* TOP ROW: Two Medium Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {/* CARD 2: Sphere Pedestal (Public Verification) */}
                <div className="group relative flex flex-col justify-between rounded-[22px] sm:rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1a1a20] p-4 sm:p-5 transition-all duration-300 hover:shadow-md hover:border-black/15 dark:hover:border-white/20">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#111113] dark:text-white">
                          Public Verification
                        </h2>
                        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                          Instant proof for employers &amp; embassies
                        </p>
                      </div>
                      <Link
                        href="#search"
                        aria-label="Public verification"
                        className="rounded-full p-1 text-neutral-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors"
                      >
                        <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </div>

                    {/* Wireframe Sphere Pedestal Vector Illustration (compact) */}
                    <div className="my-2 sm:my-3 flex items-center justify-center">
                      <WireframeSpherePedestal className="w-28 h-28 sm:w-32 sm:h-32 text-neutral-400 dark:text-neutral-500 transition-all duration-500 group-hover:scale-105 group-hover:text-neutral-800 dark:group-hover:text-neutral-200" />
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug border-t border-neutral-100 dark:border-white/5 pt-3">
                    Verify in <span className="font-semibold text-black dark:text-white">&lt; 350ms</span>. Zero registration or API keys needed for public validation.
                  </div>
                </div>

                {/* CARD 3: Floating Cubes (Developer & REST API) */}
                <div className="group relative flex flex-col justify-between rounded-[22px] sm:rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1a1a20] p-4 sm:p-5 transition-all duration-300 hover:shadow-md hover:border-black/15 dark:hover:border-white/20">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#111113] dark:text-white">
                          Developer REST API
                        </h2>
                        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                          Programmatic batch verification
                        </p>
                      </div>
                      <Link
                        href="/docs"
                        aria-label="Developer documentation"
                        className="rounded-full p-1 text-neutral-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors"
                      >
                        <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </div>

                    {/* Wireframe Floating Cubes Vector Illustration (compact) */}
                    <div className="my-2 sm:my-3 flex items-center justify-center">
                      <WireframeFloatingCubes className="w-28 h-28 sm:w-32 sm:h-32 text-neutral-400 dark:text-neutral-500 transition-all duration-500 group-hover:scale-105 group-hover:text-neutral-800 dark:group-hover:text-neutral-200" />
                    </div>
                  </div>

                  {/* Pill Tags */}
                  <div className="pt-1">
                    <div className="flex flex-wrap gap-1.5 text-left">
                      {['GET /verify', 'POST /batch', 'TypeScript', 'Python', 'OpenAPI', 'cURL'].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-neutral-200/90 dark:border-white/10 bg-[#f7f7f9] dark:bg-white/5 px-2 py-0.5 text-[10px] font-mono text-neutral-700 dark:text-neutral-300 shadow-2xs hover:border-black/20 dark:hover:border-white/25 hover:bg-white dark:hover:bg-white/10 transition-colors cursor-default"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 5: Large Feature Dark Obsidian Card with Live Search */}
              <div
                id="search"
                className="group relative flex-1 rounded-[22px] sm:rounded-[24px] border border-neutral-800 bg-[#0c0c0e] p-5 sm:p-6 text-white shadow-xl transition-all duration-300 hover:border-neutral-700 overflow-hidden"
              >
                {/* Subtle ambient lighting effect */}
                <div className="absolute -right-16 -top-16 size-60 rounded-full bg-white/[0.04] blur-3xl pointer-events-none" />
                <div className="absolute -left-16 -bottom-16 size-60 rounded-full bg-emerald-500/[0.03] blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  {/* Left Column: Headline, Description & Interactive Verification Search */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-white/90 backdrop-blur-xs">
                          <ShieldCheck className="size-2.5 text-emerald-400" />
                          Zero-Bureaucracy
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-white leading-tight">
                        Trust layer for academic &amp; institutional credentials.
                      </h2>

                      <p className="mt-2 text-[11px] sm:text-xs text-neutral-400 leading-relaxed max-w-lg">
                        Empowering employers and background checkers to verify degrees independently,{' '}
                        <span className="inline-block rounded-full bg-white text-black font-semibold px-2 py-0.2 text-[10.5px] mx-0.5 shadow-xs">
                          zero fees &amp; zero delays
                        </span>{' '}
                        directly on the public ledger.
                      </p>
                    </div>

                    {/* Integrated Live Verification Search Engine */}
                    <div className="mt-4">
                      <LandingVerifySearch variant="dark" />
                    </div>

                    {/* Network Badges */}
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-neutral-400 border-t border-white/10 pt-3">
                      <div className="flex items-center gap-1.5">
                        <div className="size-1.5 rounded-full bg-emerald-400" />
                        <span className="font-mono text-neutral-300">Stellar Consensus</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="size-1.5 rounded-full bg-blue-400" />
                        <span className="font-mono text-neutral-300">SHA-256 Immutability</span>
                      </div>
                      <Link
                        href="/docs"
                        className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors ml-auto"
                      >
                        Specs <ExternalLink className="size-2.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Wireframe Cluster Graphic */}
                  <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-between h-full">
                    <div className="w-full flex justify-end">
                      <Link
                        href="#search"
                        aria-label="Direct ledger search"
                        className="rounded-full p-1.5 text-white/40 group-hover:text-white transition-colors"
                      >
                        <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </div>

                    <div className="my-1 sm:my-2">
                      <WireframeCluster className="w-44 h-44 sm:w-52 sm:h-52 text-white/80 transition-all duration-700 group-hover:scale-105 group-hover:text-white" />
                    </div>

                    <div className="w-full flex justify-end items-center gap-1.5 text-neutral-500">
                      <span className="text-[9.5px] font-mono">Consensus Cluster v2.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Informative Architecture & Capabilities Section ── */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Pillar 1 */}
          <div className="rounded-[22px] border border-black/[0.06] dark:border-white/[0.08] bg-[#f7f7f9] dark:bg-[#141418] p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="grid size-8 place-items-center rounded-xl bg-black dark:bg-white text-white dark:text-black font-mono font-bold text-xs mb-3 shadow-2xs">
                01
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#111113] dark:text-white">
                Accredited Issuance
              </h3>
              <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Verified universities and awarding bodies issue certificates individually or migrate historical records seamlessly via CSV &amp; Excel bulk import wizards.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center gap-1.5 text-[10px] text-neutral-400">
              <Building2 className="size-3" />
              <span>Admin-vetted institutions</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-[22px] border border-black/[0.06] dark:border-white/[0.08] bg-[#f7f7f9] dark:bg-[#141418] p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="grid size-8 place-items-center rounded-xl bg-black dark:bg-white text-white dark:text-black font-mono font-bold text-xs mb-3 shadow-2xs">
                02
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#111113] dark:text-white">
                Ledger Anchoring
              </h3>
              <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                A cryptographic SHA-256 canonical hash of the student&apos;s degree is permanently anchored on the Stellar distributed ledger. Zero personal student data on-chain.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center gap-1.5 text-[10px] text-neutral-400">
              <Lock className="size-3" />
              <span>Tamper-evident cryptography</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-[22px] border border-black/[0.06] dark:border-white/[0.08] bg-[#f7f7f9] dark:bg-[#141418] p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="grid size-8 place-items-center rounded-xl bg-black dark:bg-white text-white dark:text-black font-mono font-bold text-xs mb-3 shadow-2xs">
                03
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#111113] dark:text-white">
                Frictionless Verification
              </h3>
              <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Employers, embassies, and recruiters verify instantly in milliseconds via the public search above, QR certificate scanning, or our developer REST API.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center gap-1.5 text-[10px] text-neutral-400">
              <Zap className="size-3" />
              <span>No login or fees required</span>
            </div>
          </div>
        </div>

        {/* ── Developer Integration & cURL Box ────────────────── */}
        <div className="mt-3.5 rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] bg-[#f7f7f9] dark:bg-[#141418] p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-0.5 text-[10px] font-mono text-neutral-700 dark:text-neutral-300 mb-2.5">
                <Code2 className="size-2.5" /> External Integration API
              </span>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#111113] dark:text-white">
                Integrate Credential Verification Into Any Enterprise Stack
              </h3>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                HR portals, recruitment agencies, and immigration authorities can integrate directly into Vaasone.
                Verify single credentials or batch check hundreds of graduate records programmatically.
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-1.5 rounded-full bg-black dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-black hover:opacity-90 transition-all shadow-2xs"
                >
                  View Full API Specs <ArrowRight className="size-3" />
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 px-4 py-2 text-xs font-semibold text-[#111113] dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors shadow-2xs"
                >
                  Register Institution
                </Link>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="lg:col-span-6 rounded-xl border border-black/10 dark:border-white/10 bg-[#0e0e11] text-white overflow-hidden shadow-lg text-left">
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-mono text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-red-400/80" />
                  <span className="size-2 rounded-full bg-yellow-400/80" />
                  <span className="size-2 rounded-full bg-green-400/80" />
                  <span className="ml-1 text-white font-medium text-[10px]">verify.sh</span>
                </div>
                <span className="text-[10px]">REST API</span>
              </div>
              <div className="p-3.5 font-mono text-[10.5px] overflow-x-auto space-y-2">
                <div className="text-neutral-500"># Verify a credential via public endpoint</div>
                <div className="text-white">
                  <span className="text-purple-400">curl</span> -X GET \
                  <br />
                  &nbsp;&nbsp;&quot;https://vaasone-system.vercel.app/api/v1/verify?id=VAAS-UNILAG-2026-001&quot;
                </div>
                <div className="text-neutral-500 pt-1"># Response (200 OK)</div>
                <pre className="text-[10px] text-neutral-300 leading-tight">
                  {`{
  "outcome": "valid",
  "blockchain_verified": true,
  "credential": {
    "credential_id": "VAAS-UNILAG-2026-001",
    "recipient_name": "Amina Bello",
    "programme": "B.Sc Computer Science",
    "organization": { "name": "University of Lagos" }
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
        </div>

        {/* ── Call To Action for Institutions ────────────────── */}
        <div className="mt-3.5 rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] bg-[#f7f7f9] dark:bg-[#141418] p-5 sm:p-8 text-center">
          <div className="grid size-10 place-items-center rounded-xl bg-black dark:bg-white text-white dark:text-black mx-auto mb-3 shadow-2xs">
            <Database className="size-5" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#111113] dark:text-white">
            Are you an Accredited Academic Institution?
          </h2>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Join forward-thinking universities and examination bodies protecting their graduates. Migrate legacy student records via our bulk import wizard and eliminate transcript fraud forever.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/auth/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-black dark:bg-white px-5 py-2.5 text-xs font-semibold text-white dark:text-black hover:opacity-90 transition-all shadow-md"
            >
              Register Your Institution <ArrowRight className="size-3" />
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 px-5 py-2.5 text-xs font-medium text-[#111113] dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors shadow-2xs"
            >
              Read Developer Specs
            </Link>
          </div>
          <p className="mt-3 text-[10px] text-neutral-400 dark:text-neutral-500">
            All institution onboarding accounts are reviewed and authenticated by Vaasone administrators.
          </p>
        </div>
      </main>

      {/* ── Transparent Minimalist Footer ───────────────────── */}
      <footer className="w-full bg-transparent border-t border-black/[0.06] dark:border-white/[0.08] py-6 px-4 sm:px-6 text-[11px] text-neutral-500 dark:text-neutral-400">
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
