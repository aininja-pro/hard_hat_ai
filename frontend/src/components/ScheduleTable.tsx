/**
 * Schedule Table Component - Premium Industrial Design
 * Displays 2-week construction schedule
 * Mobile-first with card view on small screens
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

const getTradeColor = (trade: string): string => {
  const tradeColors: Record<string, string> = {
    'Electrical': 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-400',
    'Plumbing': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    'HVAC': 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400',
    'Drywall': 'from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-400',
    'Framing': 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400',
    'Painting': 'from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-400',
    'Flooring': 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400',
    'Insulation': 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400',
  }

  // Check if trade contains any of the keywords
  for (const [key, value] of Object.entries(tradeColors)) {
    if (trade.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  // Default color
  return 'from-[#FF6B00]/20 to-orange-500/20 border-[#FF6B00]/30 text-[#FF6B00]'
}

const getTradeBadge = (trade: string): string => {
  const tradeColors: Record<string, string> = {
    'Electrical': 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black',
    'Plumbing': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    'HVAC': 'bg-gradient-to-r from-cyan-500 to-teal-500 text-black',
    'Drywall': 'bg-gradient-to-r from-gray-500 to-slate-500 text-white',
    'Framing': 'bg-gradient-to-r from-orange-500 to-amber-500 text-black',
    'Painting': 'bg-gradient-to-r from-purple-500 to-violet-500 text-white',
    'Flooring': 'bg-gradient-to-r from-emerald-500 to-green-500 text-black',
    'Insulation': 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
  }

  for (const [key, value] of Object.entries(tradeColors)) {
    if (trade.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  return 'bg-gradient-to-r from-[#FF6B00] to-orange-500 text-black'
}

export function ScheduleTable({ items, className = '' }: ScheduleTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className={`text-center py-12 text-[#666666] ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center">
          <svg className="w-8 h-8 text-[#444444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-[#999999]">No schedule items found</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Mobile Card View - visible below lg */}
      <div className="lg:hidden space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={`p-4 bg-gradient-to-r ${getTradeColor(item.trade)} rounded-xl border backdrop-blur-sm transition-all duration-200 active:scale-[0.98]`}
          >
            {/* Header with day/date and trade */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">Day {item.day}</span>
                  <span className="text-sm text-[#999999]">{item.date}</span>
                </div>
                <h4 className="text-white font-semibold text-sm mt-1">
                  {item.task}
                </h4>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTradeBadge(item.trade)} shadow-lg`}>
                {item.trade}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2 bg-black/20 rounded-lg text-center">
                <p className="text-xs text-[#999999] uppercase tracking-wide">Crew</p>
                <p className="text-lg font-bold text-white">{item.crew_size}</p>
              </div>
              <div className="p-2 bg-black/20 rounded-lg text-center">
                <p className="text-xs text-[#999999] uppercase tracking-wide">Hours</p>
                <p className="text-lg font-bold text-white">{item.duration_hours}</p>
              </div>
            </div>

            {/* Materials and Notes */}
            {item.materials && (
              <div className="mb-2">
                <p className="text-xs text-[#999999] uppercase tracking-wide mb-1">Materials</p>
                <p className="text-sm text-[#E5E5E5]">{item.materials}</p>
              </div>
            )}
            {item.notes && (
              <div>
                <p className="text-xs text-[#999999] uppercase tracking-wide mb-1">Notes</p>
                <p className="text-xs italic text-[#B3B3B3]">{item.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View - visible at lg and above */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#333333]">
              <th className="text-left py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider w-16">
                Day
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider w-24">
                Date
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider">
                Task
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider w-32">
                Trade
              </th>
              <th className="text-center py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider w-20">
                Crew
              </th>
              <th className="text-center py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider w-20">
                Hours
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold text-[#999999] uppercase tracking-wider">
                Materials/Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className="border-b border-[#333333]/50 hover:bg-[#1A1A1A] transition-colors"
              >
                <td className="py-4 px-4 text-sm text-white font-bold">
                  {item.day}
                </td>
                <td className="py-4 px-4 text-sm text-[#B3B3B3]">
                  {item.date}
                </td>
                <td className="py-4 px-4 text-sm text-white font-medium">
                  {item.task}
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getTradeBadge(item.trade)}`}>
                    {item.trade}
                  </span>
                </td>
                <td className="py-4 px-4 text-center text-sm text-[#B3B3B3]">
                  {item.crew_size}
                </td>
                <td className="py-4 px-4 text-center text-sm text-[#B3B3B3]">
                  {item.duration_hours}
                </td>
                <td className="py-4 px-4 text-sm text-[#999999]">
                  {item.materials && (
                    <div className="mb-1">
                      <span className="font-medium text-[#B3B3B3]">Materials:</span> {item.materials}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-xs italic">
                      {item.notes}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
