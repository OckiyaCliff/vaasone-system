'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lock,
  Download,
  Database,
  Building2,
  Layers,
  FileCheck2,
  RefreshCw,
} from 'lucide-react'
import type { ParsedCredentialRow } from '@/lib/import-parser'

type InstitutionOption = {
  id: string
  name: string
}

export function ImportWizard({
  organizations = [],
  userOrganizationId,
  isSystemAdmin = false,
}: {
  organizations: InstitutionOption[]
  userOrganizationId: string | null
  isSystemAdmin?: boolean
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedOrgId, setSelectedOrgId] = useState<string>(userOrganizationId || organizations[0]?.id || '')
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [anchorToBlockchain, setAnchorToBlockchain] = useState(true)

  // Parse result
  const [parseResult, setParseResult] = useState<{
    fileName: string
    stats: { total: number; valid: number; invalid: number }
    detectedMapping: Record<string, string>
    previewRows: ParsedCredentialRow[]
    allRows: ParsedCredentialRow[]
  } | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [commitResult, setCommitResult] = useState<{
    importedCount: number
    anchoredCount: number
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
    setParsing(true)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('organizationId', selectedOrgId)

    try {
      const res = await fetch('/api/v1/credentials/import', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse database file.')
      }

      setParseResult(data)
      setStep(2)
    } catch (err: any) {
      setError(err.message || 'File parsing failed.')
    } finally {
      setParsing(false)
    }
  }

  const handleCommit = async () => {
    if (!parseResult || !selectedOrgId) return
    setCommitting(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/credentials/import/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: selectedOrgId,
          rows: parseResult.allRows,
          anchorToBlockchain,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to commit credentials.')
      }

      setCommitResult(data)
      setStep(3)
    } catch (err: any) {
      setError(err.message || 'Import commit failed.')
    } finally {
      setCommitting(false)
    }
  }

  const downloadSampleCSV = () => {
    const csvContent =
      'recipient_name,programme,student_reference,credential_type,award_title,classification,graduation_date,certificate_number,recipient_email\n' +
      'Adebayo Ogunlesi,B.Sc Mechanical Engineering,MECH/2022/014,degree,Bachelor of Science,First Class Honours,2026-06-20,UNILAG/ENG/2026/0482,adebayo@example.com\n' +
      'Fatima Al-Hassan,M.Sc Data Science,MSC/DS/2025/089,degree,Master of Science,Distinction,2026-07-15,UNILAG/CS/2026/0119,fatima@example.com\n' +
      'Chukwudi Eze,Diploma in Information Technology,DIT/2024/005,diploma,National Diploma,Upper Credit,2026-05-30,UNILAG/IT/2026/0045,chukwudi@example.com\n'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'vaasone_migration_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Wizard Progress Bar */}
      <div className="rounded-2xl border border-v-border bg-v-surface p-4">
        <div className="flex items-center justify-between max-w-xl mx-auto text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ${
                step >= 1 ? 'bg-v-accent text-v-accent-fg' : 'bg-v-raised text-v-muted-text'
              }`}
            >
              1
            </span>
            <span className={step === 1 ? 'font-semibold text-v-text' : 'text-v-muted-text'}>
              Upload File
            </span>
          </div>
          <div className="h-0.5 flex-1 mx-4 bg-v-border" />
          <div className="flex items-center gap-2">
            <span
              className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ${
                step >= 2 ? 'bg-v-accent text-v-accent-fg' : 'bg-v-raised text-v-muted-text'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'font-semibold text-v-text' : 'text-v-muted-text'}>
              Validate &amp; Map
            </span>
          </div>
          <div className="h-0.5 flex-1 mx-4 bg-v-border" />
          <div className="flex items-center gap-2">
            <span
              className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ${
                step === 3 ? 'bg-v-accent text-v-accent-fg' : 'bg-v-raised text-v-muted-text'
              }`}
            >
              3
            </span>
            <span className={step === 3 ? 'font-semibold text-v-text' : 'text-v-muted-text'}>
              Complete
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── STEP 1: Upload File ───────────────────────────── */}
      {step === 1 && (
        <div className="rounded-3xl border border-v-border bg-v-surface p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-v-text">
                Upload Student &amp; Credential Database
              </h2>
              <p className="text-xs text-v-secondary mt-1">
                Supports CSV spreadsheets, Excel workbooks (.xlsx), and legacy Excel files (.xls).
              </p>
            </div>

            <button
              type="button"
              onClick={downloadSampleCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-v-border bg-v-raised px-3.5 py-2 text-xs font-semibold text-v-text hover:bg-v-hover transition-colors shrink-0"
            >
              <Download className="size-3.5" />
              Download CSV Template
            </button>
          </div>

          {/* Institution Selector (for System Admins) */}
          {isSystemAdmin && organizations.length > 0 && (
            <div className="max-w-md">
              <label className="block text-xs font-semibold text-v-text mb-1.5">
                Target Institution / University
              </label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full rounded-xl border border-v-border bg-v-inset px-3 py-2.5 text-xs text-v-text outline-none"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (e.dataTransfer.files?.[0]) {
                handleFileChange(e.dataTransfer.files[0])
              }
            }}
            className="group cursor-pointer rounded-2xl border-2 border-dashed border-v-border bg-v-inset/40 p-12 text-center transition-all hover:border-v-text/40 hover:bg-v-inset/80"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileChange(e.target.files[0])
                }
              }}
            />

            <div className="grid size-14 place-items-center rounded-2xl bg-v-raised text-v-text mx-auto mb-4 group-hover:scale-105 transition-transform">
              {parsing ? (
                <Loader2 className="size-6 animate-spin text-v-accent" />
              ) : (
                <UploadCloud className="size-7" />
              )}
            </div>

            <h3 className="text-sm font-semibold text-v-text">
              {parsing ? 'Parsing and validating records...' : 'Drop your database file here, or browse'}
            </h3>

            <p className="mt-1.5 text-xs text-v-secondary">
              CSV or Excel (.xlsx, .xls) up to 25MB. Column headers will be automatically mapped.
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="rounded bg-v-raised px-2 py-0.5 text-[10px] font-mono text-v-secondary">
                .CSV
              </span>
              <span className="rounded bg-v-raised px-2 py-0.5 text-[10px] font-mono text-v-secondary">
                .XLSX
              </span>
              <span className="rounded bg-v-raised px-2 py-0.5 text-[10px] font-mono text-v-secondary">
                .XLS
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Validate & Map ────────────────────────── */}
      {step === 2 && parseResult && (
        <div className="rounded-3xl border border-v-border bg-v-surface p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {parseResult.fileName}
                </span>
                <span className="text-xs text-v-muted-text">File Parsed</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-v-text mt-1">
                Data Validation &amp; Preview
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-v-border px-3.5 py-2 text-xs font-semibold text-v-text hover:bg-v-hover transition-colors"
              >
                Change File
              </button>
              <button
                type="button"
                disabled={committing || parseResult.stats.valid === 0}
                onClick={handleCommit}
                className="inline-flex items-center gap-2 rounded-xl bg-v-accent px-5 py-2 text-xs font-semibold text-v-accent-fg hover:bg-v-accent-hover transition-colors disabled:opacity-50"
              >
                {committing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Migrating {parseResult.stats.valid} records...
                  </>
                ) : (
                  <>
                    Migrate {parseResult.stats.valid} Records
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 border-y border-v-border py-4">
            <div>
              <span className="text-xl font-bold text-v-text block">{parseResult.stats.total}</span>
              <span className="text-xs text-v-muted-text">Total Rows Parsed</span>
            </div>
            <div>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 block">
                {parseResult.stats.valid}
              </span>
              <span className="text-xs text-v-muted-text">Ready for Migration</span>
            </div>
            <div>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400 block">
                {parseResult.stats.invalid}
              </span>
              <span className="text-xs text-v-muted-text">Rows with Issues</span>
            </div>
          </div>

          {/* Blockchain Option Toggle */}
          <div className="rounded-2xl border border-v-border bg-v-raised p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-v-accent text-v-accent-fg shrink-0">
                <Lock className="size-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-v-text block">
                  Anchor to Stellar Distributed Ledger
                </span>
                <span className="text-[11px] text-v-muted-text block mt-0.5">
                  Records cryptographic SHA-256 fingerprints on Stellar testnet for tamper-proof verification.
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={anchorToBlockchain}
                onChange={(e) => setAnchorToBlockchain(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-v-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Preview Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-v-text">Preview (First 50 Rows)</span>
              <span className="text-[11px] text-v-muted-text">
                Showing {Math.min(parseResult.previewRows.length, 50)} of {parseResult.stats.total}
              </span>
            </div>

            <div className="rounded-2xl border border-v-border bg-v-surface overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-v-border bg-v-inset text-v-text font-semibold sticky top-0 z-10">
                    <th className="p-3">#</th>
                    <th className="p-3">Recipient Name</th>
                    <th className="p-3">Programme</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Student Ref</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-v-border text-v-secondary">
                  {parseResult.previewRows.map((row) => (
                    <tr key={row.rowIndex} className="hover:bg-v-hover">
                      <td className="p-3 font-mono text-[11px] text-v-muted-text">{row.rowIndex}</td>
                      <td className="p-3 font-medium text-v-text">{row.recipientName}</td>
                      <td className="p-3">{row.programme}</td>
                      <td className="p-3 capitalize">{row.credentialType}</td>
                      <td className="p-3 font-mono text-[11px]">{row.studentReference || '—'}</td>
                      <td className="p-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-3" /> Valid
                          </span>
                        ) : (
                          <span
                            title={row.errors.join(', ')}
                            className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400"
                          >
                            <AlertCircle className="size-3" /> Invalid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Complete ──────────────────────────────── */}
      {step === 3 && commitResult && (
        <div className="rounded-3xl border border-v-border bg-v-surface p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xl space-y-6">
          <div className="grid size-16 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="size-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-v-text">
              Database Migration Complete!
            </h2>
            <p className="text-xs text-v-secondary mt-2 leading-relaxed">
              Successfully imported{' '}
              <strong className="text-v-text font-semibold">{commitResult.importedCount} credentials</strong> into the
              Vaasone registry.
              {commitResult.anchoredCount > 0 && (
                <>
                  {' '}
                  Cryptographically anchored {commitResult.anchoredCount} records onto the Stellar blockchain testnet.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/credentials"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-v-accent px-5 py-3 text-xs font-semibold text-v-accent-fg hover:bg-v-accent-hover transition-colors"
            >
              <FileCheck2 className="size-3.5" />
              View Credentials Registry
            </Link>
            <button
              type="button"
              onClick={() => {
                setFile(null)
                setParseResult(null)
                setCommitResult(null)
                setStep(1)
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-v-border bg-v-raised px-5 py-3 text-xs font-semibold text-v-text hover:bg-v-hover transition-colors"
            >
              <RefreshCw className="size-3.5" />
              Import Another Database
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
