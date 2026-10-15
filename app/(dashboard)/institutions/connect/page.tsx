'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Globe2,
  Loader2,
  Server,
  ShieldCheck,
  Copy,
} from 'lucide-react'
import { getSupportedAdapters } from '@/lib/interoperability/adapter-registry'

type Step = 'type' | 'config' | 'test' | 'done'

const adapters = getSupportedAdapters()

export default function ConnectSISPage() {
  const [step, setStep] = useState<Step>('type')
  const [adapterType, setAdapterType] = useState<string>('rest')
  const [endpoint, setEndpoint] = useState('http://localhost:3001/api/students')
  const [apiKey, setApiKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; importedCount?: number } | null>(null)
  const [copied, setCopied] = useState(false)

  async function testConnection() {
    setTesting(true)
    setTestResult(null)

    try {
      const targetEndpoint = endpoint.trim() || 'http://localhost:3001/api/students'

      // Call our backend connect-sis API to test, persist, and ingest
      const res = await fetch('/api/v1/institutions/connect-sis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adapterType,
          endpoint: targetEndpoint,
          apiKey: apiKey.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `Connection established. Synced records.`,
          importedCount: data.importedCount,
        })
        setTimeout(() => setStep('done'), 1200)
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection failed. Verify the endpoint URL.',
        })
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection failed. Check network or server status.',
      })
    } finally {
      setTesting(false)
    }
  }

  function copyWebhookUrl() {
    const url = `${window.location.origin}/api/v1/institutions/sync`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl py-2">
      <div className="mb-8">
        <Link href="/institutions" className="inline-flex items-center gap-2 text-xs text-v-tertiary hover:text-v-text transition-colors">
          <ArrowLeft className="size-3" /> Back to institutions
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-v-text">
          Connect Student Information System
        </h1>
        <p className="mt-2 text-sm text-v-secondary leading-relaxed">
          Establish an automated cryptographic bridge between your university records database and the Vaasone Trust Layer.
        </p>
      </div>

      {/* Progress Wizard */}
      <div className="mb-8 flex items-center gap-3 text-xs text-v-faint">
        <span className={step === 'type' ? 'font-semibold text-v-text' : testResult?.success ? 'text-emerald-600 font-medium' : ''}>1. Select type</span>
        <ArrowRight className="size-3" />
        <span className={step === 'config' ? 'font-semibold text-v-text' : ''}>2. Configure</span>
        <ArrowRight className="size-3" />
        <span className={step === 'test' ? 'font-semibold text-v-text' : ''}>3. Test</span>
        <ArrowRight className="size-3" />
        <span className={step === 'done' ? 'font-semibold text-emerald-600' : ''}>4. Connected</span>
      </div>

      {/* Step 1: Select adapter type */}
      {step === 'type' && (
        <div className="grid gap-3">
          {adapters.map((adapter) => (
            <button
              key={adapter.type}
              onClick={() => { setAdapterType(adapter.type); setStep('config') }}
              className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                adapterType === adapter.type ? 'border-v-accent bg-v-raised shadow-sm' : 'border-v-border hover:bg-v-hover'
              }`}
            >
              <div className="grid size-10 place-items-center rounded-xl bg-v-surface border border-v-border">
                {adapter.type === 'rest' ? <Server className="size-4 text-v-text" /> : <Globe2 className="size-4 text-v-text" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-v-text">{adapter.label}</p>
                <p className="mt-0.5 text-xs text-v-tertiary">{adapter.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 'config' && (
        <div className="rounded-2xl border border-v-border bg-v-surface p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-v-text">Connection details</h3>
          <p className="mt-1 text-xs text-v-tertiary">
            Enter the endpoint URL for your {adapters.find((a) => a.type === adapterType)?.label} service or local university daemon.
          </p>
          <div className="mt-5 flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-v-muted-text">
                Endpoint URL (University SIS or Local Daemon)
              </label>
              <input
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="http://localhost:3001/api/students"
                className="w-full rounded-xl border border-v-border bg-v-bg px-3.5 py-2.5 text-sm text-v-text outline-none placeholder:text-v-ghost focus:border-v-accent font-mono"
              />
              <span className="mt-1.5 block text-[11px] text-v-muted-text">
                For the local demo university portal, use: <code className="font-mono text-v-text">http://localhost:3001/api/students</code>
              </span>
            </div>
            {adapterType === 'rest' && (
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-v-muted-text">API Key / Bearer Token (optional)</label>
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  type="password"
                  placeholder="Leave empty for local demo daemon"
                  className="w-full rounded-xl border border-v-border bg-v-bg px-3.5 py-2.5 text-sm text-v-text outline-none placeholder:text-v-ghost focus:border-v-accent"
                />
              </div>
            )}
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep('type')} className="rounded-xl border border-v-border px-4 py-2.5 text-xs text-v-secondary hover:bg-v-hover">
              Back
            </button>
            <button onClick={() => setStep('test')} className="rounded-xl bg-v-accent px-5 py-2.5 text-xs font-semibold text-v-accent-fg hover:opacity-90">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Test */}
      {step === 'test' && (
        <div className="rounded-2xl border border-v-border bg-v-surface p-7 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-v-raised border border-v-border">
            {testing ? (
              <Loader2 className="size-6 animate-spin text-v-text" />
            ) : testResult?.success ? (
              <Check className="size-6 text-emerald-600" />
            ) : (
              <Server className="size-6 text-v-text" />
            )}
          </div>
          <h3 className="mt-4 text-sm font-semibold text-v-text">
            {testing ? 'Testing handshake & synchronizing records…' : testResult?.success ? 'Connection Verified' : 'Ready to Connect'}
          </h3>
          <p className="mt-1 text-xs text-v-muted-text">
            Target Endpoint: <code className="font-mono text-v-text">{endpoint}</code>
          </p>
          {testResult && (
            <p className={`mt-3 text-xs font-medium ${testResult.success ? 'text-emerald-600' : 'text-red-500'}`}>
              {testResult.message}
            </p>
          )}
          {!testing && !testResult?.success && (
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setStep('config')} className="rounded-xl border border-v-border px-4 py-2.5 text-xs text-v-secondary">
                Back
              </button>
              <button onClick={testConnection} className="rounded-xl bg-v-accent px-5 py-2.5 text-xs font-semibold text-v-accent-fg">
                Test Connection &amp; Synchronize
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Done */}
      {step === 'done' && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-7 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 flex-shrink-0">
              <Check className="size-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-v-text">Integration Connected &amp; Live</h3>
              <p className="mt-1 text-xs text-v-secondary leading-relaxed">
                Your institution&apos;s Student Information System is now actively connected to the Vaasone Trust Layer.
                {testResult?.importedCount ? ` ${testResult.importedCount} academic certificates were successfully synchronized.` : ''}
              </p>

              {/* Webhook URL Box */}
              <div className="mt-5 rounded-xl border border-v-border bg-v-surface p-4">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-v-muted-text mb-1">
                  Active Ingestion Webhook Listener
                </span>
                <p className="text-[11px] text-v-tertiary mb-2">
                  When your university registrar adds, updates, or revokes student records in your portal, events automatically flow to:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={typeof window !== 'undefined' ? `${window.location.origin}/api/v1/institutions/sync` : '/api/v1/institutions/sync'}
                    className="w-full rounded-lg border border-v-border bg-v-bg px-3 py-1.5 font-mono text-xs text-v-text outline-none select-all"
                  />
                  <button
                    onClick={copyWebhookUrl}
                    className="inline-flex items-center gap-1 rounded-lg border border-v-border bg-v-surface px-3 py-1.5 text-xs font-medium text-v-text hover:bg-v-hover transition-colors flex-shrink-0"
                  >
                    <Copy className="size-3.5" />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/credentials"
                  className="rounded-xl bg-v-accent px-5 py-2.5 text-xs font-semibold text-v-accent-fg hover:opacity-90 transition-opacity"
                >
                  View Certificates in Dashboard
                </Link>
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-v-border bg-v-surface px-4 py-2.5 text-xs font-medium text-v-text hover:bg-v-hover transition-colors"
                >
                  Open University Portal (Port 3001)
                  <ExternalLink className="size-3 text-v-muted-text" />
                </a>
                <Link
                  href="/institutions"
                  className="rounded-xl border border-v-border px-4 py-2.5 text-xs font-medium text-v-secondary hover:text-v-text transition-colors"
                >
                  Institutions Directory
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
