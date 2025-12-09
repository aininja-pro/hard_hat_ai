/**
 * Schedule Table Component
 * Displays 2-week construction schedule
 */

export interface ScheduleItem {
  day: number
  date: string
  task: string
  trade: string
  crew_size: number
  duration_hours: number
  materials: string
  notes: string
}

interface ScheduleTableProps {
  items: ScheduleItem[]
  className?: string
}

export function ScheduleTable({ items, className = '' }: ScheduleTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        No schedule items found.
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-600">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-16">
              Day
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-24">
              Date
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Task
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">
              Trade
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-20">
              Crew
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-20">
              Hours
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Materials/Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={index}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                {item.day}
              </td>
              <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                {item.date}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                {item.task}
              </td>
              <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                {item.trade}
              </td>
              <td className="py-3 px-4 text-center text-sm text-gray-700 dark:text-gray-300">
                {item.crew_size}
              </td>
              <td className="py-3 px-4 text-center text-sm text-gray-700 dark:text-gray-300">
                {item.duration_hours}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  {item.materials && (
                    <div className="mb-1">
                      <span className="font-medium">Materials:</span> {item.materials}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-xs italic text-gray-500 dark:text-gray-500">
                      {item.notes}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

