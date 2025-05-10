import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getLeaveRequests } from '../api/leaveRequests'
import StatusBadge from '../components/StatusBadge'

export default function ManagerQueuePage() {
  const [showAll, setShowAll] = useState(false)
  const status = showAll ? undefined : 'pending'

  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ['leave-requests', { status }],
    queryFn: () => getLeaveRequests(status),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            {showAll ? 'All Requests' : 'Pending Requests'}
          </h1>
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-sm text-gray-500 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded"
          >
            {showAll ? 'Show pending only' : 'Show all'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block">
          ← Back to Dashboard
        </Link>

        {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
        {isError && <p className="text-sm text-red-600">Failed to load requests. Please try again.</p>}

        {requests && requests.length === 0 && (
          <p className="text-sm text-gray-500">
            {showAll ? 'No leave requests.' : 'No pending requests.'}
          </p>
        )}

        {requests && requests.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Requester</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Start</th>
                  <th className="pb-2 pr-4 font-medium">End</th>
                  <th className="pb-2 pr-4 font-medium">Submitted</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4">{req.user?.name ?? '—'}</td>
                    <td className="py-3 pr-4 capitalize">{req.type}</td>
                    <td className="py-3 pr-4">{req.start_date}</td>
                    <td className="py-3 pr-4">{req.end_date}</td>
                    <td className="py-3 pr-4 text-gray-500">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3">
                      <Link
                        to={`/leave-requests/${req.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
