/**
 * Dashboard Page - Industrial Premium Design
 * Dark theme with safety orange accents
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LiabilityModal } from '../components/LiabilityModal'
import { AgentCard } from '../components/AgentCard'
import { getThemeConfig, applyThemeColors } from '../utils/themeConfig'
import {
  PenLine,
  CalendarDays,
  FileSearch,
  ShieldAlert,
  GitCompare,
  X,
} from 'lucide-react'

// Agent data with monoline icons (single color)
const AGENTS = [
  {
    id: 'site-scribe',
    title: 'Site Scribe',
    description: 'Transform voice or text notes into professional emails',
    icon: <PenLine className="w-full h-full" strokeWidth={1.5} />,
  },
  {
    id: 'lookahead-builder',
    title: 'Lookahead Builder',
    description: 'Generate 2-week schedules from photos or text',
    icon: <CalendarDays className="w-full h-full" strokeWidth={1.5} />,
  },
  {
    id: 'code-commander',
    title: 'Code & Spec Commander',
    description: 'Search technical docs with citations',
    icon: <FileSearch className="w-full h-full" strokeWidth={1.5} />,
  },
  {
    id: 'contract-hawk',
    title: 'Contract Hawk',
    description: 'Analyze contracts for risks and liability',
    icon: <ShieldAlert className="w-full h-full" strokeWidth={1.5} />,
  },
  {
    id: 'submittal-scrubber',
    title: 'Submittal Scrubber',
    description: 'Compare product specs for compliance',
    icon: <GitCompare className="w-full h-full" strokeWidth={1.5} />,
  },
]

function DashboardContent() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [liabilityAcknowledged, setLiabilityAcknowledged] = useState(false)

  useEffect(() => {
    const config = getThemeConfig()
    applyThemeColors(config)
    document.title = config.productName
  }, [])

  const handleAgentClick = (agentId: string) => {
    navigate(`/agent/${agentId}`)
  }

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Header - Dark Industrial */}
      <header className="bg-[#111111] border-b border-[#444444]">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {/* Hard Hat Icon */}
              <div className="text-[#FF6B00]">
                <svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="8" width="28" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <rect x="0" y="18" width="32" height="4" rx="1" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-sm tracking-wider">HARD HAT</div>
                <div className="text-[#666666] text-xs tracking-wider">AI PACK</div>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={signOut}
              className="p-2 text-[#666666] hover:text-white transition-colors"
              aria-label="Sign out"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {!liabilityAcknowledged && (
          <LiabilityModal onAcknowledge={() => setLiabilityAcknowledged(true)} />
        )}

        {/* Section Header - Premium */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#333333] to-transparent" />
            <h2 className="text-white font-bold text-sm tracking-[0.2em] uppercase">
              Your Tools
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#333333] to-transparent" />
          </div>
          <div className="flex justify-center mt-3">
            <div className="h-1 w-24 bg-gradient-to-r from-[#FF6B00] via-[#FF8533] to-[#FF6B00] rounded-full shadow-lg shadow-[#FF6B00]/50" />
          </div>
        </div>

        {/* Agent Cards */}
        <div className="space-y-3">
          {AGENTS.map((agent) => (
            <AgentCard
              key={agent.id}
              id={agent.id}
              title={agent.title}
              description={agent.description}
              icon={agent.icon}
              onClick={() => handleAgentClick(agent.id)}
            />
          ))}
        </div>

        {/* User email - subtle footer */}
        <div className="mt-8 text-center">
          <span className="text-[#666666] text-xs">
            {user?.email}
          </span>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return <DashboardContent />
}
