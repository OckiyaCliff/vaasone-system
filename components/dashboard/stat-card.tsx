export function StatCard({ label, value, change, detail }: { label: string; value: string; change: string; detail: string }) {
  return (
    <div className="rounded-[20px] border border-v-border bg-v-overlay p-5">
      <p className="text-[11px] text-v-tertiary">{label}</p>
      <div className="mt-3 flex items-end gap-2">
        <p className="text-2xl font-medium tracking-[-0.06em] text-v-text">{value}</p>
        <span className="mb-1 rounded-full bg-v-success-bg px-2 py-0.5 text-[10px] font-semibold text-v-success">{change}</span>
      </div>
      <p className="mt-1 text-[10px] text-v-faint">{detail}</p>
    </div>
  )
}
