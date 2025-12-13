import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import SignupObserver from './pages/SignupObserver'
import SignupAdmin from './pages/SignupAdmin'
import Dashboard from './pages/Dashboard'
import LiveFeed from './pages/LiveFeed'
import Alerts from './pages/Alerts'
import Firewall from './pages/Firewall'
import Settings from './pages/Settings'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Navigate to="/signup/observer" replace />} />
          <Route path="/signup/observer" element={<SignupObserver />} />
          <Route path="/signup/admin" element={<SignupAdmin />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="live-feed" element={<LiveFeed />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="firewall" element={<Firewall />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App


