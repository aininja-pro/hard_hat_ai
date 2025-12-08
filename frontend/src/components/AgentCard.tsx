/**
 * Agent Card Component
 * Displays an AI agent with icon, title, and description
 */

interface AgentCardProps {
  id: string
  title: string
  description: string
  icon: string
  onClick: () => void
}

export function AgentCard({ id, title, description, icon, onClick }: AgentCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={`Open ${title}`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0" aria-hidden="true">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </button>
  )
}

