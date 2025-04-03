import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getLeaveRequests } from '../api/leaveRequests'
import type { LeaveRequestStatus } from '../types/leaveRequest'

const STATUS_COLOR: Record<LeaveRequestStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

function StatusBadge({ status }: { status: LeaveRequestStatus }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function LeaveRequestListPage() {
  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: getLeaveRequests,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">My Leave Requests</h1>
          <Link
            to="/leave-requests/new"
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            New Request
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block">
          ← Back to Dashboard
        </Link>

        {isLoading && (
          <p className="text-sm text-gray-500">Loading…</p>
        )}

        {isError && (
          <p className="text-sm text-red-600">Failed to load requests. Please try again.</p>
        )}

        {requests && requests.length === 0 && (
          <p className="text-sm text-gray-500">No leave requests yet.</p>
        )}

        {requests && requests.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Start</th>
                  <th className="pb-2 pr-4 font-medium">End</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4 capitalize">{req.type}</td>
                    <td className="py-3 pr-4">{req.start_date}</td>
                    <td className="py-3 pr-4">{req.end_date}</td>
                    <td className="py-3">
                      <StatusBadge status={req.status} />
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
