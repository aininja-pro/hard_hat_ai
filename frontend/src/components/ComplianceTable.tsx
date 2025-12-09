/**
 * Compliance Table Component
 * Displays submittal compliance check results with pass/warn/fail indicators
 */

export interface ComplianceItem {
  requirement: string
  spec_text: string
  product_text: string
  status: 'pass' | 'warn' | 'fail'
  notes?: string
}

interface ComplianceTableProps {
  items: ComplianceItem[]
  className?: string
}

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pass':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    case 'warn':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    case 'fail':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const getStatusIcon = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pass':
      return '✓'
    case 'warn':
      return '⚠'
    case 'fail':
      return '✗'
    default:
      return '?'
  }
}

export function ComplianceTable({ items, className = '' }: ComplianceTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        No compliance items found.
      </div>
    )
  }

  const passCount = items.filter((item) => item.status.toLowerCase() === 'pass').length
  const warnCount = items.filter((item) => item.status.toLowerCase() === 'warn').length
  const failCount = items.filter((item) => item.status.toLowerCase() === 'fail').length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Stats */}
      <div className="flex gap-4 text-sm">
        <div className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded">
          Pass: {passCount}
        </div>
        <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded">
          Warn: {warnCount}
        </div>
        <div className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded">
          Fail: {failCount}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-24">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Requirement
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Spec Text
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Product Text
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {getStatusIcon(item.status)} {item.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                  {item.requirement}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="max-w-xs">
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-3">
                      {item.spec_text}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="max-w-xs">
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-3">
                      {item.product_text}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {item.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

