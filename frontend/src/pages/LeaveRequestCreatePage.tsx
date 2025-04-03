import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createLeaveRequest } from '../api/leaveRequests'
import type { LeaveRequestType } from '../types/leaveRequest'

export default function LeaveRequestCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [type, setType] = useState<LeaveRequestType>('vacation')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const mutation = useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
      await navigate('/leave-requests')
    },
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    mutation.mutate({ type, start_date: startDate, end_date: endDate, reason })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-800">New Leave Request</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as LeaveRequestType)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vacation">Vacation</option>
              <option value="sick">Sick</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="start_date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              id="end_date"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              id="reason"
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600">Failed to submit request. Please check your input and try again.</p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Submitting…' : 'Submit Request'}
            </button>
            <Link to="/leave-requests" className="text-sm text-gray-500 hover:text-gray-800">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
