# Testing Patterns

**Analysis Date:** 2026-01-11

## Test Framework

**Runner:**
- Not configured (no test framework detected)
- Recommend: Vitest for frontend, pytest for backend

**Assertion Library:**
- Not applicable

**Run Commands:**
```bash
# Not currently available - tests not implemented
# Recommended:
npm test                              # Run frontend tests (Vitest)
npm test -- --watch                   # Watch mode
pytest                                # Run backend tests
pytest -v                             # Verbose output
```

## Test File Organization

**Location:**
- No test files currently exist
- No `*.test.ts`, `*.spec.ts` files found
- No `__tests__/` directories
- No `tests/` directory in backend

**Recommended Naming:**
- Frontend unit tests: `*.test.ts` alongside source files
- Frontend component tests: `*.test.tsx` alongside components
- Backend tests: `test_*.py` in `tests/` directory

**Recommended Structure:**
```
frontend/
├── src/
│   ├── utils/
│   │   ├── fileValidation.ts
│   │   └── fileValidation.test.ts     # Co-located tests
│   ├── hooks/
│   │   ├── useClaudeStream.ts
│   │   └── useClaudeStream.test.ts
│   └── components/
│       ├── FileUpload.tsx
│       └── FileUpload.test.tsx
└── vitest.config.ts

backend/
├── app/
│   ├── services/
│   │   └── pdf_processor.py
│   └── middleware/
│       └── file_validation.py
└── tests/
    ├── test_pdf_processor.py
    ├── test_file_validation.py
    └── conftest.py                     # Shared fixtures
```

## Test Structure

**Suite Organization (Recommended):**
```typescript
// Vitest pattern
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('ModuleName', () => {
  describe('functionName', () => {
    beforeEach(() => {
      // Reset state
    })

    it('should handle valid input', () => {
      // arrange
      const input = createTestInput()

      // act
      const result = functionName(input)

      // assert
      expect(result).toEqual(expectedOutput)
    })

    it('should throw on invalid input', () => {
      expect(() => functionName(null)).toThrow('Invalid input')
    })
  })
})
```

**Backend Pattern (Recommended):**
```python
# pytest pattern
import pytest
from app.services.pdf_processor import PDFProcessor

class TestPDFProcessor:
    def test_validate_pdf_valid_file(self, valid_pdf_fixture):
        result = PDFProcessor.validate_pdf(valid_pdf_fixture)
        assert result["valid"] is True

    def test_validate_pdf_oversized_file(self, large_pdf_fixture):
        result = PDFProcessor.validate_pdf(large_pdf_fixture)
        assert result["valid"] is False
        assert "size" in result["error"]
```

**Patterns:**
- Use beforeEach for per-test setup
- Use afterEach to restore mocks
- Explicit arrange/act/assert comments in complex tests
- One assertion focus per test

## Mocking

**Framework (Recommended):**
- Frontend: Vitest built-in mocking (`vi`)
- Backend: pytest with `unittest.mock` or `pytest-mock`

**Frontend Mocking Pattern:**
```typescript
import { vi } from 'vitest'
import { supabase } from './supabase'

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn()
    }
  }
}))

// In test
vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
  data: { user: null, session: null },
  error: null
})
```

**Backend Mocking Pattern:**
```python
from unittest.mock import patch, MagicMock

def test_claude_client_stream(mocker):
    mock_response = MagicMock()
    mock_response.text_stream = iter(["chunk1", "chunk2"])

    mocker.patch('anthropic.Anthropic.messages.create', return_value=mock_response)

    # Test streaming behavior
```

**What to Mock:**
- External APIs (Anthropic Claude API, Supabase)
- File system operations
- Network calls (fetch, httpx)
- Environment variables

**What NOT to Mock:**
- Pure utility functions
- Simple data transformations
- Internal business logic (test through public interface)

## Fixtures and Factories

**Test Data (Recommended):**
```typescript
// Factory pattern for frontend
function createTestFile(overrides?: Partial<File>): File {
  const blob = new Blob(['test content'], { type: 'application/pdf' })
  return new File([blob], 'test.pdf', { type: 'application/pdf', ...overrides })
}

// Usage
const file = createTestFile({ name: 'contract.pdf' })
```

```python
# Fixture pattern for backend
@pytest.fixture
def valid_pdf_path(tmp_path):
    pdf_path = tmp_path / "test.pdf"
    # Create minimal valid PDF
    return str(pdf_path)

@pytest.fixture
def mock_claude_client(mocker):
    return mocker.patch('app.services.claude_client.ClaudeClient')
```

**Location:**
- Frontend factories: in test file or `src/__tests__/factories/`
- Backend fixtures: `tests/conftest.py` for shared fixtures

## Coverage

**Requirements:**
- Not currently enforced
- Recommend: 80% for critical paths (validation, services)
- Focus on: PDF processing, file validation, auth flow, streaming hooks

**Configuration (Recommended):**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules', '*.config.*', '**/*.d.ts']
    }
  }
})
```

**View Coverage:**
```bash
npm run test:coverage              # Generate report
open coverage/index.html           # View HTML report
```

## Test Types

**Unit Tests:**
- Scope: Single function or class in isolation
- Mocking: Mock all external dependencies
- Speed: <100ms per test
- Priority files:
  - `frontend/src/utils/fileValidation.ts`
  - `backend/app/services/pdf_processor.py`
  - `backend/app/middleware/file_validation.py`

**Integration Tests:**
- Scope: Multiple modules working together
- Mocking: Mock only external boundaries (APIs, file system)
- Examples: Router + Service, Hook + API

**E2E Tests:**
- Framework: Not configured (recommend: Playwright or Cypress)
- Scope: Full user flows (login, upload, analyze)
- Would test: Auth flow, file upload, streaming responses

## Common Patterns

**Async Testing:**
```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction()
  expect(result).toBe('expected')
})
```

**Error Testing:**
```typescript
it('should throw on invalid input', () => {
  expect(() => validatePDF(null)).toThrow('Invalid file')
})

// Async error
it('should reject on failure', async () => {
  await expect(uploadFile(badFile)).rejects.toThrow('Upload failed')
})
```

**SSE Stream Testing:**
```typescript
it('should parse SSE chunks', () => {
  const chunks = [
    'data: {"type": "text", "chunk": "Hello"}\n\n',
    'data: {"type": "complete", "confidence": "High"}\n\n'
  ]

  const result = parseSSEChunks(chunks)

  expect(result.text).toBe('Hello')
  expect(result.confidence).toBe('High')
})
```

**File Validation Testing:**
```typescript
describe('validatePDF', () => {
  it('should accept valid PDF under size limit', async () => {
    const file = createTestFile({ size: 1024 * 1024 }) // 1MB
    const result = await validatePDF(file)
    expect(result.valid).toBe(true)
  })

  it('should reject oversized PDF', async () => {
    const file = createTestFile({ size: 30 * 1024 * 1024 }) // 30MB
    const result = await validatePDF(file)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('size')
  })
})
```

**Snapshot Testing:**
- Not recommended for this codebase (prefer explicit assertions)
- Could use for component rendering if needed

## Current Validation (Pre-Test)

**Client-Side Validation:**
- `frontend/src/utils/fileValidation.ts` - File type, size, name security
- Provides some protection but needs tests

**Server-Side Validation:**
- `backend/app/middleware/file_validation.py` - Upload validation
- Pydantic models provide runtime type checking

**Linting (Used as Pre-Commit Check):**
- ESLint: `npm run lint` (zero warnings)
- TypeScript: `npm run build` (type checking)
- No backend linting configured

---

*Testing analysis: 2026-01-11*
*Update when test patterns change*
