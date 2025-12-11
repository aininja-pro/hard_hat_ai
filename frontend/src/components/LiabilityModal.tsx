/**
 * Liability Disclaimer Modal - Industrial Design
 * Mandatory acknowledgment required before each session
 */

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface LiabilityModalProps {
  onAcknowledge: () => void
}

export function LiabilityModal({ onAcknowledge }: LiabilityModalProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Check if already acknowledged in this session
  useEffect(() => {
    const acknowledged = sessionStorage.getItem('liability-acknowledged')
    if (acknowledged === 'true') {
      setIsVisible(false)
      onAcknowledge()
    }
  }, [onAcknowledge])

  const handleAcknowledge = () => {
    sessionStorage.setItem('liability-acknowledged', 'true')
    setIsVisible(false)
    onAcknowledge()
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="max-w-lg w-full bg-[#1A1A1A] border border-[#333333] rounded-lg shadow-2xl p-6">
        {/* Warning Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-[#FFB800]">
            <AlertTriangle className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wide">
            Important
          </h2>
        </div>

        <div className="space-y-4 text-[#B3B3B3] mb-6">
          <p>
            <span className="text-white font-medium">This is an AI-powered tool.</span>{' '}
            All outputs must be verified by a qualified professional before use.
          </p>

          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#FF6B00] mt-0.5">•</span>
              <span>AI content requires human verification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF6B00] mt-0.5">•</span>
              <span>You are responsible for validating outputs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF6B00] mt-0.5">•</span>
              <span>Provided "as-is" without warranties</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FF6B00] mt-0.5">•</span>
              <span>Zero data retention after processing</span>
            </li>
          </ul>

          <p className="text-xs text-[#666666]">
            Required each session for your protection.
          </p>
        </div>

        <button
          onClick={handleAcknowledge}
          className="w-full py-3 px-4 bg-[#FF6B00] text-black font-semibold rounded-lg hover:bg-[#FF8533] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors uppercase tracking-wide text-sm"
        >
          I Understand
        </button>
      </div>
    </div>
  )
}
