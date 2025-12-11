/**
 * Streaming Response Component - Premium Industrial Design
 * Displays streaming text with skeleton loader and typing cursor
 */

interface StreamingResponseProps {
  text: string
  isLoading: boolean
  className?: string
}

export function StreamingResponse({
  text,
  isLoading,
  className = '',
}: StreamingResponseProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Skeleton loader when waiting */}
      {isLoading && !text && (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gradient-to-r from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded w-3/4" />
          <div className="h-4 bg-gradient-to-r from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded w-full" />
          <div className="h-4 bg-gradient-to-r from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded w-5/6" />
          <div className="h-4 bg-gradient-to-r from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded w-2/3" />
        </div>
      )}

      {/* Response container */}
      <div
        className={`relative ${text ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      >
        {text ? (
          <div className="relative">
            {/* Premium content box */}
            <pre className="whitespace-pre-wrap font-sans text-[#E5E5E5] text-sm leading-relaxed bg-[#1A1A1A] p-5 rounded-xl border border-[#333333] shadow-lg shadow-black/20">
              {text}
              {/* Typing cursor */}
              {isLoading && (
                <span className="inline-block w-2 h-5 ml-1 bg-gradient-to-t from-[#FF6B00] to-[#FF8533] animate-pulse rounded-sm" />
              )}
            </pre>

            {/* Subtle glow at bottom when loading */}
            {isLoading && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6B00]/30 to-transparent animate-pulse" />
            )}
          </div>
        ) : (
          <p className="text-[#666666] italic">Waiting for response...</p>
        )}
      </div>
    </div>
  )
}
