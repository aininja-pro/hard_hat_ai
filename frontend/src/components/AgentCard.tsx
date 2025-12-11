/**
 * Agent Card Component - Premium Industrial Design
 * Dark card with elevation, glow effects, and smooth animations
 */

import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

interface AgentCardProps {
  id: string
  title: string
  description: string
  icon: ReactNode
  onClick: () => void
}

export function AgentCard({ title, description, icon, onClick }: AgentCardProps) {
  return (
    <button
      onClick={onClick}
      className="
        group relative w-full p-5
        bg-gradient-to-br from-[#1A1A1A] to-[#151515]
        border border-[#333333]/50
        rounded-xl
        shadow-lg shadow-black/20
        hover:shadow-2xl hover:shadow-[#FF6B00]/20
        hover:border-[#FF6B00]/60
        hover:-translate-y-1
        active:translate-y-0
        active:shadow-lg
        transition-all duration-300 ease-out
        text-left
        focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2 focus:ring-offset-[#0D0D0D]
        min-h-[100px]
        touch-manipulation
        overflow-hidden
      "
      aria-label={`Open ${title}`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00] blur-3xl opacity-10" />
      </div>

      {/* Content with relative positioning */}
      <div className="relative flex items-start gap-4">
        {/* Icon with gradient background */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-[#FF6B00]/10 blur-md rounded-lg scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative p-3 bg-[#FF6B00]/10 rounded-lg border border-[#FF6B00]/20 group-hover:border-[#FF6B00]/40 transition-colors duration-300">
            <div className="w-6 h-6 text-[#FF6B00]">
              {icon}
            </div>
          </div>
        </div>

        {/* Text with better hierarchy */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base tracking-wide uppercase mb-1.5 group-hover:text-gradient-white transition-colors duration-300">
            {title}
          </h3>
          <p className="text-[#999999] text-sm leading-relaxed group-hover:text-[#B3B3B3] transition-colors duration-300">
            {description}
          </p>
        </div>

        {/* Animated chevron */}
        <div className="self-center flex-shrink-0">
          <ChevronRight className="w-5 h-5 text-[#666666] group-hover:text-[#FF6B00] group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
    </button>
  )
}
