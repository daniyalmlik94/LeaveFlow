<?php

namespace App\Policies;

use App\Models\LeaveRequest;
use App\Models\User;

class LeaveRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->id === $leaveRequest->user_id || $user->role === 'manager';
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function decide(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->role === 'manager'
            && $leaveRequest->status === 'pending'
            && $user->id !== $leaveRequest->user_id;
    }
}
