import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { decideLeaveRequest, getLeaveRequest } from '../api/leaveRequests'
import { useAuth } from '../context/AuthContext'
import type { LeaveRequestStatus } from '../types/leaveRequest'

const STATUS_COLOR: Record<LeaveRequestStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

function StatusBadge({ status }: { status: LeaveRequestStatus }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function LeaveRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [decision, setDecision] = useState<'approved' | 'rejected' | ''>('')
  const [note, setNote] = useState('')
  const [validationError, setValidationError] = useState('')

  const numericId = Number(id)

  const { data: req, isLoading, isError } = useQuery({
    queryKey: ['leave-request', numericId],
    queryFn: () => getLeaveRequest(numericId),
    enabled: !isNaN(numericId),
  })

  const mutation = useMutation({
    mutationFn: () => {
      if (!decision) throw new Error('select')
      return decideLeaveRequest(numericId, { decision, note: note || undefined })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['leave-request', numericId] })
      void navigate('/manager/queue')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError('')
    if (!decision) {
      setValidationError('Please select a decision.')
      return
    }
    mutation.mutate()
  }

  const isManager = user?.role === 'manager'
  const backLink = isManager ? '/manager/queue' : '/leave-requests'
  const backLabel = isManager ? '← Back to Queue' : '← Back to My Requests'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-800">Leave Request Detail</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <Link to={backLink} className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block">
          {backLabel}
        </Link>

        {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
        {isError && <p className="text-sm text-red-600">Failed to load request. Please try again.</p>}

        {req && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-800 capitalize">{req.type} leave</h2>
              <StatusBadge status={req.status} />
            </div>

            {req.user && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Requested by</p>
                <p className="text-sm text-gray-800">{req.user.name}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Start date</p>
                <p className="text-sm text-gray-800">{req.start_date}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">End date</p>
                <p className="text-sm text-gray-800">{req.end_date}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Reason</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{req.reason}</p>
            </div>

            {req.status !== 'pending' && (
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Decision</p>
                {req.decider && (
                  <p className="text-sm text-gray-600">
                    By <strong>{req.decider.name}</strong>
                    {req.decided_at && (
                      <> on {new Date(req.decided_at).toLocaleDateString()}</>
                    )}
                  </p>
                )}
                {req.decision_note && (
                  <p className="text-sm text-gray-800 italic">"{req.decision_note}"</p>
                )}
              </div>
            )}

            {isManager && req.status === 'pending' && (
              <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-4 space-y-4">
                <p className="text-sm font-medium text-gray-700">Decision</p>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      value="approved"
                      checked={decision === 'approved'}
                      onChange={() => setDecision('approved')}
                      className="accent-green-600"
                    />
                    Approve
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      value="rejected"
                      checked={decision === 'rejected'}
                      onChange={() => setDecision('rejected')}
                      className="accent-red-600"
                    />
                    Reject
                  </label>
                </div>

                <div>
                  <label htmlFor="note" className="block text-sm text-gray-600 mb-1">
                    Note <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    id="note"
                    rows={3}
                    maxLength={1000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a note for the employee…"
                  />
                </div>

                {validationError && (
                  <p className="text-sm text-red-600">{validationError}</p>
                )}

                {mutation.isError && (
                  <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
                )}

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {mutation.isPending ? 'Submitting…' : 'Submit decision'}
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
