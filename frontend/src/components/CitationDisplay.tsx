/**
 * Citation Display Component
 * Shows page and section citations for Code & Spec Commander
 */

export interface Citation {
  page: number
  section?: string
  text?: string
}

interface CitationDisplayProps {
  citations: Citation[]
  className?: string
}

export function CitationDisplay({ citations, className = '' }: CitationDisplayProps) {
  if (!citations || citations.length === 0) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Citations ({citations.length})
      </h3>
      <div className="space-y-2">
        {citations.map((citation, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Page {citation.page}
              </span>
              {citation.section && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  • {citation.section}
                </span>
              )}
            </div>
            {citation.text && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Relevant excerpt:
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded border-l-2 border-blue-500 italic">
                  "{citation.text}"
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

