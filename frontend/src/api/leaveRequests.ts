import client from './client'
import type { CreateLeaveRequestPayload, DecideLeaveRequestPayload, LeaveRequest } from '../types/leaveRequest'

export async function getLeaveRequests(status?: string): Promise<LeaveRequest[]> {
  const { data } = await client.get<LeaveRequest[]>('/api/leave-requests', {
    params: status ? { status } : undefined,
  })
  return data
}

export async function createLeaveRequest(
  payload: CreateLeaveRequestPayload,
): Promise<LeaveRequest> {
  const { data } = await client.post<LeaveRequest>('/api/leave-requests', payload)
  return data
}

export async function getLeaveRequest(id: number): Promise<LeaveRequest> {
  const { data } = await client.get<LeaveRequest>(`/api/leave-requests/${id}`)
  return data
}

export async function decideLeaveRequest(
  id: number,
  payload: DecideLeaveRequestPayload,
): Promise<LeaveRequest> {
  const { data } = await client.patch<LeaveRequest>(`/api/leave-requests/${id}/decide`, payload)
  return data
}
