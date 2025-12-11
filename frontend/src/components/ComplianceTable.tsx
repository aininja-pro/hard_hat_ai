/**
 * Compliance Table Component - Premium Industrial Design
 * Displays submittal compliance check results with pass/warn/fail indicators
 * Mobile-first with card view on small screens
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

const getStatusStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pass':
      return {
        card: 'from-green-500/10 to-emerald-500/10 border-green-500/30',
        badge: 'bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg shadow-green-500/30',
        icon: '✓',
        text: 'text-green-400'
      }
    case 'warn':
      return {
        card: 'from-yellow-500/10 to-orange-500/10 border-yellow-500/30',
        badge: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-yellow-500/30',
        icon: '⚠',
        text: 'text-yellow-400'
      }
    case 'fail':
      return {
        card: 'from-red-500/10 to-rose-500/10 border-red-500/30',
        badge: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30',
        icon: '✗',
        text: 'text-red-400'
      }
    default:
      return {
        card: 'from-[#333333]/10 to-[#444444]/10 border-[#333333]',
        badge: 'bg-[#333333] text-white',
        icon: '?',
        text: 'text-[#999999]'
      }
  }
}

export function ComplianceTable({ items, className = '' }: ComplianceTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className={`text-center py-12 text-[#666666] ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center">
          <svg className="w-8 h-8 text-[#444444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-lg font-medium text-[#999999]">No compliance items found</p>
      </div>
    )
  }

  const passCount = items.filter((item) => item.status.toLowerCase() === 'pass').length
  const warnCount = items.filter((item) => item.status.toLowerCase() === 'warn').length
  const failCount = items.filter((item) => item.status.toLowerCase() === 'fail').length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
          <span className="text-green-400 font-bold text-lg">{passCount}</span>
          <span className="text-green-400/80 text-sm font-medium">Pass</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
          <span className="text-yellow-400 font-bold text-lg">{warnCount}</span>
          <span className="text-yellow-400/80 text-sm font-medium">Warn</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-lg">
          <span className="text-red-400 font-bold text-lg">{failCount}</span>
          <span className="text-red-400/80 text-sm font-medium">Fail</span>
        </div>
      </div>

      {/* Mobile Card View - visible below lg */}
      <div className="lg:hidden space-y-3">
        {items.map((item, index) => {
          const styles = getStatusStyles(item.status)
          return (
            <div
              key={index}
              className={`p-4 bg-gradient-to-r ${styles.card} rounded-xl border backdrop-blur-sm transition-all duration-200 active:scale-[0.98]`}
            >
              {/* Header with requirement and status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className="text-white font-semibold text-sm flex-1">
                  {item.requirement}
                </h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles.badge}`}>
                  {styles.icon} {item.status.toUpperCase()}
                </span>
              </div>

              {/* Spec and Product Text */}
              <div className="space-y-2 mb-3">
                <div className="p-2 bg-black/20 rounded-lg">
                  <p className="text-xs text-[#999999] uppercase tracking-wide mb-1">Spec</p>
                  <p className="text-xs text-[#B3B3B3] italic line-clamp-3">
                    {item.spec_text}
                  </p>
                </div>
                <div className="p-2 bg-black/20 rounded-lg">
                  <p className="text-xs text-[#999999] uppercase tracking-wide mb-1">Product</p>
                  <p className="text-xs text-[#B3B3B3] italic line-clamp-3">
                    {item.product_text}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {item.notes && (
                <p className="text-sm text-[#E5E5E5]">
                  <span className="text-[#999999]">Notes:</span> {item.notes}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop Table View - visible at lg and above */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#333333]">
              <th className="text-left py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider w-24">
                Status
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider">
                Requirement
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider">
                Spec Text
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider">
                Product Text
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const styles = getStatusStyles(item.status)
              return (
                <tr
                  key={index}
                  className="border-b border-[#333333]/50 hover:bg-[#1A1A1A] transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${styles.badge}`}>
                      {styles.icon} {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-white font-medium">
                    {item.requirement}
                  </td>
                  <td className="py-4 px-4 text-sm text-[#B3B3B3]">
                    <p className="text-xs italic line-clamp-3 max-w-xs">
                      {item.spec_text}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#B3B3B3]">
                    <p className="text-xs italic line-clamp-3 max-w-xs">
                      {item.product_text}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#999999]">
                    {item.notes || '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
