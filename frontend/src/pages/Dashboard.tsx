/**
 * Dashboard Page
 * Main landing page with agent cards and mode toggle
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'
import { LiabilityModal } from '../components/LiabilityModal'
import { ModeToggle } from '../components/ModeToggle'
import { AgentCard } from '../components/AgentCard'
import { AppLogo } from '../components/AppLogo'
import { getThemeConfig, applyThemeColors } from '../utils/themeConfig'

// Agent data - will be moved to config later
const AGENTS = [
  {
    id: 'site-scribe',
    title: 'Site Scribe',
    description: 'Transform voice or text notes into professional emails',
    icon: '✍️',
  },
  {
    id: 'lookahead-builder',
    title: 'Lookahead Builder',
    description: 'Generate 2-week construction schedules from photos or text',
    icon: '📅',
  },
  {
    id: 'code-commander',
    title: 'Code & Spec Commander',
    description: 'Answer questions about technical documents with citations',
    icon: '📋',
  },
  {
    id: 'contract-hawk',
    title: 'Contract Hawk',
    description: 'Analyze contracts for risks and liability issues',
    icon: '🦅',
  },
  {
    id: 'submittal-scrubber',
    title: 'Submittal Scrubber',
    description: 'Compare product specs to requirements for compliance',
    icon: '🔍',
  },
]

function DashboardContent() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { mode } = useTheme()
  const [liabilityAcknowledged, setLiabilityAcknowledged] = useState(false)

  // Apply white-label theme colors on mount
  useEffect(() => {
    const config = getThemeConfig()
    applyThemeColors(config)
    // Update document title
    document.title = config.productName
  }, [])

  const handleAgentClick = (agentId: string) => {
    // Navigate to agent workspace
    if (agentId === 'site-scribe') {
      navigate('/agent/site-scribe')
    } else if (agentId === 'code-commander') {
      navigate('/agent/code-commander')
    } else {
      // Other agents coming soon
      alert(`${agentId} workspace coming soon!`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AppLogo />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!liabilityAcknowledged && (
          <LiabilityModal onAcknowledge={() => setLiabilityAcknowledged(true)} />
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Choose an AI Agent
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select an agent to help with your construction tasks
          </p>
        </div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  )
}

