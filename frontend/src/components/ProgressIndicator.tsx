/**
 * Progress Indicator Component
 * Shows a prominent loading spinner with optional status message
 */

interface ProgressIndicatorProps {
  isLoading: boolean
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProgressIndicator({
  isLoading,
  message,
  size = 'md',
  className = '',
}: ProgressIndicatorProps) {
  if (!isLoading) return null

  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {message && (
        <span className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {message}
        </span>
      )}
    </div>
  )
}

