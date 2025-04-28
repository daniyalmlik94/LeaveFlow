export type LeaveRequestType = 'vacation' | 'sick' | 'personal'
export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected'

export interface LeaveRequestUser {
  id: number
  name: string
  email: string
  role: string
}

export interface LeaveRequest {
  id: number
  user_id: number
  user?: LeaveRequestUser
  decider?: LeaveRequestUser | null
  type: LeaveRequestType
  start_date: string
  end_date: string
  reason: string
  status: LeaveRequestStatus
  decided_by: number | null
  decision_note: string | null
  decided_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateLeaveRequestPayload {
  type: LeaveRequestType
  start_date: string
  end_date: string
  reason: string
}

export interface DecideLeaveRequestPayload {
  decision: 'approved' | 'rejected'
  note?: string
}
