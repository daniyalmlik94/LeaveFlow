import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_LABEL: Record<string, string> = {
  employee: 'Employee',
  manager: 'Manager',
}

const ROLE_COLOR: Record<string, string> = {
  employee: 'bg-blue-100 text-blue-800',
  manager: 'bg-purple-100 text-purple-800',
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout(): Promise<void> {
    await logout()
    await navigate('/login')
  }

  if (user === null) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">LeaveFlow</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-gray-600 mb-3">
          Welcome back, <strong>{user.name}</strong>.
        </p>
        <span
          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLOR[user.role] ?? 'bg-gray-100 text-gray-700'}`}
        >
          {ROLE_LABEL[user.role] ?? user.role}
        </span>
      </main>
    </div>
  )
}
