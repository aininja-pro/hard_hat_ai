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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Tone
      </label>
      <div className="flex gap-2 flex-wrap">
        {toneOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onToneChange(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTone === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            aria-label={`Select ${option.label} tone: ${option.description}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {toneOptions.find((o) => o.value === selectedTone)?.description}
      </p>
    </div>
  )
}

