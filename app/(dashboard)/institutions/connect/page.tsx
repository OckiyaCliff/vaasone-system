'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Globe2, Loader2, Server } from 'lucide-react'
import { getSupportedAdapters } from '@/lib/interoperability/adapter-registry'

type Step = 'type' | 'config' | 'test' | 'done'

const adapters = getSupportedAdapters()

export default function ConnectSISPage() {
  const [step, setStep] = useState<Step>('type')
  const [adapterType, setAdapterType] = useState<string>('')
  const [endpoint, setEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  async function testConnection() {
    setTesting(true)
    setTestResult(null)

    try {
      /* For demo, test against our own dummy endpoints */
      const demoUrls: Record<string, string> = {
        rest: '/api/v1/demo/sis-a',
        soap: '/api/v1/demo/sis-b',
        csv: '/api/v1/demo/sis-c',
        json: '/api/v1/demo/sis-a',
        database: '/api/v1/demo/sis-a',
      }

      const testUrl = endpoint || demoUrls[adapterType] || '/api/v1/demo/sis-a'
      const res = await fetch(testUrl)
      const ok = res.ok

      setTestResult({
        success: ok,
        message: ok ? `Connection successful. Endpoint responded with ${res.status}.` : `Connection failed with status ${res.status}.`,
      })

      if (ok) setTimeout(() => setStep('done'), 1500)
    } catch {
      setTestResult({ success: false, message: 'Connection failed. Check the endpoint URL.' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link href="/institutions" className="inline-flex items-center gap-2 text-xs text-v-tertiary hover:text-v-text">
          <ArrowLeft className="size-3" /> Back to institutions
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-v-text">
          Connect Student Information System
        </h1>
        <p className="mt-2 text-sm text-v-secondary">
          Create a secure connection to your institution&apos;s existing records system.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8 flex items-center gap-3 text-xs text-v-faint">
        <span className={step === 'type' ? 'font-semibold text-v-text' : testResult?.success ? 'text-v-success' : ''}>1. Select type</span>
        <ArrowRight className="size-3" />
        <span className={step === 'config' ? 'font-semibold text-v-text' : ''}>2. Configure</span>
        <ArrowRight className="size-3" />
        <span className={step === 'test' ? 'font-semibold text-v-text' : ''}>3. Test</span>
        <ArrowRight className="size-3" />
        <span className={step === 'done' ? 'font-semibold text-v-success' : ''}>4. Connected</span>
      </div>

      {/* Step 1: Select adapter type */}
      {step === 'type' && (
        <div className="grid gap-3">
          {adapters.map((adapter) => (
            <button
              key={adapter.type}
              onClick={() => { setAdapterType(adapter.type); setStep('config') }}
              className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-colors ${
                adapterType === adapter.type ? 'border-v-accent bg-v-raised' : 'border-v-border hover:bg-v-hover'
              }`}
            >
              <div className="grid size-10 place-items-center rounded-xl bg-v-white">
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
        <div className="rounded-2xl border border-v-border bg-v-overlay p-6">
          <h3 className="text-sm font-semibold text-v-text">Connection details</h3>
          <p className="mt-1 text-xs text-v-tertiary">
            Enter the endpoint URL for your {adapters.find((a) => a.type === adapterType)?.label} connection.
          </p>
          <div className="mt-5 flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-v-muted-text">Endpoint URL</label>
              <input
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder={adapterType === 'rest' ? 'https://sis.university.edu/api/credentials' : adapterType === 'csv' ? 'https://sis.university.edu/export/credentials.csv' : 'https://sis.university.edu/soap/service'}
                className="w-full rounded-xl border border-v-border bg-v-white px-3 py-2.5 text-sm text-v-text outline-none placeholder:text-v-ghost focus:border-v-accent"
              />
            </div>
            {adapterType === 'rest' && (
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-v-muted-text">API Key (optional)</label>
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  type="password"
                  placeholder="Bearer token or API key"
                  className="w-full rounded-xl border border-v-border bg-v-white px-3 py-2.5 text-sm text-v-text outline-none placeholder:text-v-ghost focus:border-v-accent"
                />
              </div>
            )}
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep('type')} className="rounded-xl border border-v-border px-4 py-2.5 text-xs text-v-secondary">
              Back
            </button>
            <button onClick={() => setStep('test')} className="rounded-xl bg-v-accent px-4 py-2.5 text-xs font-semibold text-v-accent-fg">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Test */}
      {step === 'test' && (
        <div className="rounded-2xl border border-v-border bg-v-overlay p-6 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-v-raised">
            {testing ? <Loader2 className="size-6 animate-spin text-v-text" /> : testResult?.success ? <Check className="size-6 text-v-success" /> : <Server className="size-6 text-v-text" />}
          </div>
          <h3 className="mt-4 text-sm font-semibold text-v-text">
            {testing ? 'Testing connection…' : testResult?.success ? 'Connection verified' : 'Ready to test'}
          </h3>
          {testResult && (
            <p className={`mt-2 text-xs ${testResult.success ? 'text-v-success' : 'text-v-error'}`}>
              {testResult.message}
            </p>
          )}
          {!testing && !testResult?.success && (
            <button onClick={testConnection} className="mt-5 rounded-xl bg-v-accent px-5 py-2.5 text-xs font-semibold text-v-accent-fg">
              Test connection
            </button>
          )}
        </div>
      )}

      {/* Step 4: Done */}
      {step === 'done' && (
        <div className="rounded-2xl border border-v-border bg-v-success-bg p-6 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-v-white">
            <Check className="size-6 text-v-success" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-v-text">Integration connected</h3>
          <p className="mt-2 text-sm text-v-secondary">
            Your SIS connection is live. Credentials can now be synced and issued.
          </p>
          <Link
            href="/institutions"
            className="mt-5 inline-block rounded-xl bg-v-accent px-5 py-2.5 text-xs font-semibold text-v-accent-fg"
          >
            View institutions
          </Link>
        </div>
      )}
    </div>
  )
}
