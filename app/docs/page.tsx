'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Network,
  ArrowLeft,
  ArrowRight,
  ClipboardCopy,
  Check,
  Terminal,
  Code2,
  CheckCircle2,
  ExternalLink,
  Shield,
  Key,
  Clock,
  Layers,
  Layers3,
  Database,
  Cpu,
  Server,
  Globe2,
  Zap,
  BookOpen,
  HelpCircle,
  FileCheck2,
  Play,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  Home,
  RefreshCw,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { APP_NAME } from '@/lib/constants'

type TabId = 'integration' | 'verification' | 'databases' | 'scaling' | 'diagnostics'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      title="Copy to clipboard"
      className="inline-flex items-center gap-1 rounded-lg border border-v-border bg-v-surface px-2 py-1 text-[10px] font-medium text-v-secondary hover:bg-v-hover transition-colors"
    >
      {copied ? <Check className="size-3 text-emerald-500" /> : <ClipboardCopy className="size-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function CodeBlock({ language, code, title }: { language: string; code: string; title?: string }) {
  return (
    <div className="rounded-xl border border-v-border bg-v-raised overflow-hidden">
      {title && (
        <div className="flex items-center justify-between border-b border-v-border px-4 py-2.5 bg-v-surface/60">
          <span className="text-[11px] font-semibold text-v-muted-text font-mono">{title}</span>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-v-surface px-2 py-0.5 text-[10px] font-mono text-v-tertiary">
              {language}
            </span>
            <CopyButton text={code} />
          </div>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed font-mono text-v-text selection:bg-v-accent selection:text-v-accent-fg">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-v-border bg-v-surface overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left text-xs font-semibold text-v-text hover:bg-v-hover transition-colors"
      >
        <span>{title}</span>
        {open ? <ChevronDown className="size-4 text-v-tertiary" /> : <ChevronRight className="size-4 text-v-tertiary" />}
      </button>
      {open && <div className="border-t border-v-border p-4 text-xs text-v-secondary leading-relaxed bg-v-raised/40">{children}</div>}
    </div>
  )
}

function DocsContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as TabId | null
  const [activeTab, setActiveTab] = useState<TabId>(tabParam || 'integration')

  // Diagnostic state
  const [pingResult, setPingResult] = useState<any>(null)
  const [pingLoading, setPingLoading] = useState(false)
  const [testSlug, setTestSlug] = useState('apex-university')
  const [testAction, setTestAction] = useState<'issue' | 'revoke' | 'batch_sync'>('issue')
  const [testResponse, setTestResponse] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    if (tabParam && ['integration', 'verification', 'databases', 'scaling', 'diagnostics'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const syncUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/v1/institutions/sync`
    : 'https://vaasone-system.vercel.app/api/v1/institutions/sync'

  async function handlePingGateway() {
    setPingLoading(true)
    try {
      const res = await fetch(`/api/v1/institutions/sync?slug=${encodeURIComponent(testSlug)}`)
      const data = await res.json()
      setPingResult({ ok: res.ok, status: res.status, data })
    } catch (err: any) {
      setPingResult({ ok: false, error: err.message })
    } finally {
      setPingLoading(false)
    }
  }

  async function handleSimulatePush() {
    setTestLoading(true)
    setTestResponse(null)
    try {
      let payload: any = {
        action: testAction,
        institution_slug: testSlug,
        institution_name: 'Apex State University',
        country: 'Nigeria',
      }

      if (testAction === 'issue') {
        payload.record = {
          student_reference: `TEST/${new Date().getFullYear()}/ENG/${Math.floor(Math.random() * 9000 + 1000)}`,
          recipient_name: 'Test Graduate Sample',
          recipient_email: 'test.graduate@apex.edu.ng',
          programme: 'B.Eng. Computer Engineering',
          classification: 'First Class Honours',
          graduation_date: '2024-07-20',
          certificate_number: `APEX-2024-${Math.floor(Math.random() * 9000 + 1000)}`,
          credential_type: 'degree',
        }
      } else if (testAction === 'revoke') {
        payload.certificate_id = `VAAS-APEX-2024-0042`
        payload.reason = 'Test nullification diagnostic'
      } else if (testAction === 'batch_sync') {
        payload.records = [
          {
            student_reference: `TEST/2021/CS/001`,
            recipient_name: 'Alice Sample',
            programme: 'B.Sc. Computer Science',
            classification: 'First Class Honours',
          },
          {
            student_reference: `TEST/2021/CS/002`,
            recipient_name: 'Bob Sample',
            programme: 'B.Sc. Computer Science',
            classification: 'Second Class Honours (Upper Division)',
          },
        ]
      }

      const res = await fetch('/api/v1/institutions/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-institution-slug': testSlug,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setTestResponse({ ok: res.ok, status: res.status, data })
    } catch (err: any) {
      setTestResponse({ ok: false, error: err.message })
    } finally {
      setTestLoading(false)
    }
  }

  const tabs: { id: TabId; label: string; icon: any; badge?: string }[] = [
    { id: 'integration', label: 'University SIS Gateway', icon: Layers3 },
    { id: 'verification', label: 'Public Verification API', icon: Shield },
    { id: 'databases', label: 'Database & Tech Stacks', icon: Database, badge: 'Universal' },
    { id: 'scaling', label: 'Enterprise Scale (1M+ Students)', icon: Cpu, badge: 'Merkle' },
    { id: 'diagnostics', label: 'Live Gateway Tester', icon: Play },
  ]

  return (
    <div className="min-h-screen bg-v-bg text-v-text flex flex-col selection:bg-v-accent selection:text-v-accent-fg">
      {/* ── Top Header with Simple Platform Navigation ── */}
      <header className="sticky top-0 z-50 border-b border-v-border bg-v-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 text-left group" aria-label="Vaasone home">
              <span className="grid size-8 place-items-center rounded-xl bg-v-accent text-v-accent-fg transition-transform group-hover:scale-105">
                <Network className="size-4" />
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold tracking-tight text-v-text">
                  {APP_NAME}
                </span>
                <span className="text-xs font-mono font-medium text-v-tertiary">
                  .docs
                </span>
              </div>
            </Link>
            <span className="rounded-full border border-v-border bg-v-raised px-2.5 py-0.5 text-[10px] font-mono font-semibold text-v-secondary">
              Gateway v1.0
            </span>
          </div>

          {/* Direct Platform Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-v-border bg-v-surface px-3 py-1.5 text-xs font-medium text-v-secondary hover:text-v-text hover:bg-v-hover transition-colors"
            >
              <Home className="size-3.5" />
              <span className="hidden sm:inline">Landing Page</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-v-accent px-3.5 py-1.5 text-xs font-semibold text-v-accent-fg hover:opacity-90 transition-all shadow-xs"
            >
              <LayoutDashboard className="size-3.5" />
              <span>Dashboard Portal</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Documentation Container ── */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-8">
        {/* Header Hero Section */}
        <div className="mb-8 rounded-3xl border border-v-border bg-gradient-to-br from-v-accent/5 via-v-surface to-v-raised p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[11px] font-mono font-semibold">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Stellar Consensus Live
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-v-raised border border-v-border px-2.5 py-0.5 text-[11px] font-mono text-v-tertiary">
                  Zero Inbound Firewall Requirements
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-v-text">
                Vaasone Trust Layer &amp; SIS Documentation
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-v-secondary leading-relaxed max-w-3xl">
                Comprehensive technical guides for university IT directors, registrar database administrators,
                background check platforms, and enterprise verifiers. Seamlessly bridge any academic SIS to
                the Stellar public ledger.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href="/verify"
                className="inline-flex items-center gap-1.5 rounded-xl border border-v-border bg-v-surface px-3.5 py-2 text-xs font-medium text-v-text hover:bg-v-hover transition-colors"
              >
                <Shield className="size-3.5 text-emerald-500" />
                Live Verification
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-v-border bg-v-surface px-3.5 py-2 text-xs font-medium text-v-text hover:bg-v-hover transition-colors"
              >
                <LayoutDashboard className="size-3.5 text-blue-500" />
                University Portal
              </Link>
            </div>
          </div>

          {/* Tab Selector Bar */}
          <div className="mt-6 flex flex-wrap gap-1.5 border-t border-v-border pt-5">
            {tabs.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  activeTab === id
                    ? 'bg-v-accent text-v-accent-fg shadow-xs font-semibold'
                    : 'bg-v-surface/60 text-v-secondary hover:text-v-text hover:bg-v-hover border border-v-border'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{label}</span>
                {badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                      activeTab === id
                        ? 'bg-v-accent-fg/20 text-v-accent-fg'
                        : 'bg-v-raised text-v-tertiary'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─── TAB 1: University SIS Gateway (Reverse Architecture) ─── */}
        {activeTab === 'integration' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="rounded-2xl border border-v-border bg-v-surface p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="grid size-10 place-items-center rounded-2xl bg-v-accent text-v-accent-fg shrink-0">
                  <Layers3 className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-v-text">Reverse Integration Architecture (Push Model)</h2>
                  <p className="mt-1 text-xs text-v-secondary leading-relaxed">
                    Most credential platforms fail in universities because they attempt to &quot;pull&quot; data — demanding
                    direct inbound VPN credentials or internal access to university databases. Vaasone does the reverse:
                    <strong> universities retain full custody of their student data and push graduation events outwards via standard HTTPS webhooks</strong>.
                  </p>
                </div>
              </div>

              {/* 3 Step Visual Pipeline */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-v-border bg-v-raised p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-v-text mb-2">
                    <Database className="size-4 text-blue-500" />
                    1. University SIS Event
                  </div>
                  <p className="text-[11px] text-v-secondary leading-relaxed">
                    Registrar prints or approves degrees in Banner, PeopleSoft, custom portal, or SQL database.
                  </p>
                </div>
                <div className="rounded-xl border border-v-border bg-v-raised p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-v-text mb-2">
                    <Zap className="size-4 text-amber-500" />
                    2. Outbound Webhook
                  </div>
                  <p className="text-[11px] text-v-secondary leading-relaxed">
                    SIS triggers an outbound HTTP POST to <code className="text-v-text font-mono text-[10px]">/api/v1/institutions/sync</code>.
                    No incoming firewall ports or VPNs required.
                  </p>
                </div>
                <div className="rounded-xl border border-v-border bg-v-raised p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-v-text mb-2">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    3. Stellar Anchor &amp; Proof
                  </div>
                  <p className="text-[11px] text-v-secondary leading-relaxed">
                    Vaasone computes the SHA-256 canonical hash, anchors on Stellar ledger, and returns the on-chain Tx proof.
                  </p>
                </div>
              </div>
            </div>

            {/* Quickstart Steps */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-v-text">Quick Start: 4-Step Integration</h3>

              {/* Step 1 */}
              <div className="rounded-2xl border border-v-border bg-v-surface p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid size-7 place-items-center rounded-xl bg-v-accent text-xs font-bold text-v-accent-fg">1</span>
                  <h4 className="text-sm font-bold text-v-text">Verify Gateway Handshake (GET /sync)</h4>
                </div>
                <p className="text-xs text-v-secondary mb-3">
                  Test connectivity and confirm that your institution is recognized by the Vaasone Gateway:
                </p>
                <CodeBlock
                  language="bash"
                  title="Handshake Health Check"
                  code={`curl -X GET "${syncUrl}?slug=your-university-slug" \\
  -H "x-institution-slug: your-university-slug"`}
                />
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-v-border bg-v-surface p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid size-7 place-items-center rounded-xl bg-v-accent text-xs font-bold text-v-accent-fg">2</span>
                  <h4 className="text-sm font-bold text-v-text">Issue / Anchor Graduate Credential (POST action=issue)</h4>
                </div>
                <p className="text-xs text-v-secondary mb-3">
                  When a student completes clearance, send student details. Vaasone anchors them on-chain in &lt;1.2s:
                </p>
                <CodeBlock
                  language="bash"
                  title="Issue Credential Event"
                  code={`curl -X POST ${syncUrl} \\
  -H "Content-Type: application/json" \\
  -H "x-institution-slug: apex-university" \\
  -d '{
    "action": "issue",
    "institution_name": "Apex State University",
    "country": "Nigeria",
    "record": {
      "student_reference": "APEX/2021/CS/0042",
      "recipient_name": "Tunde Bakare",
      "recipient_email": "tunde.bakare@apex.edu.ng",
      "programme": "B.Sc. Computer Science",
      "classification": "First Class Honours",
      "graduation_date": "2024-07-20",
      "certificate_number": "APEX-2024-0042",
      "credential_type": "degree"
    }
  }'`}
                />
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-v-border bg-v-surface p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid size-7 place-items-center rounded-xl bg-v-accent text-xs font-bold text-v-accent-fg">3</span>
                  <h4 className="text-sm font-bold text-v-text">Revoke Academic Award (POST action=revoke)</h4>
                </div>
                <p className="text-xs text-v-secondary mb-3">
                  If the university senate rescinds an award due to academic misconduct, push a revocation event:
                </p>
                <CodeBlock
                  language="bash"
                  title="Revocation Event"
                  code={`curl -X POST ${syncUrl} \\
  -H "Content-Type: application/json" \\
  -H "x-institution-slug: apex-university" \\
  -d '{
    "action": "revoke",
    "certificate_id": "VAAS-APEX-2024-0042",
    "student_reference": "APEX/2021/CS/0042",
    "reason": "Senate Disciplinary Resolution #2024/09"
  }'`}
                />
              </div>

              {/* Step 4 */}
              <div className="rounded-2xl border border-v-border bg-v-surface p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid size-7 place-items-center rounded-xl bg-v-accent text-xs font-bold text-v-accent-fg">4</span>
                  <h4 className="text-sm font-bold text-v-text">Reconcile / Batch Sync Records (POST action=batch_sync)</h4>
                </div>
                <p className="text-xs text-v-secondary mb-3">
                  Reconcile graduating cohorts or historical archives in chunked batches (25–500 records per request):
                </p>
                <CodeBlock
                  language="bash"
                  title="Batch Sync Cohort"
                  code={`curl -X POST ${syncUrl} \\
  -H "Content-Type: application/json" \\
  -H "x-institution-slug: apex-university" \\
  -d '{
    "action": "batch_sync",
    "records": [
      {
        "student_reference": "APEX/2021/CS/0042",
        "recipient_name": "Tunde Bakare",
        "programme": "B.Sc. Computer Science",
        "classification": "First Class Honours",
        "graduation_date": "2024-07-20"
      },
      {
        "student_reference": "APEX/2020/ME/0118",
        "recipient_name": "Ngozi Okafor",
        "programme": "B.Eng. Mechanical Engineering",
        "classification": "Second Class Honours (Upper Division)",
        "graduation_date": "2024-07-20"
      }
    ]
  }'`}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: Public Verification API ─── */}
        {activeTab === 'verification' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="rounded-2xl border border-v-border bg-v-surface p-6 sm:p-8">
              <h2 className="text-lg font-bold text-v-text">Public Verification REST API</h2>
              <p className="mt-1 text-xs text-v-secondary leading-relaxed">
                The verification endpoints are public, zero-cost, and require no API keys or accounts.
                Employers, embassies, and background verification agencies can query authenticity instantly.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-v-border bg-v-raised p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-v-text">
                    <Key className="size-4 text-emerald-500" /> Public Access
                  </div>
                  <p className="text-xs text-v-secondary mt-1">
                    Zero authentication tokens required for GET verification checks.
                  </p>
                </div>
                <div className="rounded-xl border border-v-border bg-v-raised p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-v-text">
                    <Clock className="size-4 text-blue-500" /> Sub-350ms Latency
                  </div>
                  <p className="text-xs text-v-secondary mt-1">
                    Cached cryptographic proof state with live Stellar ledger validation.
                  </p>
                </div>
                <div className="rounded-xl border border-v-border bg-v-raised p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-v-text">
                    <Layers className="size-4 text-purple-500" /> Batch Lookups
                  </div>
                  <p className="text-xs text-v-secondary mt-1">
                    Verify up to 25 credentials simultaneously in a single POST call.
                  </p>
                </div>
              </div>
            </div>

            {/* Single Credential GET */}
            <div className="rounded-2xl border border-v-border bg-v-surface p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  GET
                </span>
                <span className="font-mono text-sm font-bold text-v-text">/api/v1/verify</span>
              </div>
              <p className="text-xs text-v-secondary mb-4">
                Query by either unique Certificate ID (e.g. <code className="text-v-text font-mono">VAAS-APEX-2024-0042</code>)
                or canonical SHA-256 document hash.
              </p>
              <CodeBlock
                language="bash"
                title="Single Verification Request"
                code={`curl -s "https://vaasone-system.vercel.app/api/v1/verify?id=VAAS-APEX-2024-0042"`}
              />
              <div className="mt-4">
                <CodeBlock
                  language="json"
                  title="Sample 200 OK Response"
                  code={`{
  "verified": true,
  "outcome": "valid",
  "credential": {
    "credential_id": "VAAS-APEX-2024-0042",
    "recipient_name": "Tunde Bakare",
    "programme": "B.Sc. Computer Science",
    "classification": "First Class Honours",
    "graduation_date": "2024-07-20",
    "document_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  "institution": {
    "name": "Apex State University",
    "country": "Nigeria",
    "accredited": true
  },
  "anchor": {
    "network": "stellar",
    "transaction_id": "e4a8b792...",
    "ledger": 51249821,
    "status": "confirmed"
  }
}`}
                />
              </div>
            </div>

            {/* Batch Credential POST */}
            <div className="rounded-2xl border border-v-border bg-v-surface p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-md bg-blue-500/15 px-2 py-0.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  POST
                </span>
                <span className="font-mono text-sm font-bold text-v-text">/api/v1/verify/batch</span>
              </div>
              <p className="text-xs text-v-secondary mb-4">
                Verify multiple credentials in a single bulk request for recruitment systems.
              </p>
              <CodeBlock
                language="bash"
                title="Batch Verification Request"
                code={`curl -X POST "https://vaasone-system.vercel.app/api/v1/verify/batch" \\
  -H "Content-Type: application/json" \\
  -d '{"ids": ["VAAS-APEX-2024-0042", "VAAS-APEX-2024-0118"]}'`}
              />
            </div>

            {/* Outcomes Table */}
            <div className="rounded-2xl border border-v-border bg-v-surface p-6">
              <h3 className="text-sm font-bold text-v-text mb-3">Verification Outcomes Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-v-border bg-v-raised font-semibold text-v-text">
                      <th className="p-3">Outcome</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-v-border text-v-secondary">
                    <tr>
                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">valid</td>
                      <td className="p-3 font-mono">200</td>
                      <td className="p-3">Authentic, recognized by institution, anchored on Stellar blockchain.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">revoked</td>
                      <td className="p-3 font-mono">200</td>
                      <td className="p-3">Issuing university senate rescinded or nullified this degree.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">altered</td>
                      <td className="p-3 font-mono">200</td>
                      <td className="p-3">Cryptographic hash mismatch — certificate content was tampered with.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-v-muted-text">unknown</td>
                      <td className="p-3 font-mono">404</td>
                      <td className="p-3">No matching record found on the Vaasone trust registry.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: Database & Tech Stack Compatibility (QUESTION 1) ─── */}
        {activeTab === 'databases' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="rounded-2xl border border-v-border bg-v-surface p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="grid size-10 place-items-center rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
                  <Database className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-v-text">
                    Will It Integrate Seamlessly with Different University Databases &amp; Web Technologies?
                  </h2>
                  <p className="mt-1 text-xs text-v-secondary leading-relaxed">
                    <strong>Yes, 100% seamlessly.</strong> Vaasone&apos;s architecture is fundamentally
                    technology-agnostic. We deliberately designed the integration layer around standard HTTP/REST JSON
                    so that <em>any</em> university system — whether running on 30-year-old mainframe software or modern cloud apps —
                    can connect without rewriting their stack.
                  </p>
                </div>
              </div>
            </div>

            {/* Matrix of University Technologies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Oracle ERP / PeopleSoft */}
              <div className="rounded-2xl border border-v-border bg-v-surface p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid size-8 place-items-center rounded-xl bg-red-500/10 text-red-500 font-bold text-xs">
                    ORCL
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-v-text">Oracle PeopleSoft / Campus Solutions</h3>
                    <p className="text-[11px] text-v-tertiary">Used by large federal and state universities</p>
                  </div>
                </div>
                <p className="text-xs text-v-secondary leading-relaxed mb-4">
                  PeopleSoft uses <strong>Integration Broker</strong> or standard PL/SQL triggers with the built-in{' '}
                  <code className="font-mono text-v-text">UTL_HTTP</code> package. When the graduation roster status changes to &quot;Conferred&quot;,
                  a database trigger fires an outbound POST to Vaasone in &lt;50ms.
                </p>
                <CodeBlock
                  language="sql"
                  title="Oracle PL/SQL Trigger Pattern"
                  code={`-- PeopleSoft / Oracle DB Outbound Trigger
CREATE OR REPLACE TRIGGER trg_anchor_graduate
AFTER UPDATE OF degree_status ON ps_student_degrees
FOR EACH ROW WHEN (NEW.degree_status = 'CONFERRED')
DECLARE
  req   UTL_HTTP.REQ;
  resp  UTL_HTTP.RESP;
  body  VARCHAR2(4000);
BEGIN
  body := '{"action":"issue","student_reference":"' || :NEW.emplid ||
          '","recipient_name":"' || :NEW.name || '","programme":"' || :NEW.major || '"}';
  req := UTL_HTTP.BEGIN_REQUEST('https://vaasone.com/api/v1/institutions/sync', 'POST');
  UTL_HTTP.SET_HEADER(req, 'Content-Type', 'application/json');
  UTL_HTTP.WRITE_TEXT(req, body);
  resp := UTL_HTTP.GET_RESPONSE(req);
  UTL_HTTP.END_RESPONSE(resp);
END;`}
                />
              </div>

              {/* Microsoft SQL Server / Ellucian Banner */}
              <div className="rounded-2xl border border-v-border bg-v-surface p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid size-8 place-items-center rounded-xl bg-blue-500/10 text-blue-500 font-bold text-xs">
                    MSSQL
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-v-text">Microsoft SQL Server / Banner / C# .NET</h3>
                    <p className="text-[11px] text-v-tertiary">Used by enterprise colleges &amp; private universities</p>
                  </div>
                </div>
                <p className="text-xs text-v-secondary leading-relaxed mb-4">
                  C# ASP.NET Core applications and SQL Server trigger webhooks via HTTP Client or SQL CLR.
                  Alternatively, universities use SQL Server Integration Services (SSIS) to schedule nightly incremental sync jobs.
                </p>
                <CodeBlock
                  language="csharp"
                  title="C# .NET SIS Service Hook"
                  code={`public async Task AnchorGraduateAsync(Graduate student) {
    using var client = new HttpClient();
    client.DefaultRequestHeaders.Add("x-institution-slug", "covenant-university");
    var payload = new {
        action = "issue",
        record = new {
            student_reference = student.MatricNumber,
            recipient_name = student.FullName,
            programme = student.DegreeProgram
        }
    };
    var response = await client.PostAsJsonAsync("https://vaasone.com/api/v1/institutions/sync", payload);
}`}
                />
              </div>

              {/* Custom Web Portals (PHP / Laravel / WordPress) */}
              <div className="rounded-2xl border border-v-border bg-v-surface p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid size-8 place-items-center rounded-xl bg-purple-500/10 text-purple-500 font-bold text-xs">
                    PHP
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-v-text">Custom PHP / Laravel / MySQL Portals</h3>
                    <p className="text-[11px] text-v-tertiary">Common across 70%+ African higher institutions</p>
                  </div>
                </div>
                <p className="text-xs text-v-secondary leading-relaxed mb-4">
                  PHP applications use standard Guzzle or cURL inside the Graduate Approval Controller or an Eloquent Observer.
                  Zero external dependencies needed.
                </p>
                <CodeBlock
                  language="php"
                  title="PHP / Laravel Graduate Observer"
                  code={`// app/Observers/GraduateObserver.php
namespace App\\Observers;
use App\\Models\\Student;
use Illuminate\\Support\\Facades\\Http;

class GraduateObserver {
    public function updated(Student $student) {
        if ($student->wasChanged('is_graduated') && $student->is_graduated) {
            Http::withHeaders(['x-institution-slug' => 'unilag'])
                ->post('https://vaasone.com/api/v1/institutions/sync', [
                    'action' => 'issue',
                    'record' => [
                        'student_reference' => $student->matric_no,
                        'recipient_name'    => $student->full_name,
                        'programme'         => $student->course_of_study,
                    ]
                ]);
        }
    }
}`}
                />
              </div>

              {/* Python / Django / FastAPI or Connector Daemon */}
              <div className="rounded-2xl border border-v-border bg-v-surface p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid size-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                    PY
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-v-text">Python Standalone Connector Daemon</h3>
                    <p className="text-[11px] text-v-tertiary">Ideal for universities that don&apos;t want to touch their legacy code</p>
                  </div>
                </div>
                <p className="text-xs text-v-secondary leading-relaxed mb-4">
                  For institutions with closed or legacy vendor databases where modifying code is difficult,
                  we provide a lightweight 60-line Python bridge daemon that polls a read-only database view
                  and pushes new graduates to Vaasone automatically.
                </p>
                <CodeBlock
                  language="python"
                  title="Python Zero-Modification Bridge"
                  code={`import psycopg2, requests, time

conn = psycopg2.connect("host=campus-db dbname=sis user=vaasone_ro")
while True:
    cur = conn.cursor()
    cur.execute("SELECT matric_no, name, prog FROM vw_approved_graduates WHERE vaasone_synced = FALSE LIMIT 50")
    for matric, name, prog in cur.fetchall():
        res = requests.post("https://vaasone.com/api/v1/institutions/sync", json={
            "action": "issue",
            "record": {"student_reference": matric, "recipient_name": name, "programme": prog}
        })
        if res.status_code == 200:
            cur.execute("UPDATE graduation_status SET vaasone_synced = TRUE WHERE matric_no = %s", (matric,))
            conn.commit()
    time.sleep(60)`}
                />
              </div>
            </div>

            {/* Why No Network Firewall Issues Occur */}
            <div className="rounded-2xl border border-v-border bg-gradient-to-br from-emerald-500/5 to-v-surface p-6">
              <h3 className="text-sm font-bold text-v-text flex items-center gap-2 mb-2">
                <Shield className="size-4 text-emerald-500" />
                Zero Firewall &amp; Zero Inbound Security Objections
              </h3>
              <p className="text-xs text-v-secondary leading-relaxed">
                In traditional vendor setups, university Chief Information Security Officers (CISOs) reject integrations
                because the vendor demands opening inbound ports (e.g. port 1521 for Oracle or 1433 for SQL Server) or setting up site-to-site IPsec VPNs.
                <br /><br />
                With Vaasone&apos;s <strong>Reverse Integration</strong>, the university makes <em>standard outbound HTTPS requests</em> on
                port 443 — exactly like a browser opening a website. The university never opens inbound ports to the internet,
                and Vaasone never has access to student private data beyond the cryptographic certificate proof.
              </p>
            </div>
          </div>
        )}

        {/* ─── TAB 4: Enterprise Scale & 1 Million+ Students (QUESTION 2) ─── */}
        {activeTab === 'scaling' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="rounded-2xl border border-v-border bg-v-surface p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="grid size-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
                  <Cpu className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-v-text">
                    What Happens When a University with 1,000,000+ Students Integrates?
                  </h2>
                  <p className="mt-1 text-xs text-v-secondary leading-relaxed">
                    If an institution like UNILAG, ABU Zaria, National Open University of Nigeria (NOUN), or a national
                    consortium connects with 1 Million+ historical graduates, a naive architecture would fail.
                    Here is exactly what would happen in a naive system, and how Vaasone&apos;s production architecture handles it seamlessly.
                  </p>
                </div>
              </div>
            </div>

            {/* The Naive Problem vs Vaasone Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.02] p-6">
                <div className="flex items-center gap-2 text-sm font-bold text-red-500 mb-3">
                  <AlertTriangle className="size-4" />
                  What Would Happen in a Naive System
                </div>
                <ul className="space-y-3 text-xs text-v-secondary leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <div>
                      <strong>HTTP Gateway Timeout:</strong> Sending 1,000,000 records in a single synchronous POST request
                      is a ~350MB JSON payload. Cloudflare or Nginx will cut the connection at 15–30 seconds.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <div>
                      <strong>Blockchain Ledger Congestion:</strong> Minting 1,000,000 individual on-chain transactions
                      sequentially on Stellar (1 ledger every 5s) would take <strong>over 5 days</strong> of nonstop transactions
                      and burn transaction fees.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <div>
                      <strong>Database Memory Exhaustion:</strong> Attempting to insert 1,000,000 rows in a single SQL query
                      causes out-of-memory crashes and deadlocks table writes.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-6">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-500 mb-3">
                  <CheckCircle2 className="size-4" />
                  How Vaasone Solves It (Production Architecture)
                </div>
                <ul className="space-y-3 text-xs text-v-secondary leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">1.</span>
                    <div>
                      <strong>Cryptographic Merkle Tree Batch Minting:</strong> Instead of 1,000,000 blockchain transactions,
                      Vaasone constructs a Merkle Tree and writes <strong>one single 32-byte Merkle Root</strong> to Stellar.
                      Cost: &lt; $0.00001 total!
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">2.</span>
                    <div>
                      <strong>Asynchronous Ingestion Queues:</strong> Payloads are accepted asynchronously with a{' '}
                      <code className="font-mono text-v-text">202 Accepted</code> response and a <code className="font-mono text-v-text">job_id</code>.
                      Background workers (BullMQ / pg_cron) ingest in chunks of 500 records.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">3.</span>
                    <div>
                      <strong>Partitioned PostgreSQL Storage:</strong> The credentials table is partitioned by{' '}
                      <code className="font-mono text-v-text">(organization_id, grad_year)</code> with composite B-Tree indexes,
                      delivering sub-5ms lookups even on 10,000,000+ rows.
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Merkle Tree Diagram & Deep Dive */}
            <div className="rounded-2xl border border-v-border bg-v-surface p-6 sm:p-8">
              <h3 className="text-base font-bold text-v-text flex items-center gap-2 mb-2">
                <Sparkles className="size-4 text-v-accent" />
                The Merkle Tree Breakthrough: 1 Transaction for 1,000,000 Students
              </h3>
              <p className="text-xs text-v-secondary leading-relaxed mb-6">
                How can 1,000,000 graduates have tamper-proof blockchain security in a single transaction?
                Using the same mathematical structure that powers Bitcoin and Ethereum:
              </p>

              <div className="rounded-xl border border-v-border bg-v-raised p-5 font-mono text-xs overflow-x-auto text-center">
                <div className="inline-block text-left text-[11px] leading-relaxed text-v-text">
                  {`               [ SINGLE STELLAR TRANSACTION: ROOT HASH ]
                                       ▲
                           ┌───────────┴───────────┐
                       Hash(AB)                Hash(CD)
                           ▲                       ▲
                     ┌─────┴─────┐           ┌─────┴─────┐
                   Hash(A)     Hash(B)     Hash(C)     Hash(D)
                     ▲           ▲           ▲           ▲
                 Student 1   Student 2   Student 3   ... Student 1,000,000`}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="rounded-xl border border-v-border bg-v-surface p-4">
                  <div className="font-bold text-v-text mb-1">Instant Verification</div>
                  <p className="text-v-secondary text-[11px]">
                    To verify Student 42, the verifier only needs the student&apos;s hash and ~20 intermediate hashes (the Merkle proof).
                    Validation takes &lt;1 millisecond in WebAssembly.
                  </p>
                </div>
                <div className="rounded-xl border border-v-border bg-v-raised p-4">
                  <div className="font-bold text-v-text mb-1">Zero Gas / Transaction Spikes</div>
                  <p className="text-v-secondary text-[11px]">
                    Whether anchoring 10 graduates or 1,000,000 graduates, only 1 on-chain transaction fee is consumed on the Stellar testnet or mainnet.
                  </p>
                </div>
                <div className="rounded-xl border border-v-border bg-v-surface p-4">
                  <div className="font-bold text-v-text mb-1">Idempotent Resumption</div>
                  <p className="text-v-secondary text-[11px]">
                    If a sync job is interrupted at record 750,000, the ingestion daemon resumes instantly with zero duplicates or double-minting.
                  </p>
                </div>
              </div>
            </div>

            {/* High Volume Ingestion Code Pattern */}
            <div className="rounded-2xl border border-v-border bg-v-surface p-6">
              <h3 className="text-sm font-bold text-v-text mb-2">Enterprise Chunking Pattern (Recommended Implementation)</h3>
              <p className="text-xs text-v-secondary mb-4">
                When synchronizing large cohorts from university databases, stream records in chunks of 100–500 records:
              </p>
              <CodeBlock
                language="javascript"
                title="Node.js Chunked Ingestion Script"
                code={`async function syncMillionStudents(allRecords) {
  const CHUNK_SIZE = 250;
  console.log(\`Starting migration of \${allRecords.length} student records...\`);

  for (let i = 0; i < allRecords.length; i += CHUNK_SIZE) {
    const chunk = allRecords.slice(i, i + CHUNK_SIZE);
    const res = await fetch('https://vaasone.com/api/v1/institutions/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-institution-slug': 'noun-university'
      },
      body: JSON.stringify({
        action: 'batch_sync',
        batch_id: \`batch_\${Math.floor(i / CHUNK_SIZE)}\`,
        records: chunk
      })
    });
    const data = await res.json();
    console.log(\`Progress: \${i + chunk.length} / \${allRecords.length} records processed (\${((i+chunk.length)/allRecords.length*100).toFixed(1)}%)\`);
  }
}`}
              />
            </div>
          </div>
        )}

        {/* ─── TAB 5: Live Gateway Diagnostics & Simulator ─── */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="rounded-2xl border border-v-border bg-v-surface p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-v-text">Interactive Gateway Diagnostics &amp; Simulator</h2>
                  <p className="mt-1 text-xs text-v-secondary leading-relaxed">
                    Test the live Vaasone Sync Gateway directly from your browser. Send simulated handshake requests
                    or push synthetic student records to verify end-to-end cryptographic and blockchain processing.
                  </p>
                </div>
                <button
                  onClick={handlePingGateway}
                  disabled={pingLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-v-accent px-4 py-2 text-xs font-semibold text-v-accent-fg hover:opacity-90 transition-all shrink-0"
                >
                  <RefreshCw className={`size-3.5 ${pingLoading ? 'animate-spin' : ''}`} />
                  {pingLoading ? 'Pinging...' : 'Ping Gateway'}
                </button>
              </div>

              {/* Handshake Result Box */}
              {pingResult && (
                <div className={`mt-6 rounded-xl border p-4 text-xs font-mono ${pingResult.ok ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-v-text">Gateway Status: HTTP {pingResult.status}</span>
                    <span className={pingResult.ok ? 'text-emerald-500' : 'text-red-500'}>
                      {pingResult.ok ? '✓ Operational' : '⚠ Error'}
                    </span>
                  </div>
                  <pre className="overflow-x-auto text-[11px] leading-relaxed text-v-text">
                    {JSON.stringify(pingResult.data || pingResult.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Interactive Push Simulator */}
            <div className="rounded-2xl border border-v-border bg-v-surface p-6">
              <h3 className="text-sm font-bold text-v-text mb-2">Simulate Outbound University Event</h3>
              <p className="text-xs text-v-secondary mb-4">
                Select an event type and trigger an actual HTTP request to <code className="font-mono text-v-text">/api/v1/institutions/sync</code>:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-[11px] font-semibold text-v-tertiary block mb-1">Target Slug</label>
                  <input
                    type="text"
                    value={testSlug}
                    onChange={(e) => setTestSlug(e.target.value)}
                    className="w-full rounded-xl border border-v-border bg-v-raised px-3 py-2 text-xs font-mono text-v-text outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-v-tertiary block mb-1">Event Action</label>
                  <select
                    value={testAction}
                    onChange={(e) => setTestAction(e.target.value as any)}
                    className="w-full rounded-xl border border-v-border bg-v-raised px-3 py-2 text-xs text-v-text outline-none"
                  >
                    <option value="issue">issue (Anchor Graduate)</option>
                    <option value="revoke">revoke (Rescind Award)</option>
                    <option value="batch_sync">batch_sync (Cohort Reconcile)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSimulatePush}
                    disabled={testLoading}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-v-accent px-4 py-2 text-xs font-semibold text-v-accent-fg hover:opacity-90 transition-all"
                  >
                    <Play className="size-3.5" />
                    {testLoading ? 'Processing on Stellar...' : 'Execute Event'}
                  </button>
                </div>
              </div>

              {testResponse && (
                <div className="mt-4 rounded-xl border border-v-border bg-v-raised p-4 font-mono text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-v-muted-text">
                      Response Status: HTTP {testResponse.status}
                    </span>
                    <CopyButton text={JSON.stringify(testResponse.data, null, 2)} />
                  </div>
                  <pre className="overflow-x-auto text-[11px] leading-relaxed text-v-text">
                    {JSON.stringify(testResponse.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-v-text">Frequently Asked Integration Questions</h3>
              <AccordionItem title="Is any student Personal Identifiable Information (PII) stored on the public blockchain?">
                No. Never. Vaasone operates on a <strong>Zero-PII On-chain Architecture</strong>.
                Only cryptographic SHA-256 digests and Merkle root hashes are written to the public Stellar ledger.
                Names, student grades, dates of birth, and matriculation references remain solely in the institution&apos;s
                and Vaasone&apos;s protected database.
              </AccordionItem>
              <AccordionItem title="What happens if the university campus internet goes down during graduation day?">
                The university SIS can store events in a local buffer or queue table. Once internet connectivity is restored,
                the SIS or the Vaasone connector daemon syncs all pending records. Because the sync API is idempotent,
                network interruptions never produce duplicate records or duplicate certificates.
              </AccordionItem>
              <AccordionItem title="Can we revoke a certificate if an award was conferred in error or for malpractice?">
                Yes. Calling <code className="font-mono text-v-text">POST /sync</code> with <code className="font-mono text-v-text">action: &quot;revoke&quot;</code> instantly
                updates the cryptographic state proof. Subsequent public verification queries will immediately show
                a verified &quot;revoked&quot; outcome with the official Senate nullification notice.
              </AccordionItem>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-v-border bg-v-surface py-6 px-4 sm:px-6 text-xs text-v-muted-text text-center">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-v-text">{APP_NAME}</span>
            <span>— Institutional Trust Layer Documentation</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-v-text transition-colors">Landing Page</Link>
            <Link href="/verify" className="hover:text-v-text transition-colors">Verify Credential</Link>
            <Link href="/dashboard" className="hover:text-v-text transition-colors">Dashboard Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function DocsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-v-bg text-v-text flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-v-secondary">
            <span className="size-3 rounded-full bg-v-accent animate-ping" />
            Loading Documentation Hub...
          </div>
        </div>
      }
    >
      <DocsContent />
    </Suspense>
  )
}
