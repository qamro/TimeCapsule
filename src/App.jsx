import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CapsuleProvider } from './context/CapsuleContext'
import LandingPage     from './pages/LandingPage'
import LoginPage       from './pages/LoginPage'
import DashboardPage   from './pages/DashboardPage'
import CreatePage      from './pages/CreatePage'
import CapsuleViewPage from './pages/CapsuleViewPage'

function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user)   return <Navigate to="/login" replace />
  return (
    <CapsuleProvider>
      {children}
    </CapsuleProvider>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#0C0A0F',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 18, color: '#C9A96E',
          letterSpacing: '0.1em',
        }}>
          ⧗
        </span>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/"        element={<LandingPage />} />
      <Route path="/login"   element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
      <Route path="/create"    element={<AuthGuard><CreatePage /></AuthGuard>} />
      <Route path="/capsule/:id" element={<AuthGuard><CapsuleViewPage /></AuthGuard>} />
      <Route path="*"        element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
