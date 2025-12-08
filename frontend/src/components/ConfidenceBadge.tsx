/**
 * Confidence Badge Component
 * Displays High/Med/Low confidence indicators
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
    High: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Med: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  const icons = {
    High: '✓',
    Med: '~',
    Low: '!',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${styles[confidence]} ${className}`}
      aria-label={`Confidence: ${confidence}`}
    >
      <span>{icons[confidence]}</span>
      <span>Confidence: {confidence}</span>
    </span>
  )
}

