# Coding Conventions

**Analysis Date:** 2026-01-11

## Naming Patterns

**Files:**
- PascalCase.tsx - React components (`FileUpload.tsx`, `ContractHawkPage.tsx`)
- camelCase.ts - Utilities and hooks (`apiConfig.ts`, `useClaudeStream.ts`)
- snake_case.py - Python modules (`claude_client.py`, `contract_hawk.py`)
- kebab-case - Feature directories (`contract-hawk/`, `site-scribe/`)
- *.test.ts alongside source (when implemented)

**Functions:**
- camelCase for all JavaScript/TypeScript functions
- handle{EventName} for event handlers (`handleFileSelect`, `handleAnalyze`)
- snake_case for Python functions (`build_risk_analysis_prompt`, `validate_pdf`)
- No special prefix for async functions

**Variables:**
- camelCase for JavaScript/TypeScript (`isLoading`, `selectedFile`)
- snake_case for Python (`temp_file_path`, `document_text`)
- is{State} or has{State} for booleans (`isAuthenticated`, `hasError`)
- UPPER_SNAKE_CASE for constants (`MAX_PDF_SIZE`, `ALLOWED_PDF_TYPES`)

**Types:**
- PascalCase for interfaces, no I prefix (`FileUploadProps`, `RiskItem`)
- PascalCase for type aliases (`ValidationResult`, `Citation`)
- PascalCase for Pydantic models (`SiteScribeRequest`, `ContractHawkResponse`)

## Code Style

**Formatting (Frontend):**
- Prettier with `.prettierrc`
- `semi: false` - No semicolons
- `singleQuote: true` - Single quotes for strings
- `tabWidth: 2` - 2-space indentation
- `trailingComma: "es5"` - ES5 trailing commas
- `printWidth: 100` - Line length limit

**Formatting (Backend):**
- No formatter configured (recommend: black)
- 4-space indentation (PEP 8 default)
- Double quotes for strings (Python convention)

**Linting (Frontend):**
- ESLint with `.eslintrc.cjs`
- Extends: `eslint:recommended`, `@typescript-eslint/recommended`, `react-hooks/recommended`
- `@typescript-eslint/no-unused-vars` with `argsIgnorePattern: '^_'`
- Zero warnings policy: `npm run lint` enforces max warnings 0
- Run: `npm run lint`

**Linting (Backend):**
- No linter configured (recommend: flake8 or ruff)

## Import Organization

**Order (Frontend):**
1. External packages (react, @supabase/supabase-js)
2. Internal absolute imports (@/lib, @/components)
3. Relative imports (./utils, ../types)
4. Type imports (import type { ... })

**Grouping:**
- Blank line between groups
- Named imports alphabetized when multiple
- Type imports last within file or grouped at top

**Path Aliases:**
- `@/*` maps to `./src/*` - configured in `tsconfig.json`

**Backend (Python):**
1. Standard library imports (os, json, logging)
2. Third-party imports (fastapi, pydantic, anthropic)
3. Local imports (from app.services import ...)

## Error Handling

**Patterns (Frontend):**
- try/catch in streaming hooks
- Error state in hook return: `{ error: string | null }`
- UI displays error messages with retry option
- `onValidationError` callback for file validation

**Patterns (Backend):**
- HTTPException for client errors (400, 404, 422)
- Generic Exception handler at router level
- SSE error message format: `data: {"type": "error", "message": "..."}\n\n`
- Logging before raising exceptions

**Error Types:**
- Throw on invalid input, file validation failures
- Return Result objects for recoverable errors in services
- Include cause context: `f"Error processing contract: {str(e)}"`

## Logging

**Framework (Frontend):**
- `console.log` in development
- Conditional logging via `import.meta.env.DEV`

**Framework (Backend):**
- Python `logging` module
- Logger per module: `logger = logging.getLogger(__name__)`
- Levels: DEBUG, INFO, WARNING, ERROR

**Patterns:**
- Log at service boundaries (API calls, file operations)
- Log progress updates during streaming
- Include context: `logger.info(f"Processing {total_pages} pages, {len(text)} chars")`
- Avoid logging sensitive data (remove console.log from auth flow)

## Comments

**When to Comment:**
- Complex logic: JSON parsing strategies, brace-matching
- Business rules: Token limits, file size constraints
- Non-obvious workarounds: `// Reset file pointer`

**JSDoc/TSDoc (Frontend):**
- Required for exported functions and components
- File-level comment with purpose
```typescript
/**
 * File Upload Component
 * Handles file selection, validation, and upload with progress tracking
 */
```

**Docstrings (Backend):**
- Google-style docstrings with Args/Returns/Raises
- Module-level docstrings describing purpose
```python
"""
Claude AI Client Service
Handles all interactions with Anthropic's Claude API
"""

def build_risk_analysis_prompt(document_text: str, total_pages: int) -> str:
    """
    Build the prompt for Claude to analyze contract risks

    Args:
        document_text: Extracted text from PDF
        total_pages: Total number of pages in PDF

    Returns:
        Formatted prompt for Claude
    """
```

**TODO Comments:**
- Format: `// TODO: description` (no username, use git blame)
- Link to issue if exists: `// TODO: Fix race condition (issue #123)`

## Function Design

**Size:**
- Keep under 50 lines where possible
- Extract helpers for complex logic
- Long streaming generators acceptable if well-structured

**Parameters:**
- Max 3-4 parameters
- Use options object for more: `function create(options: CreateOptions)`
- Destructure in parameter list: `({ prop1, prop2 }: Props) =>`
- Default values for optional params: `label = 'Select File'`

**Return Values:**
- Explicit return statements
- Hook pattern: `{ data, isLoading, error, action, reset }`
- Return early for guard clauses

## Module Design

**Exports (Frontend):**
- Named exports preferred
- Export function directly: `export function FileUpload(...)`
- Export types alongside implementation
- No barrel files (index.ts) currently

**Exports (Backend):**
- Import specific items: `from app.services.claude_client import ClaudeClient`
- Router instances exported: `router = APIRouter(...)`

**Component Structure:**
```typescript
interface ComponentProps {
  prop1: string
  prop2?: number
  className?: string
}

export function ComponentName({ prop1, prop2, className = '' }: ComponentProps) {
  // Hooks first
  const [state, setState] = useState(...)

  // Callbacks
  const handleAction = useCallback(() => {...}, [deps])

  // Effects
  useEffect(() => {...}, [deps])

  // Render
  return (...)
}
```

---

*Convention analysis: 2026-01-11*
*Update when patterns change*
