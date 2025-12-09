import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import SignIn from './pages/SignIn'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import SiteScribePage from './features/site-scribe/SiteScribePage'
import CodeCommanderPage from './features/code-commander/CodeCommanderPage'
import ContractHawkPage from './features/contract-hawk/ContractHawkPage'
import SubmittalScrubberPage from './features/submittal-scrubber/SubmittalScrubberPage'
import FileTestPage from './pages/FileTestPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/site-scribe"
            element={
              <ProtectedRoute>
                <SiteScribePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/code-commander"
            element={
              <ProtectedRoute>
                <CodeCommanderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/contract-hawk"
            element={
              <ProtectedRoute>
                <ContractHawkPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/submittal-scrubber"
            element={
              <ProtectedRoute>
                <SubmittalScrubberPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/file-processing"
            element={
              <ProtectedRoute>
                <FileTestPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

