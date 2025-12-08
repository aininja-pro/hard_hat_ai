# Frontend Guideline Document

This document lays out how our frontend is built, styled, and organized. It’s written in everyday language so anyone—technical or not—can understand how things fit together.

## 1. Frontend Architecture

### Overview
- Framework: React (with functional components and hooks).
- Styling: Tailwind CSS (utility-first CSS).
- PWA Support: Built as a Progressive Web App using a service worker (via Workbox) for caching and offline handling.
- Modular Agents: Each AI agent (Site Scribe, Lookahead Builder, etc.) lives in its own folder and is loaded on demand (lazy loading).

### Scalability, Maintainability, Performance
- **Scalability**: We can add new agents or features by dropping in another module folder. React’s code splitting ensures only what you need loads.
- **Maintainability**: Clear folder structure, small reusable components, and consistent styling rules mean new developers can jump in quickly.
- **Performance**: Tailwind's purge process removes unused CSS. React.lazy and dynamic imports shrink initial bundle. Service worker caches static assets.

## 2. Design Principles

### Key Principles
1. **Usability**: Large touch targets (44 px+), clear labels, simple flows.
2. **Accessibility**: Semantic HTML tags, alt text on images, visible focus states, sufficient color contrast.
3. **Responsiveness**: Mobile-first layouts that adapt to desktop (grid on wide screens, stacked cards on narrow).
4. **Consistency**: One look and feel across all screens, thanks to shared styles and theming.

### Applying These Principles
- **Touch Targets**: Buttons and interactive cards are padded to at least 44 px.
- **Keyboard & Voice**: All inputs work with keyboard focus; voice input via Web Speech API is integrated for Field Mode.
- **Card-Based UI**: Each agent is a card. On desktop you get a grid, on mobile they stack.

## 3. Styling and Theming

### Styling Approach
- Utility-first CSS with **Tailwind**.
- No custom large CSS files—styles live alongside components as Tailwind classes.
- Dark mode support toggled based on Field vs Office Mode.

### Theming
- Primary and accent colors are injected via environment variables for white-labeling.
- Default theme colors (can be overridden at build time):
  • Primary: #1F2937 (slate-800)
  • Accent:  #3B82F6 (blue-500)
  • Secondary: #FBBF24 (yellow-400)
  • Info:    #10B981 (emerald-500)
  • Danger:  #EF4444 (red-500)
  • Background (light): #F9FAFB
  • Background (dark):  #111827

### Visual Style
- Modern flat design with subtle shadows on cards (glassmorphism touches optional).
- Light and dark modes reflecting Field vs Office.

### Typography
- Font family: **Inter** (Google Fonts) for clarity and readability.

## 4. Component Structure

### Organization
- **/components**: Shared UI elements (Button, Modal, Card, Spinner).
- **/layouts**: Layout wrappers (MainLayout, AuthLayout).
- **/features**: Each AI agent under its own folder, e.g., `/features/site-scribe`, containing components, hooks, and styles for that agent.
- **/hooks**: Custom React hooks (useAuth, useVoiceInput, useExport).
- **/contexts**: React Context providers (ThemeContext, AuthContext, ModeContext).

### Reusability
- Build small, single-purpose components.
- Use composition over inheritance. For example, a generic `Card` component accepts a title, icon, and children.
- Shared input components handle focus styles, error states, and accessibility.

## 5. State Management

### Approach
- **React Context API** for global state:
  - Authentication status and user info.
  - Field vs Office Mode toggle.
  - Theme overrides (white-label colors).
- **Local Component State** with `useState` or `useReducer` for form fields, file uploads, and agent-specific dialogs.

### Data Fetching & Caching
- Use `fetch` or a lightweight wrapper to call our FastAPI endpoints.
- No heavy state libraries (Redux) needed for MVP; we keep it simple.

## 6. Routing and Navigation

### Library
- **React Router v6** (`react-router-dom`).
- BrowserRouter in `index.js`, with `<Routes>` and `<Route>` for each screen.

### Route Structure
1. `/signin` → Sign-in page (magic link flow).
2. `/liability` → Liability popup/consent screen.
3. `/dashboard` → Agent cards view.
4. `/agent/:agentId` → Agent workspace (dynamic parameter).
5. `*` → 404 or redirect to `/signin` if not authenticated.

### Navigation Flow
- After sign-in, redirect to liability screen.
- Then auto-redirect to dashboard.
- Agent cards link to their workspace; workspace has Back button.

## 7. Performance Optimization

- **Code Splitting**: `React.lazy()` + `Suspense` for each agent workspace.
- **Tailwind Purge**: Strips out unused CSS in production.
- **Lazy Loading**: Images and video iframes only load when visible.
- **PWA Caching**: Service worker caches static assets and fallback pages.
- **Asset Optimization**: SVG icons, compressed images.

## 8. Testing and Quality Assurance

### Unit & Integration
- **Jest** for unit tests of components and hooks.
- **React Testing Library** for testing component rendering and user interactions.
- **MSW (Mock Service Worker)** to mock API responses during tests.

### End-to-End
- **Cypress** for E2E tests, covering sign-in flow, dashboard navigation, and agent interactions (uploading a file, exporting results).

### Accessibility
- **axe-core** integration with tests to catch contrast and semantic issues.

### CI/CD
- Tests run on every pull request in GitHub Actions. Builds fail if lint, types, or tests fail.

## 9. Conclusion and Overall Frontend Summary

Our frontend is a React-based, mobile-first PWA structured around reusable components and a clear folder layout. We use Tailwind CSS for fast, consistent styling and React Context for simple state management. React Router handles navigation, while code splitting and a service worker keep performance snappy.

Accessibility, responsiveness, and white-label theming are baked in from day one. Testing at unit, integration, and E2E levels ensures reliability. This setup supports our goal: a fast, scalable, and maintainable AI suite that field workers and office teams can use with ease.

With these guidelines, anyone joining the project will know how things are wired, styled, and tested—so we can build and ship features confidently.