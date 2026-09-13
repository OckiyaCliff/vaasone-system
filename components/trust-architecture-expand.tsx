'use client'

import React from 'react'
import Link from 'next/link'
import {
  Building2,
  Lock,
  Zap,
  ShieldCheck,
  Network,
  Database,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  QrCode,
  FileCheck2,
  Sparkles,
} from 'lucide-react'
import { ScrollExpand } from '@/components/ScrollExpand'

export function TrustArchitectureExpand() {
  return (
    <section id="features" className="relative bg-[#040711] text-white py-24 overflow-hidden">
      {/* Luminous aurora glow effect at the top of the section, inspired by reference design */}
      <div className="absolute top-0 inset-x-0 h-96 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[350px] bg-gradient-to-b from-cyan-500/25 via-blue-600/15 to-transparent rounded-full blur-3xl -translate-y-1/2 opacity-70" />
      </div>

      {/* ── Section Header ───────────────────────────────────── */}
      <div className="relative max-w-4xl mx-auto px-5 text-center mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-3 mb-5">
          <span className="w-8 h-px bg-gradient-to-r from-transparent to-cyan-400/60" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Sparkles className="size-3 text-cyan-400" />
            Trust Architecture
          </span>
          <span className="w-8 h-px bg-gradient-to-l from-transparent to-cyan-400/60" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] text-white leading-tight">
          How Vaasone Guarantees Authenticity
        </h2>

        <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Scroll through the 3 core pillars of our decentralized verification layer.
          Watch each architecture stage expand to reveal cryptographic and operational details.
        </p>
      </div>

      {/* ── Scroll-Expanding Stages ──────────────────────────── */}
      <div className="flex flex-col gap-12 sm:gap-16">
        {/* ── STAGE 01: Accredited Issuance ─────────────────── */}
        <ScrollExpand
          title="01 · Accredited Issuance"
          scrollHint="Scroll to expand protocol stage"
          startWidth={56}
          startHeight={64}
          startRadius={28}
          endRadius={0}
          scrollDistance={0.9}
          holdDistance={0.35}
          overlayScrim={0.5}
          useWindowScroll={true}
          background={
            <div className="relative w-full h-full bg-[#070b16] flex items-center justify-center overflow-hidden border border-cyan-500/20">
              {/* Radial glow */}
              <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />
              {/* Geometric grid lines */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
                  backgroundSize: '32px 32px',
                }}
              />
              <div className="relative flex flex-col items-center text-center p-6 opacity-30 pointer-events-none">
                <div className="size-24 rounded-3xl border border-cyan-400/30 bg-cyan-950/40 grid place-items-center mb-4">
                  <Building2 className="size-12 text-cyan-400" />
                </div>
                <span className="text-xs font-mono tracking-widest text-cyan-300 uppercase">
                  Accredited University Mint
                </span>
              </div>
            </div>
          }
        >
          <div className="max-w-4xl mx-auto p-6 sm:p-12 text-left bg-black/60 backdrop-blur-2xl rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-1 text-xs font-mono text-cyan-300">
                <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Stage 01 — Accredited Issuance
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Cryptographic Minting &amp; Legacy Data Migration
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Accredited universities and certification authorities issue degrees and diplomas with unique cryptographic fingerprints.
                Registrars can issue certificates one-by-one or migrate historical student registries in bulk using our high-speed CSV &amp; Excel import engine.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Register Institution <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  href="/import"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
                >
                  <FileCheck2 className="size-3.5 text-cyan-400" />
                  Excel Migration Tool
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-cyan-500/20 bg-[#091124]/90 p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-cyan-400/80 border-b border-cyan-500/20 pb-2">
                <span>UNIVERSITY REGISTRAR</span>
                <span className="text-emerald-400">● LIVE</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">ISSUING INSTITUTION</span>
                <span className="text-white font-semibold text-xs">University of Lagos</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">INGESTION CHANNELS</span>
                <span className="text-slate-200 text-xs">Direct Webhook • CSV / Excel • SIS API</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">SECURITY AUDIT</span>
                <span className="text-emerald-300 text-xs">Admin Accreditation Verified</span>
              </div>
            </div>
          </div>
        </ScrollExpand>

        {/* ── STAGE 02: Stellar Ledger Anchoring ────────────── */}
        <ScrollExpand
          title="02 · Stellar Blockchain Anchoring"
          scrollHint="Scroll to expand protocol stage"
          startWidth={56}
          startHeight={64}
          startRadius={28}
          endRadius={0}
          scrollDistance={0.9}
          holdDistance={0.35}
          overlayScrim={0.5}
          useWindowScroll={true}
          background={
            <div className="relative w-full h-full bg-[#060a16] flex items-center justify-center overflow-hidden border border-blue-500/20">
              {/* Radial glow */}
              <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-600/25 via-indigo-600/15 to-transparent blur-3xl pointer-events-none" />
              {/* Network nodes background */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(147,197,253,0.3) 1px, transparent 0)',
                  backgroundSize: '28px 28px',
                }}
              />
              <div className="relative flex flex-col items-center text-center p-6 opacity-30 pointer-events-none">
                <div className="size-24 rounded-3xl border border-blue-400/30 bg-blue-950/40 grid place-items-center mb-4">
                  <Network className="size-12 text-blue-400" />
                </div>
                <span className="text-xs font-mono tracking-widest text-blue-300 uppercase">
                  Stellar Consensus Protocol
                </span>
              </div>
            </div>
          }
        >
          <div className="max-w-4xl mx-auto p-6 sm:p-12 text-left bg-black/60 backdrop-blur-2xl rounded-3xl border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-mono text-blue-300">
                <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                Stage 02 — Distributed Ledger
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Immutable Stellar Blockchain Proof
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The canonical certificate details are converted into a 256-bit cryptographic digest and submitted to the Stellar blockchain testnet/mainnet.
                Zero student personal information is stored on-chain, guaranteeing full NDPR &amp; GDPR compliance while achieving mathematical immutability.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/20"
                >
                  View Cryptographic Specs <ArrowRight className="size-3.5" />
                </Link>
                <a
                  href="https://stellar.expert/explorer/testnet"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="size-3.5 text-blue-400" />
                  Stellar Horizon Explorer
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-blue-500/20 bg-[#080e22]/90 p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-blue-400/80 border-b border-blue-500/20 pb-2">
                <span>ON-CHAIN ANCHOR</span>
                <span className="text-emerald-400">IMMUTABLE</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">NETWORK</span>
                <span className="text-white text-xs">Stellar Testnet Horizon</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">TRANSACTION HASH</span>
                <span className="text-blue-300 text-[11px] truncate block">90e2f5b863d043ff8e09f5...</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">PRIVACY GUARANTEE</span>
                <span className="text-emerald-300 text-xs">0% PII On-Chain (Zero-Knowledge)</span>
              </div>
            </div>
          </div>
        </ScrollExpand>

        {/* ── STAGE 03: Frictionless Verification ───────────── */}
        <ScrollExpand
          title="03 · Frictionless Public Verification"
          scrollHint="Scroll to expand protocol stage"
          startWidth={56}
          startHeight={64}
          startRadius={28}
          endRadius={0}
          scrollDistance={0.9}
          holdDistance={0.35}
          overlayScrim={0.5}
          useWindowScroll={true}
          background={
            <div className="relative w-full h-full bg-[#050914] flex items-center justify-center overflow-hidden border border-emerald-500/20">
              {/* Radial glow */}
              <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-600/10 to-transparent blur-3xl pointer-events-none" />
              {/* Geometric pattern */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(52,211,153,0.3) 1px, transparent 0)',
                  backgroundSize: '30px 30px',
                }}
              />
              <div className="relative flex flex-col items-center text-center p-6 opacity-30 pointer-events-none">
                <div className="size-24 rounded-3xl border border-emerald-400/30 bg-emerald-950/40 grid place-items-center mb-4">
                  <ShieldCheck className="size-12 text-emerald-400" />
                </div>
                <span className="text-xs font-mono tracking-widest text-emerald-300 uppercase">
                  Sub-350ms Truth Verification
                </span>
              </div>
            </div>
          }
        >
          <div className="max-w-4xl mx-auto p-6 sm:p-12 text-left bg-black/60 backdrop-blur-2xl rounded-3xl border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-mono text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Stage 03 — Instant Verification
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Frictionless Verification for All
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Employers, embassies, and recruiters verify qualifications in milliseconds with zero login, zero subscription fees, and no phone tag.
                Enterprise background check platforms can also connect via high-throughput batch REST APIs.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="#verify"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-black hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Verify a Credential Now <Zap className="size-3.5" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Read API Docs
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-emerald-500/20 bg-[#06121e]/90 p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-emerald-400/80 border-b border-emerald-500/20 pb-2">
                <span>VERIFICATION TELEMETRY</span>
                <span className="text-emerald-400">100% SUCCESS</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">LOOKUP LATENCY</span>
                <span className="text-white font-bold text-xs">&lt; 350ms (Global Edge)</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">ACCESS REQUIREMENT</span>
                <span className="text-emerald-300 text-xs">Public • Zero Login • No Paywall</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">DEVELOPER INTEGRATION</span>
                <span className="text-slate-200 text-xs">GET /api/v1/verify &amp; POST batch</span>
              </div>
            </div>
          </div>
        </ScrollExpand>
      </div>
    </section>
  )
}
