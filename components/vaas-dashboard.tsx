'use client'

import { useMemo, useState } from 'react'
import {
  Activity as ActivityIcon,
  ArrowUpRight,
  Blocks,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  FileCheck2,
  FilePlus2,
  Fingerprint,
  Globe2,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Network,
  PanelLeft,
  Plus,
  Search,
  ShieldCheck,
  University,
  X,
} from 'lucide-react'
import { activities, credentials, getActivityTone, getStatusLabel, institutionStats, platformStats, verificationVolume, workspace } from '@/lib/vaas-data'

type View = 'overview' | 'credentials' | 'verify' | 'institutions' | 'activity'

const navItems: { label: string; view: View; icon: typeof LayoutDashboard }[] = [
  { label: 'Overview', view: 'overview', icon: LayoutDashboard },
  { label: 'Credentials', view: 'credentials', icon: FileCheck2 },
  { label: 'Verify credential', view: 'verify', icon: ShieldCheck },
  { label: 'Institutions', view: 'institutions', icon: University },
  { label: 'Activity log', view: 'activity', icon: ActivityIcon },
]

export function VaasDashboard() {
  const [view, setView] = useState<View>('overview')
  const [search, setSearch] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [verificationId, setVerificationId] = useState('')
  const [verificationState, setVerificationState] = useState<'idle' | 'verified' | 'not-found'>('idle')

  const filteredCredentials = useMemo(() => credentials.filter((credential) => {
    const query = search.toLowerCase()
    return credential.recipient.toLowerCase().includes(query) || credential.id.toLowerCase().includes(query) || credential.institution.toLowerCase().includes(query)
  }), [search])

  function navigate(nextView: View) {
    setView(nextView)
    setMobileNavOpen(false)
  }

  async function verifyCredential() {
    const normalizedId = verificationId.trim()
    if (!normalizedId) {
      setVerificationState('not-found')
      return
    }

    try {
      const response = await fetch(`/api/credentials/verify?id=${encodeURIComponent(normalizedId)}`)
      setVerificationState(response.ok ? 'verified' : 'not-found')
    } catch {
      setVerificationState('not-found')
    }
  }

  return (
    <main className="min-h-screen bg-[#d7d7d5] p-3 text-[#171717] sm:p-5 lg:p-7">
      <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-[1480px] grid-cols-1 overflow-hidden rounded-[28px] bg-[#f5f5f3] shadow-[0_24px_80px_rgba(0,0,0,0.13)] lg:grid-cols-[232px_1fr]">
        <aside className={`${mobileNavOpen ? 'fixed inset-3 z-40 flex' : 'hidden'} flex-col border-black/10 bg-[#f5f5f3] p-5 lg:static lg:flex lg:border-r lg:p-6`}>
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 text-left" onClick={() => navigate('overview')} aria-label="Go to overview">
              <span className="grid size-8 place-items-center rounded-xl bg-black text-white"><Network className="size-4" /></span>
              <span className="text-[15px] font-semibold tracking-[-0.03em]">Axiom<span className="font-normal text-black/45">.trust</span></span>
            </button>
            <button className="rounded-lg p-2 lg:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X className="size-4" /></button>
          </div>

          <div className="mt-10 flex flex-1 flex-col">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">Workspace</p>
            <nav className="flex flex-col gap-1" aria-label="Primary navigation">
              {navItems.map(({ label, view: itemView, icon: Icon }) => (
                <button key={itemView} onClick={() => navigate(itemView)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${view === itemView ? 'bg-black text-white' : 'text-black/55 hover:bg-black/[0.05] hover:text-black'}`}>
                  <Icon className="size-4" />
                  <span>{label}</span>
                  {itemView === 'credentials' && <span className={`ml-auto text-[11px] ${view === itemView ? 'text-white/60' : 'text-black/30'}`}>12.4k</span>}
                </button>
              ))}
            </nav>

            <div className="mt-auto hidden rounded-2xl bg-[#e9e9e7] p-4 lg:block">
              <div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-semibold">Trust layer</span><span className="flex items-center gap-1 text-[10px] text-black/45"><span className="size-1.5 rounded-full bg-[#4a8b5c]" />Operational</span></div>
              <div className="flex items-center gap-2 text-[11px] text-black/50"><Blocks className="size-3.5" /> Stellar Network <ArrowUpRight className="ml-auto size-3" /></div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-black/10 pt-5">
            <div className="grid size-8 place-items-center rounded-full bg-black text-[11px] font-semibold text-white">AT</div>
            <div className="min-w-0"><p className="truncate text-[12px] font-semibold">{workspace.name}</p><p className="text-[10px] text-black/40">{workspace.role}</p></div>
            <MoreHorizontal className="ml-auto size-4 text-black/35" />
          </div>
        </aside>

        <section className="min-w-0">
          <header className="flex h-[76px] items-center justify-between border-b border-black/10 px-5 sm:px-8">
            <div className="flex items-center gap-3"><button className="rounded-lg p-2 hover:bg-black/5 lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></button><div><p className="text-[11px] text-black/40">Workspace / {view === 'overview' ? 'Overview' : navItems.find((item) => item.view === view)?.label}</p><h1 className="text-lg font-semibold tracking-[-0.04em]">{view === 'overview' ? 'Good morning, Axiom' : navItems.find((item) => item.view === view)?.label}</h1></div></div>
            <div className="flex items-center gap-2"><div className="hidden items-center gap-2 rounded-xl border border-black/10 bg-white/50 px-3 py-2 sm:flex"><Search className="size-3.5 text-black/35" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records" className="w-28 bg-transparent text-xs outline-none placeholder:text-black/35" /></div><button onClick={() => navigate('verify')} className="flex items-center gap-2 rounded-xl bg-black px-3 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"><Plus className="size-3.5" /> <span className="hidden sm:inline">Issue credential</span></button></div>
          </header>

          <div className="p-5 sm:p-8">
            {view === 'overview' && <Overview onNavigate={navigate} />}
            {view === 'credentials' && <Credentials credentials={filteredCredentials} search={search} />}
            {view === 'verify' && <Verify verificationId={verificationId} setVerificationId={setVerificationId} verificationState={verificationState} onVerify={verifyCredential} />}
            {view === 'institutions' && <Institutions />}
            {view === 'activity' && <ActivityLog />}
          </div>
        </section>
      </div>
    </main>
  )
}

function Overview({ onNavigate }: { onNavigate: (view: View) => void }) {
  return <div className="flex flex-col gap-6">
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="relative min-h-[270px] overflow-hidden rounded-[24px] bg-black p-7 text-white sm:p-9"><div className="relative z-10 max-w-[330px]"><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Credential infrastructure</p><h2 className="text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[0.94] tracking-[-0.075em]">Trust, made<br /><span className="text-white/45">verifiable.</span></h2><p className="mt-6 max-w-[275px] text-xs leading-5 text-white/55">Issue once. Verify anywhere. A common trust layer for Africa&apos;s academic credentials.</p></div><div className="absolute -bottom-20 -right-8 size-64 rounded-full border border-white/20 sm:size-80" /><div className="absolute -bottom-10 -right-2 size-48 rounded-full border border-white/20 sm:size-60" /><ArrowUpRight className="absolute right-7 top-7 size-6" /></section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1"><section className="rounded-[24px] bg-[#e6e6e4] p-6"><div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/40">Network health</p><p className="mt-3 text-3xl font-medium tracking-[-0.07em]">99.98<span className="text-base text-black/35">%</span></p></div><div className="grid size-10 place-items-center rounded-full border border-black/10"><Check className="size-4" /></div></div><div className="mt-6 flex items-center justify-between text-[11px] text-black/45"><span>Stellar mainnet</span><span className="font-medium text-[#4a8b5c]">Operational</span></div></section><section className="rounded-[24px] bg-[#e6e6e4] p-6"><div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/40">Verification rate</p><p className="mt-3 text-3xl font-medium tracking-[-0.07em]">98.7<span className="text-base text-black/35">%</span></p></div><Fingerprint className="size-5 text-black/30" /></div><div className="mt-5 h-9"><MiniChart /></div></section></div>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">{platformStats.map((stat) => <div key={stat.label} className="rounded-[20px] border border-black/10 bg-white/45 p-5"><p className="text-[11px] text-black/45">{stat.label}</p><div className="mt-3 flex items-end gap-2"><p className="text-2xl font-medium tracking-[-0.06em]">{stat.value}</p><span className="mb-1 rounded-full bg-[#dcebdc] px-2 py-0.5 text-[10px] font-semibold text-[#417447]">{stat.change}</span></div><p className="mt-1 text-[10px] text-black/35">{stat.detail}</p></div>)}</div>
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[24px] bg-white/55 p-6"><div className="mb-6 flex items-center justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/40">Recent activity</p><h3 className="mt-1 text-lg font-semibold tracking-[-0.04em]">What&apos;s happening</h3></div><button onClick={() => onNavigate('activity')} className="text-[11px] font-semibold text-black/45 hover:text-black">View all <ArrowUpRight className="ml-1 inline size-3" /></button></div><div className="flex flex-col">{activities.slice(0, 3).map((activity) => <ActivityRow key={activity.id} activity={activity} />)}</div></section>
      <section className="rounded-[24px] bg-[#e6e6e4] p-6"><div className="flex items-center justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/40">Issue credentials</p><h3 className="mt-1 text-lg font-semibold tracking-[-0.04em]">Connect your SIS</h3></div><ArrowUpRight className="size-5" /></div><p className="mt-10 max-w-[240px] text-sm leading-5 text-black/55">Create a secure connection to start issuing verifiable credentials from your existing system.</p><button onClick={() => onNavigate('institutions')} className="mt-5 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white">View integrations</button></section>
    </div>
  </div>
}

function Credentials({ credentials: records, search }: { credentials: typeof credentials; search: string }) {
  return <section className="rounded-[24px] bg-white/55 p-5 sm:p-6"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/40">Credential registry</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.05em]">All credentials <span className="text-sm font-normal text-black/35">{records.length} records</span></h2></div><div className="flex items-center gap-2"><button className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-xs text-black/55"><ChevronDown className="size-3" /> All statuses</button><button className="rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white"><FilePlus2 className="mr-1 inline size-3.5" /> Issue new</button></div></div>{search && <p className="mb-4 text-xs text-black/45">Showing results for “{search}”</p>}<div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs"><thead className="border-b border-black/10 text-[10px] uppercase tracking-[0.12em] text-black/35"><tr><th className="pb-3 font-semibold">Recipient</th><th className="pb-3 font-semibold">Credential ID</th><th className="pb-3 font-semibold">Institution</th><th className="pb-3 font-semibold">Issued</th><th className="pb-3 font-semibold">Status</th><th className="pb-3" /></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-b border-black/[0.06] last:border-0"><td className="py-4 font-semibold">{record.recipient}<span className="mt-1 block text-[10px] font-normal text-black/40">{record.program}</span></td><td className="py-4 font-mono text-[11px] text-black/55">{record.id}</td><td className="py-4 text-black/55">{record.institution}</td><td className="py-4 text-black/45">{record.issuedAt}</td><td className="py-4"><StatusPill status={record.status} /></td><td className="py-4 text-right"><button aria-label={`Copy ${record.id}`} className="rounded-lg p-2 text-black/35 hover:bg-black/5 hover:text-black"><Copy className="size-3.5" /></button></td></tr>)}</tbody></table></div></section>
}

function Verify({ verificationId, setVerificationId, verificationState, onVerify }: { verificationId: string; setVerificationId: (value: string) => void; verificationState: 'idle' | 'verified' | 'not-found'; onVerify: () => void }) {
  return <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]"><section className="rounded-[24px] bg-black p-7 text-white sm:p-10"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Public verification</p><h2 className="mt-4 max-w-[430px] text-4xl font-medium leading-[0.94] tracking-[-0.07em]">Check a credential<br /><span className="text-white/40">in seconds.</span></h2><p className="mt-6 max-w-[350px] text-sm leading-6 text-white/55">Enter a credential ID to confirm its issuer, recipient, and immutable trust record.</p><div className="mt-10 flex max-w-[470px] gap-2 rounded-2xl bg-white p-2"><input value={verificationId} onChange={(event) => setVerificationId(event.target.value)} placeholder="e.g. AXM-2024-00482" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-black outline-none placeholder:text-black/30" /><button onClick={onVerify} className="rounded-xl bg-black px-4 py-3 text-xs font-semibold text-white">Verify</button></div>{verificationState !== 'idle' && <div className={`mt-5 flex items-center gap-3 rounded-xl px-4 py-3 text-xs ${verificationState === 'verified' ? 'bg-[#dcebdc] text-[#315e36]' : 'bg-white/10 text-white/70'}`}>{verificationState === 'verified' ? <Check className="size-4" /> : <CircleHelp className="size-4" />}{verificationState === 'verified' ? 'Credential verified on Stellar mainnet.' : 'No active verified credential found for this ID.'}</div>}</section><section className="rounded-[24px] bg-[#e6e6e4] p-7 sm:p-10"><div className="flex size-12 items-center justify-center rounded-2xl bg-white"><Fingerprint className="size-6" /></div><h3 className="mt-7 text-xl font-semibold tracking-[-0.05em]">Verification is public by design</h3><p className="mt-3 max-w-[330px] text-sm leading-6 text-black/55">Anyone can independently verify a credential without creating an account or contacting the issuing institution.</p><div className="mt-8 flex flex-col gap-3 text-xs text-black/55"><div className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-white text-[10px] font-semibold">01</span>Issuer signature checked</div><div className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-white text-[10px] font-semibold">02</span>Credential hash matched</div><div className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-white text-[10px] font-semibold">03</span>Trust record confirmed</div></div></section></div>
}

function Institutions() { return <div className="flex flex-col gap-4"><section className="rounded-[24px] bg-black p-7 text-white sm:p-9"><div className="flex items-start justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Institution network</p><h2 className="mt-3 text-4xl font-medium tracking-[-0.07em]">27 institutions.<br /><span className="text-white/40">One trust layer.</span></h2></div><Globe2 className="size-6 text-white/60" /></div><div className="mt-10 grid max-w-[620px] grid-cols-3 gap-4 border-t border-white/10 pt-5 text-xs text-white/55"><div><span className="block text-xl font-medium text-white">27</span>connected</div><div><span className="block text-xl font-medium text-white">12.4k</span>credentials</div><div><span className="block text-xl font-medium text-white">6</span>countries</div></div></section><section className="rounded-[24px] bg-white/55 p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/40">Connected institutions</p><h3 className="mt-1 text-lg font-semibold tracking-[-0.04em]">Integration health</h3></div><button className="rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white"><Plus className="mr-1 inline size-3" /> Add institution</button></div><div className="grid gap-3">{institutionStats.map((institution) => <div key={institution.name} className="flex items-center gap-4 rounded-2xl bg-[#e9e9e7] p-4"><div className="grid size-10 place-items-center rounded-xl bg-white text-[11px] font-semibold">{institution.initials}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{institution.name}</p><p className="mt-1 text-[11px] text-black/40">{institution.country} · {institution.credentials} credentials</p></div><span className={`hidden rounded-full px-2 py-1 text-[10px] font-semibold sm:inline ${institution.status === 'Healthy' ? 'bg-[#dcebdc] text-[#417447]' : 'bg-[#f1ead2] text-[#8b7133]'}`}>{institution.status}</span><MoreHorizontal className="size-4 text-black/35" /></div>)}</div></section></div> }

function ActivityLog() { return <section className="rounded-[24px] bg-white/55 p-6"><div className="mb-6 flex items-center justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/40">Audit trail</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.05em]">Activity log</h2></div><button className="rounded-xl border border-black/10 px-3 py-2 text-xs text-black/55">Export log</button></div><div className="flex flex-col">{activities.map((activity) => <ActivityRow key={activity.id} activity={activity} />)}</div></section> }

function ActivityRow({ activity }: { activity: (typeof activities)[number] }) { const tone = getActivityTone(activity.kind); return <div className="flex items-center gap-3 border-b border-black/[0.07] py-4 last:border-0"><div className={`grid size-8 place-items-center rounded-full ${tone === 'dark' ? 'bg-black text-white' : tone === 'muted' ? 'bg-[#e2e2e0] text-black/55' : 'bg-[#dcebdc] text-[#417447]'}`}>{tone === 'dark' ? <X className="size-3.5" /> : tone === 'muted' ? <Network className="size-3.5" /> : <Check className="size-3.5" />}</div><div className="min-w-0 flex-1"><p className="text-xs font-semibold">{activity.label}</p><p className="truncate text-[11px] text-black/45">{activity.subject}</p></div><span className="text-[10px] text-black/35">{activity.time}</span></div> }

function StatusPill({ status }: { status: (typeof credentials)[number]['status'] }) { return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status === 'verified' ? 'bg-[#dcebdc] text-[#417447]' : status === 'pending' ? 'bg-[#f1ead2] text-[#8b7133]' : 'bg-black text-white'}`}><span className={`size-1.5 rounded-full ${status === 'verified' ? 'bg-[#4a8b5c]' : status === 'pending' ? 'bg-[#c1993e]' : 'bg-white'}`} />{getStatusLabel(status)}</span> }

function MiniChart() { return <div className="flex h-full items-end gap-1">{verificationVolume.map((height, index) => <div key={index} className={`flex-1 rounded-t-sm ${index === verificationVolume.length - 1 ? 'bg-black' : 'bg-black/15'}`} style={{ height: `${height}%` }} />)}</div> }
