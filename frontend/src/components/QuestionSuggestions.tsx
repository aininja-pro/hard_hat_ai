/**
 * Question Suggestions Component
 * Shows suggested questions based on document type or common queries
 */

interface QuestionSuggestionsProps {
  onSelectQuestion: (question: string) => void
  documentType?: 'spec' | 'code' | 'contract' | 'general'
  className?: string
}

const SUGGESTED_QUESTIONS = {
  spec: [
    'What are the material specifications?',
    'What are the installation requirements?',
    'What are the testing and inspection requirements?',
    'What are the performance standards?',
    'What certifications are required?',
  ],
  code: [
    'What are the safety requirements?',
    'What are the building code requirements?',
    'What are the compliance standards?',
    'What are the inspection requirements?',
    'What are the permit requirements?',
  ],
  contract: [
    'What are the payment terms?',
    'What are the liability clauses?',
    'What are the completion deadlines?',
    'What are the change order procedures?',
    'What are the warranty terms?',
  ],
  general: [
    'What is this document about?',
    'What are the key requirements?',
    'What are the important deadlines?',
    'What are the safety considerations?',
    'What are the main sections?',
  ],
}

export function QuestionSuggestions({
  onSelectQuestion,
  documentType = 'general',
  className = '',
}: QuestionSuggestionsProps) {
  const suggestions = SUGGESTED_QUESTIONS[documentType] || SUGGESTED_QUESTIONS.general

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Suggested Questions:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelectQuestion(question)}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}

