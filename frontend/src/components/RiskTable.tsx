/**
 * Risk Table Component
 * Displays contract risks in a table format with severity indicators
 */

export interface RiskItem {
  clause: string
  severity: number // 1-5
  contract_language?: string // Optional quoted contract language
  explanation: string
}

interface RiskTableProps {
  risks: RiskItem[]
  className?: string
}

const getSeverityColor = (severity: number): string => {
  if (severity >= 4) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
  if (severity === 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
  return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
}

const getSeverityLabel = (severity: number): string => {
  const labels = ['', 'Low', 'Low-Med', 'Medium', 'High', 'Critical']
  return labels[severity] || 'Unknown'
}

export function RiskTable({ risks, className = '' }: RiskTableProps) {
  if (!risks || risks.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        No risks identified.
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-600">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Clause
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">
              Severity
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Explanation
            </th>
          </tr>
        </thead>
        <tbody>
          {risks.map((risk, index) => (
            <tr
              key={index}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                {risk.clause}
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                    risk.severity
                  )}`}
                >
                  {risk.severity} - {getSeverityLabel(risk.severity)}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                {risk.contract_language && (
                  <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs italic border-l-2 border-gray-400">
                    "{risk.contract_language}"
                  </div>
                )}
                {risk.explanation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

