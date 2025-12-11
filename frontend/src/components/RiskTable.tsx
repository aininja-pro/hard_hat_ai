/**
 * Risk Table Component - Premium Industrial Design
 * Displays contract risks with severity indicators
 * Mobile-first with card view on small screens
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
  if (severity >= 4) return 'from-red-500/20 to-red-600/20 border-red-500/40 text-red-400'
  if (severity === 3) return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40 text-yellow-400'
  return 'from-green-500/20 to-emerald-500/20 border-green-500/40 text-green-400'
}

const getSeverityBadge = (severity: number): string => {
  if (severity >= 4) return 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30'
  if (severity === 3) return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-yellow-500/30'
  return 'bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg shadow-green-500/30'
}

const getSeverityLabel = (severity: number): string => {
  const labels = ['', 'Low', 'Low-Med', 'Medium', 'High', 'Critical']
  return labels[severity] || 'Unknown'
}

export function RiskTable({ risks, className = '' }: RiskTableProps) {
  if (!risks || risks.length === 0) {
    return (
      <div className={`text-center py-12 text-[#666666] ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center">
          <svg className="w-8 h-8 text-[#444444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-[#999999]">No risks identified</p>
        <p className="text-sm text-[#666666] mt-1">This contract appears to be low risk</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Mobile Card View - visible below lg */}
      <div className="lg:hidden space-y-3">
        {risks.map((risk, index) => (
          <div
            key={index}
            className={`p-4 bg-gradient-to-r ${getSeverityColor(risk.severity)} rounded-xl border backdrop-blur-sm transition-all duration-200 active:scale-[0.98]`}
          >
            {/* Header with clause and severity */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide flex-1">
                {risk.clause}
              </h4>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityBadge(risk.severity)}`}>
                {risk.severity} - {getSeverityLabel(risk.severity)}
              </span>
            </div>

            {/* Contract language quote if available */}
            {risk.contract_language && (
              <div className="mb-3 p-3 bg-black/30 rounded-lg border-l-2 border-[#FF6B00]">
                <p className="text-xs italic text-[#B3B3B3] leading-relaxed">
                  "{risk.contract_language}"
                </p>
              </div>
            )}

            {/* Explanation */}
            <p className="text-sm text-[#E5E5E5] leading-relaxed">
              {risk.explanation}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop Table View - visible at lg and above */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#333333]">
              <th className="text-left py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider">
                Clause
              </th>
              <th className="text-center py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider w-32">
                Severity
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider">
                Explanation
              </th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk, index) => (
              <tr
                key={index}
                className="border-b border-[#333333]/50 hover:bg-[#1A1A1A] transition-colors"
              >
                <td className="py-4 px-4 text-sm text-white font-medium">
                  {risk.clause}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getSeverityBadge(risk.severity)}`}>
                    {risk.severity} - {getSeverityLabel(risk.severity)}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-[#B3B3B3]">
                  {risk.contract_language && (
                    <div className="mb-2 p-2 bg-[#1A1A1A] rounded border-l-2 border-[#FF6B00]">
                      <p className="text-xs italic text-[#999999]">
                        "{risk.contract_language}"
                      </p>
                    </div>
                  )}
                  {risk.explanation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
