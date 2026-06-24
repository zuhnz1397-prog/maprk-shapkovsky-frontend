import { Routes, Route, Navigate } from 'react-router-dom'
import MapPage from './pages/MapPage'
import LoginPage from './pages/LoginPage'
import AdminLayout from './pages/AdminLayout'
import AdminRegistry from './pages/AdminRegistry'
import AdminAddRK from './pages/AdminAddRK'
import AdminEditRK from './pages/AdminEditRK'
import { useAuthStore } from './store/authStore'

function ProtectedRoute({ children }) {
  const token = useAuthStore(s => s.token)
  if (!token) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Публичная карта */}
      <Route path="/" element={<MapPage />} />

      {/* Авторизация */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Админка — защищённые роуты */}
      <Route path="/admin" element={
        <ProtectedRoute><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/registry" replace />} />
        <Route path="registry" element={<AdminRegistry />} />
        <Route path="registry/add" element={<AdminAddRK />} />
        <Route path="registry/:pk/edit" element={<AdminEditRK />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
