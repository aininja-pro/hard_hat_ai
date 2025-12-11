/**
 * Confidence Badge Component - Premium Industrial Design
 * Displays High/Med/Low confidence indicators with gradient styling
 */

interface ConfidenceBadgeProps {
  confidence: 'High' | 'Med' | 'Low' | null
  className?: string
}

export function ConfidenceBadge({ confidence, className = '' }: ConfidenceBadgeProps) {
  if (!confidence) {
    return null
  }

  const styles = {
    High: {
      badge: 'bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg shadow-green-500/30',
      icon: '✓',
      glow: 'bg-green-500/20'
    },
    Med: {
      badge: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-yellow-500/30',
      icon: '~',
      glow: 'bg-yellow-500/20'
    },
    Low: {
      badge: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30',
      icon: '!',
      glow: 'bg-red-500/20'
    },
  }

  const style = styles[confidence]

  return (
    <div className="relative">
      {/* Subtle glow behind badge */}
      <div className={`absolute inset-0 ${style.glow} blur-lg rounded-full scale-150`} />

      {/* Badge */}
      <span
        className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${style.badge} ${className}`}
        aria-label={`Confidence: ${confidence}`}
      >
        <span className="text-sm">{style.icon}</span>
        <span>{confidence}</span>
      </span>
    </div>
  )
}
