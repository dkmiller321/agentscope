import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import RunsPage from './pages/RunsPage'
import RunDetailPage from './pages/RunDetailPage'

function App() {
  const { token } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={token ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/runs" element={token ? <RunsPage /> : <Navigate to="/login" />} />
        <Route path="/runs/:id" element={token ? <RunDetailPage /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
