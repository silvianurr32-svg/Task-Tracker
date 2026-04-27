const cfg = {
  pending:        { label: 'Pending',        cls: 'bg-skin text-navy' },
  in_progress:    { label: 'In Progress',    cls: 'bg-sky/30 text-ink' },
  awaiting_proof: { label: 'Awaiting Review',cls: 'bg-blush/20 text-navy' },
  completed:      { label: 'Completed',      cls: 'bg-ink/10 text-ink' },
}

export default function StatusBadge({ status }) {
  const { label, cls } = cfg[status] || cfg.pending
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  )
}
