interface ScoreBadgeProps {
  label: string
  passed: boolean
}

export default function ScoreBadge({ label, passed }: ScoreBadgeProps) {
  if (passed) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium bg-gold text-white">
        <span>✓</span>
        <span>{label}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-500">
      <span>×</span>
      <span>{label}</span>
    </span>
  )
}
