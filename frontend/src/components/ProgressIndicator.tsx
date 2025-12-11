/**
 * Progress Indicator Component - Premium Industrial Design
 * Shows a gradient loading spinner with optional status message
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
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const spinnerBorderSize = {
    sm: 'border-2',
    md: 'border-[3px]',
    lg: 'border-4',
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Premium gradient spinner */}
      <div className="relative">
        {/* Glow effect */}
        <div
          className={`absolute inset-0 ${sizeClasses[size]} bg-[#FF6B00] rounded-full blur-md opacity-30 animate-pulse`}
        />
        {/* Spinner track */}
        <div
          className={`${sizeClasses[size]} ${spinnerBorderSize[size]} border-[#333333] rounded-full`}
        />
        {/* Animated spinner */}
        <div
          className={`absolute inset-0 ${sizeClasses[size]} ${spinnerBorderSize[size]} border-transparent border-t-[#FF6B00] border-r-[#FF8533] rounded-full animate-spin`}
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>

      {/* Message with typing animation */}
      {message && (
        <span className="text-sm text-[#B3B3B3] animate-pulse font-medium">
          {message}
          <span className="inline-flex ml-1">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
          </span>
        </span>
      )}
    </div>
  )
}
