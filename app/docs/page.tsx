import Link from 'next/link'
import {
  Network,
  ArrowLeft,
  Copy,
  Terminal,
  Code2,
  CheckCircle2,
  ExternalLink,
  Shield,
  Key,
  Clock,
  Layers,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { APP_NAME } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-v-bg text-v-text flex flex-col selection:bg-v-accent selection:text-v-accent-fg">
      {/* ── Top Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-v-border bg-v-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-left" aria-label="Vaasone home">
              <span className="grid size-8 place-items-center rounded-xl bg-v-accent text-v-accent-fg">
                <Network className="size-4" />
              </span>
              <span className="text-base font-semibold tracking-[-0.03em] text-v-text">
                {APP_NAME}<span className="font-normal text-v-tertiary">.docs</span>
              </span>
            </Link>
            <span className="rounded-full border border-v-border bg-v-raised px-2.5 py-0.5 text-[10px] font-mono font-semibold text-v-secondary">
              REST API v1
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-v-secondary hover:text-v-text transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Back to Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Content Container ───────────────────────────────── */}
      <div className="mx-auto max-w-6xl w-full px-5 py-12 sm:px-8 grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block space-y-6 text-xs sticky top-24 h-fit">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-v-muted-text block mb-2">
              Getting Started
            </span>
            <ul className="space-y-1.5 font-medium">
              <li>
                <a href="#overview" className="text-v-secondary hover:text-v-text block py-1">
                  Overview
                </a>
              </li>
              <li>
                <a href="#base-url" className="text-v-secondary hover:text-v-text block py-1">
                  Base URL &amp; Environments
                </a>
              </li>
              <li>
                <a href="#rate-limits" className="text-v-secondary hover:text-v-text block py-1">
                  Rate Limits &amp; Headers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-v-muted-text block mb-2">
              Endpoints
            </span>
            <ul className="space-y-1.5 font-medium">
              <li>
                <a href="#verify-single" className="text-v-secondary hover:text-v-text block py-1">
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 mr-1.5">GET</span>
                  Verify Single Credential
                </a>
              </li>
              <li>
                <a href="#verify-batch" className="text-v-secondary hover:text-v-text block py-1">
                  <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 mr-1.5">POST</span>
                  Batch Verification
                </a>
              </li>
              <li>
                <a href="#models" className="text-v-secondary hover:text-v-text block py-1">
                  Response Schema &amp; Outcomes
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-v-muted-text block mb-2">
              University SIS &amp; Database
            </span>
            <ul className="space-y-1.5 font-medium">
              <li>
                <a href="#sis-integration" className="text-v-secondary hover:text-v-text block py-1">
                  Integration Models
                </a>
              </li>
              <li>
                <a href="#db-connection" className="text-v-secondary hover:text-v-text block py-1">
                  Connecting Your Database
                </a>
              </li>
              <li>
                <a href="#reconciliation" className="text-v-secondary hover:text-v-text block py-1">
                  Conflict &amp; Duplicate Handling
                </a>
              </li>
              <li>
                <a href="#scale-batch" className="text-v-secondary hover:text-v-text block py-1">
                  1M+ Records &amp; Merkle Batching
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-v-muted-text block mb-2">
              Integration Code
            </span>
            <ul className="space-y-1.5 font-medium">
              <li>
                <a href="#code-curl" className="text-v-secondary hover:text-v-text block py-1">
                  cURL
                </a>
              </li>
              <li>
                <a href="#code-js" className="text-v-secondary hover:text-v-text block py-1">
                  JavaScript / TypeScript
                </a>
              </li>
              <li>
                <a href="#code-python" className="text-v-secondary hover:text-v-text block py-1">
                  Python
                </a>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Documentation Body */}
        <main className="lg:col-span-3 space-y-16">
          {/* Overview */}
          <section id="overview" className="scroll-mt-24">
            <h1 className="text-3xl font-extrabold tracking-tight text-v-text">
              Vaasone Verification API
            </h1>
            <p className="mt-3 text-sm text-v-secondary leading-relaxed">
              The Vaasone API enables software developers, background check platforms, human resource systems,
              and academic registries to verify academic credentials and degrees issued across African institutions.
              Verification queries require zero authentication or API tokens for public read operations.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-v-border bg-v-surface p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-v-text">
                  <Key className="size-4 text-v-muted-text" /> Public Access
                </div>
                <p className="text-xs text-v-secondary mt-1">
                  No API key required for GET verification queries.
                </p>
              </div>

              <div className="rounded-xl border border-v-border bg-v-surface p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-v-text">
                  <Clock className="size-4 text-v-muted-text" /> Sub-second Latency
                </div>
                <p className="text-xs text-v-secondary mt-1">
                  Direct database lookup with on-chain cryptographic audit proof.
                </p>
              </div>

              <div className="rounded-xl border border-v-border bg-v-surface p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-v-text">
                  <Layers className="size-4 text-v-muted-text" /> Batch Processing
                </div>
                <p className="text-xs text-v-secondary mt-1">
                  Verify up to 25 credentials simultaneously in a single request.
                </p>
              </div>
            </div>
          </section>

          {/* Base URL */}
          <section id="base-url" className="scroll-mt-24 border-t border-v-border pt-10">
            <h2 className="text-xl font-bold text-v-text">Base URL</h2>
            <p className="text-xs text-v-secondary mt-2">
              All requests should be made using HTTPS to the production or local host.
            </p>

            <div className="mt-4 rounded-xl border border-v-border bg-v-surface p-4 font-mono text-xs">
              <div className="text-v-muted-text text-[11px] mb-1">Production</div>
              <div className="text-v-text select-all">https://vaasone-system.vercel.app/api/v1</div>
              <div className="text-v-muted-text text-[11px] mt-3 mb-1">Local Development</div>
              <div className="text-v-secondary select-all">http://localhost:3000/api/v1</div>
            </div>
          </section>

          {/* Rate Limits */}
          <section id="rate-limits" className="scroll-mt-24 border-t border-v-border pt-10">
            <h2 className="text-xl font-bold text-v-text">Rate Limits &amp; Headers</h2>
            <p className="text-xs text-v-secondary mt-2">
              To guarantee high availability and protect institutional data sources, public verification endpoints are rate limited by IP address.
            </p>

            <div className="mt-4 rounded-xl border border-v-border bg-v-surface overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-v-border bg-v-raised text-v-text font-semibold">
                    <th className="p-3">Endpoint</th>
                    <th className="p-3">Rate Limit</th>
                    <th className="p-3">Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-v-border text-v-secondary">
                  <tr>
                    <td className="p-3 font-mono">GET /api/v1/verify</td>
                    <td className="p-3">60 requests / minute</td>
                    <td className="p-3">Per IP Address</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">POST /api/v1/verify/batch</td>
                    <td className="p-3">20 requests / minute</td>
                    <td className="p-3">Per IP Address (Max 25 IDs per call)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-v-secondary mt-4">
              All responses include standard rate limiting headers:
              <code className="mx-1 font-mono text-v-text">X-RateLimit-Limit</code>,
              <code className="mx-1 font-mono text-v-text">X-RateLimit-Remaining</code>, and
              <code className="mx-1 font-mono text-v-text">X-RateLimit-Reset</code>.
            </p>
          </section>

          {/* Single Verification Endpoint */}
          <section id="verify-single" className="scroll-mt-24 border-t border-v-border pt-10">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                GET
              </span>
              <h2 className="text-xl font-bold text-v-text font-mono">/api/v1/verify</h2>
            </div>
            <p className="text-xs text-v-secondary mt-2">
              Verify an individual credential by its unique public identifier (e.g., <code className="font-mono text-v-text">VAAS-UNILAG-2026-001</code>)
              or by the 64-character SHA-256 document hash.
            </p>

            <h3 className="text-sm font-semibold text-v-text mt-6">Query Parameters</h3>
            <div className="mt-3 rounded-xl border border-v-border bg-v-surface overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-v-border bg-v-raised text-v-text font-semibold">
                    <th className="p-3">Parameter</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Required</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-v-border text-v-secondary">
                  <tr>
                    <td className="p-3 font-mono text-v-text">id</td>
                    <td className="p-3 font-mono">string</td>
                    <td className="p-3 text-emerald-600 font-semibold">Optional*</td>
                    <td className="p-3">The public credential ID (e.g. <code className="font-mono">VAAS-UNILAG-2026-001</code>).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-v-text">hash</td>
                    <td className="p-3 font-mono">string</td>
                    <td className="p-3 text-emerald-600 font-semibold">Optional*</td>
                    <td className="p-3">The 64-char SHA-256 canonical certificate hash.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-v-muted-text mt-2">
              * Exactly one of <code className="font-mono">id</code> or <code className="font-mono">hash</code> must be provided.
            </p>

            <h3 className="text-sm font-semibold text-v-text mt-6">Example Response (200 OK)</h3>
            <div className="mt-3 rounded-xl border border-v-border bg-v-surface p-4 font-mono text-xs overflow-x-auto">
              <pre className="text-v-secondary text-[11px] leading-relaxed">
{`{
  "outcome": "valid",
  "blockchain_verified": true,
  "verified_at": "2026-09-13T10:00:00.000Z",
  "credential": {
    "credential_id": "VAAS-UNILAG-2026-001",
    "recipient_name": "Amina Bello",
    "programme": "B.Sc Computer Science",
    "credential_type": "degree",
    "classification": "First Class Honours",
    "certificate_number": "UNILAG/2026/CS/0842",
    "graduation_date": "2026-06-25",
    "issue_date": "2026-07-01",
    "status": "issued",
    "document_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "organization": {
      "name": "University of Lagos",
      "country": "Nigeria"
    }
  },
  "anchor": {
    "network": "Stellar Network",
    "provider": "stellar",
    "status": "confirmed",
    "transaction_id": "90e2f5b863d043ff8e09f56641b31ff5908b98163f582dafa103328e7529d20c",
    "ledger": 1948293,
    "explorer_url": "https://stellar.expert/explorer/testnet/tx/90e2f5b863d043ff8e09f56641b31ff5908b98163f582dafa103328e7529d20c"
  }
}`}
              </pre>
            </div>
          </section>

          {/* Batch Verification Endpoint */}
          <section id="verify-batch" className="scroll-mt-24 border-t border-v-border pt-10">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-500/15 px-2 py-0.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                POST
              </span>
              <h2 className="text-xl font-bold text-v-text font-mono">/api/v1/verify/batch</h2>
            </div>
            <p className="text-xs text-v-secondary mt-2">
              Batch verify up to 25 credentials in a single HTTP call. Recommended for bulk candidate screening.
            </p>

            <h3 className="text-sm font-semibold text-v-text mt-6">Request Body (JSON)</h3>
            <div className="mt-3 rounded-xl border border-v-border bg-v-surface p-4 font-mono text-xs overflow-x-auto">
              <pre className="text-v-secondary text-[11px] leading-relaxed">
{`{
  "ids": [
    "VAAS-UNILAG-2026-001",
    "VAAS-COVENANT-2026-001"
  ]
}`}
              </pre>
            </div>

            <h3 className="text-sm font-semibold text-v-text mt-6">Response (200 OK)</h3>
            <div className="mt-3 rounded-xl border border-v-border bg-v-surface p-4 font-mono text-xs overflow-x-auto">
              <pre className="text-v-secondary text-[11px] leading-relaxed">
{`{
  "total": 2,
  "valid_count": 2,
  "verified_at": "2026-09-13T10:00:00.000Z",
  "results": [
    {
      "query": "VAAS-UNILAG-2026-001",
      "query_type": "id",
      "outcome": "valid",
      "blockchain_verified": true,
      "credential": { "recipient_name": "Amina Bello", ... },
      "anchor": { "transaction_id": "90e2f5b8...", ... }
    },
    {
      "query": "VAAS-COVENANT-2026-001",
      "query_type": "id",
      "outcome": "valid",
      "blockchain_verified": true,
      "credential": { "recipient_name": "Chinedu Okonkwo", ... },
      "anchor": { "transaction_id": "bc183921...", ... }
    }
  ]
}`}
              </pre>
            </div>
          </section>

          {/* Response Outcomes */}
          <section id="models" className="scroll-mt-24 border-t border-v-border pt-10">
            <h2 className="text-xl font-bold text-v-text">Verification Outcomes</h2>
            <p className="text-xs text-v-secondary mt-2">
              The <code className="font-mono text-v-text">outcome</code> field defines the cryptographic trust state of the credential.
            </p>

            <div className="mt-4 rounded-xl border border-v-border bg-v-surface overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-v-border bg-v-raised text-v-text font-semibold">
                    <th className="p-3">Outcome</th>
                    <th className="p-3">HTTP Status</th>
                    <th className="p-3">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-v-border text-v-secondary">
                  <tr>
                    <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">valid</td>
                    <td className="p-3 font-mono">200</td>
                    <td className="p-3">The credential is authentic, actively recognized by the institution, and anchored on-chain.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">revoked</td>
                    <td className="p-3 font-mono">200</td>
                    <td className="p-3">The issuing institution officially revoked this award (e.g. disciplinary or clerical recall).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">altered</td>
                    <td className="p-3 font-mono">200</td>
                    <td className="p-3">Document integrity check failed. The payload hash does not match the ledger state.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-yellow-600 dark:text-yellow-400">superseded</td>
                    <td className="p-3 font-mono">200</td>
                    <td className="p-3">A newer re-issue of this award has taken precedence.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-v-muted-text">unknown</td>
                    <td className="p-3 font-mono">404</td>
                    <td className="p-3">No record matching this identifier exists on the Vaasone trust registry.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Institutional SIS & Database Integration ── */}
          <section id="sis-integration" className="scroll-mt-24 border-t border-v-border pt-10 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-v-text">Institutional SIS &amp; Database Integration</h2>
              <p className="text-xs text-v-secondary mt-2 leading-relaxed">
                Universities do not need to rewrite their student portals, migrate databases, or run blockchain nodes.
                Vaasone operates as a silent trust layer that connects to your existing records infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-v-border bg-v-surface p-4">
                <h3 className="text-sm font-semibold text-v-text">1. Connector Daemon</h3>
                <p className="text-xs text-v-secondary mt-1">
                  <strong>Zero Code:</strong> A lightweight Docker or background service connects with read-only credentials to your PostgreSQL/MySQL/Oracle DB and syncs graduates automatically.
                </p>
              </div>

              <div className="rounded-xl border border-v-border bg-v-surface p-4">
                <h3 className="text-sm font-semibold text-v-text">2. Outbound Webhook</h3>
                <p className="text-xs text-v-secondary mt-1">
                  <strong>Native SIS:</strong> Your school software dispatches a standard HTTPS POST to <code className="font-mono text-v-text">/api/v1/institutions/sync</code> on senate graduation approval.
                </p>
              </div>

              <div className="rounded-xl border border-v-border bg-v-surface p-4">
                <h3 className="text-sm font-semibold text-v-text">3. Scheduled CSV / Pull</h3>
                <p className="text-xs text-v-secondary mt-1">
                  <strong>Export Endpoint:</strong> Provide an authenticated HTTPS export endpoint or upload an encrypted batch CSV directly in the admin dashboard.
                </p>
              </div>
            </div>
          </section>

          {/* Database Connection & Developer Requirements */}
          <section id="db-connection" className="scroll-mt-24 border-t border-v-border pt-10 space-y-4">
            <h2 className="text-xl font-bold text-v-text">Connecting Your Database: Prerequisites &amp; Setup</h2>
            <p className="text-xs text-v-secondary leading-relaxed">
              When configuring an SIS connection in the Vaasone Institution Dashboard (<code className="font-mono text-v-text">/institutions/connect</code>),
              you are asked for an <strong>Endpoint URL</strong> and an optional <strong>API Key</strong>.
            </p>

            <div className="rounded-xl border border-v-border bg-v-surface p-5 space-y-3 text-xs leading-relaxed text-v-secondary">
              <p>
                <strong className="text-v-text">What is the Endpoint URL in the Dashboard?</strong><br />
                It is the URL of your university&apos;s internal API or Connector Daemon (e.g. <code className="font-mono text-v-text">https://sis.apex.edu.ng/api/graduates</code>).
                Vaasone sends health-check pings to verify that your system is online and authorized to exchange records.
              </p>
              <p>
                <strong className="text-v-text">Do University Developers Need to Write Code?</strong><br />
                • If using the <strong>Vaasone Connector Agent</strong>: <em>No code required.</em> Simply install the agent in your school network and configure your database read replica.<br />
                • If using <strong>Native Webhooks</strong>: A developer writes a simple 20-line HTTP POST trigger inside your SIS graduation module.<br />
                • If using <strong>Spreadsheets/Registrar Export</strong>: <em>Zero code.</em> Registrars export graduation lists from their SIS and upload via the Vaasone dashboard.
              </p>
            </div>
          </section>

          {/* Reconciliation & Duplicate Handling */}
          <section id="reconciliation" className="scroll-mt-24 border-t border-v-border pt-10 space-y-4">
            <h2 className="text-xl font-bold text-v-text">Conflict &amp; Duplicate Record Resolution</h2>
            <p className="text-xs text-v-secondary leading-relaxed">
              What happens if a student was already issued a certificate manually or via CSV, and their university database connects later?
            </p>

            <div className="rounded-xl border border-v-border bg-v-surface p-5 text-xs text-v-secondary space-y-2">
              <p>
                Vaasone enforces <strong>Idempotent Identity Matching</strong> using the composite primary key:
                <code className="mx-1 font-mono text-v-text font-bold">(organization_id, student_reference)</code>.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>
                  <strong className="text-v-text">Exact Duplicate Match:</strong> If the student&apos;s matriculation number already exists with the same canonical data, the incoming record is flagged as <code className="font-mono text-emerald-600">unchanged</code>. No duplicate certificate is minted.
                </li>
                <li>
                  <strong className="text-v-text">Legitimate Academic Update:</strong> If the university changes an honours classification or corrects a name spelling, Vaasone generates a new cryptographic document hash, anchors a version increment, and updates the certificate state without changing the student reference.
                </li>
                <li>
                  <strong className="text-v-text">Revocation Propagation:</strong> If a student is expelled or their degree is withdrawn in the school database, an outbound sync immediately marks the credential on-chain as revoked.
                </li>
              </ul>
            </div>
          </section>

          {/* 1M+ Records Scaling & Merkle Trees */}
          <section id="scale-batch" className="scroll-mt-24 border-t border-v-border pt-10 space-y-4">
            <h2 className="text-xl font-bold text-v-text">Scaling to 1,000,000+ Students &amp; Merkle Batching</h2>
            <p className="text-xs text-v-secondary leading-relaxed">
              When a large national university system with hundreds of thousands or millions of students integrates,
              minting individual on-chain transactions for each student would be slow and inefficient.
            </p>

            <div className="rounded-xl border border-v-border bg-v-surface p-5 text-xs text-v-secondary space-y-3">
              <p>
                Vaasone utilizes <strong>Cryptographic Merkle Tree Batch Anchoring</strong>:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>
                  <strong className="text-v-text">Zero PII On-chain:</strong> Student names, grades, and personal data remain strictly in the institution&apos;s and Vaasone&apos;s sovereign database.
                </li>
                <li>
                  <strong className="text-v-text">Off-chain Merkle Accumulation:</strong> Each credential is independently hashed (<code className="font-mono">SHA-256</code>). Hundreds of thousands of hashes are combined into a binary cryptographic Merkle Tree.
                </li>
                <li>
                  <strong className="text-v-text">Single Ledger Anchor:</strong> Only the single 32-byte <strong>Merkle Root Hash</strong> is written to the Stellar ledger in a single transaction.
                </li>
                <li>
                  <strong className="text-v-text">Instant Cryptographic Verification:</strong> Any single certificate is verified with logarithmic complexity (<code className="font-mono">O(log N)</code>) using its inclusion proof against the anchored root.
                </li>
              </ol>
              <p className="pt-2 text-[11px] text-v-muted-text">
                ✓ 1,000,000 credentials anchored in minutes · Cost: &lt; $0.01 in network fees · Guaranteed zero ledger congestion.
              </p>
            </div>
          </section>

          {/* Integration Code Samples */}
          <section id="code-curl" className="scroll-mt-24 border-t border-v-border pt-10 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-v-text">Integration Code Examples</h2>
              <p className="text-xs text-v-secondary mt-2">
                Copy-paste ready snippets to verify credentials in your preferred programming language.
              </p>
            </div>

            {/* cURL */}
            <div>
              <h3 className="text-sm font-semibold text-v-text mb-2 flex items-center gap-2">
                <Terminal className="size-4 text-v-muted-text" /> cURL
              </h3>
              <div className="rounded-xl border border-v-border bg-v-surface p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-v-text leading-relaxed">
{`# 1. Single Verification
curl -s -X GET "https://vaasone-system.vercel.app/api/v1/verify?id=VAAS-UNILAG-2026-001" | jq

# 2. Batch Verification
curl -s -X POST "https://vaasone-system.vercel.app/api/v1/verify/batch" \\
  -H "Content-Type: application/json" \\
  -d '{"ids": ["VAAS-UNILAG-2026-001", "VAAS-COVENANT-2026-001"]}' | jq`}
                </pre>
              </div>
            </div>

            {/* JavaScript / TypeScript */}
            <div id="code-js">
              <h3 className="text-sm font-semibold text-v-text mb-2 flex items-center gap-2">
                <Code2 className="size-4 text-v-muted-text" /> TypeScript / JavaScript
              </h3>
              <div className="rounded-xl border border-v-border bg-v-surface p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-v-text leading-relaxed">
{`async function verifyCredential(credentialId: string) {
  const url = \`https://vaasone-system.vercel.app/api/v1/verify?id=\${encodeURIComponent(credentialId)}\`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.outcome === 'valid') {
    console.log(\`Verified: \${data.credential.recipient_name} - \${data.credential.programme}\`);
    console.log(\`Stellar Tx: \${data.anchor.transaction_id}\`);
  } else {
    console.warn(\`Verification status: \${data.outcome}\`);
  }
}

// Execute
verifyCredential('VAAS-UNILAG-2026-001');`}
                </pre>
              </div>
            </div>

            {/* Python */}
            <div id="code-python">
              <h3 className="text-sm font-semibold text-v-text mb-2 flex items-center gap-2">
                <Code2 className="size-4 text-v-muted-text" /> Python (requests)
              </h3>
              <div className="rounded-xl border border-v-border bg-v-surface p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-v-text leading-relaxed">
{`import requests

def verify_student(credential_id: str):
    base_url = "https://vaasone-system.vercel.app/api/v1/verify"
    resp = requests.get(base_url, params={"id": credential_id})
    data = resp.json()
    
    if data.get("outcome") == "valid":
        cred = data["credential"]
        print(f"VALID: {cred['recipient_name']} ({cred['programme']})")
        print(f"Stellar Anchor: {data['anchor']['transaction_id']}")
    else:
        print(f"Status: {data.get('outcome')}")

if __name__ == "__main__":
    verify_student("VAAS-UNILAG-2026-001")`}
                </pre>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-v-border bg-v-surface py-8 px-5 sm:px-8 text-xs text-v-muted-text text-center">
        <p>© {new Date().getFullYear()} {APP_NAME}. Cryptographically secured on the Stellar network.</p>
      </footer>
    </div>
  )
}
