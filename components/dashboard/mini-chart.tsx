export function MiniChart({ data }: { data: number[] }) {
  return (
    <div className="flex h-full items-end gap-1">
      {data.map((height, index) => (
        <div
          key={index}
          className={`flex-1 rounded-t-sm ${index === data.length - 1 ? 'bg-v-accent' : 'bg-v-accent/15'}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}
