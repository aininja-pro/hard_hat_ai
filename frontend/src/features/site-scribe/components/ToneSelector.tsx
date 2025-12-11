/**
 * Tone Selector Component
 * Allows user to choose between Neutral, Firm, or CYA tone
 */

type Tone = 'neutral' | 'firm' | 'cya'

interface ToneSelectorProps {
  selectedTone: Tone
  onToneChange: (tone: Tone) => void
  className?: string
}

const toneOptions: { value: Tone; label: string; description: string }[] = [
  {
    value: 'neutral',
    label: 'Neutral',
    description: 'Professional and balanced',
  },
  {
    value: 'firm',
    label: 'Firm',
    description: 'Direct and assertive',
  },
  {
    value: 'cya',
    label: 'CYA',
    description: 'Cover Your Ass - detailed documentation',
  },
]

export function ToneSelector({
  selectedTone,
  onToneChange,
  className = '',
}: ToneSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-[#999999] uppercase tracking-wider">
        Tone
      </label>
      <div className="flex gap-2 flex-wrap">
        {toneOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onToneChange(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] ${
              selectedTone === option.value
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-black shadow-lg shadow-[#FF6B00]/25'
                : 'bg-[#2A2A2A] border border-[#444444] text-[#B3B3B3] hover:bg-[#333333] hover:border-[#666666] hover:text-white'
            }`}
            aria-label={`Select ${option.label} tone: ${option.description}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-[#666666]">
        {toneOptions.find((o) => o.value === selectedTone)?.description}
      </p>
    </div>
  )
}

