import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import LeaveRequestCreatePage from './pages/LeaveRequestCreatePage'
import LeaveRequestDetailPage from './pages/LeaveRequestDetailPage'
import LeaveRequestListPage from './pages/LeaveRequestListPage'
import LoginPage from './pages/LoginPage'
import ManagerQueuePage from './pages/ManagerQueuePage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave-requests"
        element={
          <ProtectedRoute>
            <LeaveRequestListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave-requests/new"
        element={
          <ProtectedRoute>
            <LeaveRequestCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave-requests/:id"
        element={
          <ProtectedRoute>
            <LeaveRequestDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/queue"
        element={
          <ProtectedRoute>
            <ManagerQueuePage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
