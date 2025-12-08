/**
 * Streaming Response Component
 * Displays streaming text with skeleton loader
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
      {isLoading && !text && (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      )}
      <div
        className={`prose prose-sm max-w-none dark:prose-invert ${
          text ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-200`}
      >
        {text ? (
          <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            {text}
          </pre>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Waiting for response...</p>
        )}
      </div>
      {isLoading && text && (
        <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse" />
      )}
    </div>
  )
}

