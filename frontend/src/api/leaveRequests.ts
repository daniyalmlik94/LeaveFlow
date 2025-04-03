import client from './client'
import type { CreateLeaveRequestPayload, LeaveRequest } from '../types/leaveRequest'

export async function getLeaveRequests(): Promise<LeaveRequest[]> {
  const { data } = await client.get<LeaveRequest[]>('/api/leave-requests')
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
