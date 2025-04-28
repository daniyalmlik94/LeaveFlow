<?php

namespace App\Http\Controllers;

use App\Http\Requests\DecideLeaveRequest;
use App\Http\Requests\StoreLeaveRequest;
use App\Models\LeaveRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', LeaveRequest::class);

        $requests = LeaveRequest::with('user')
            ->when(
                $request->user()->role === 'employee',
                fn ($q) => $q->where('user_id', $request->user()->id)
            )
            ->when(
                $request->has('status'),
                fn ($q) => $q->where('status', $request->query('status'))
            )
            ->latest()
            ->get();

        return response()->json($requests);
    }

    public function store(StoreLeaveRequest $request): JsonResponse
    {
        $this->authorize('create', LeaveRequest::class);

        $leaveRequest = LeaveRequest::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        return response()->json($leaveRequest, 201);
    }

    public function show(LeaveRequest $leaveRequest): JsonResponse
    {
        $this->authorize('view', $leaveRequest);

        return response()->json($leaveRequest->load('user', 'decider'));
    }

    public function decide(DecideLeaveRequest $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $this->authorize('decide', $leaveRequest);

        $leaveRequest->update([
            'status' => $request->validated('decision'),
            'decided_by' => $request->user()->id,
            'decision_note' => $request->validated('note'),
            'decided_at' => now(),
        ]);

        return response()->json($leaveRequest->fresh(['user', 'decider']));
    }
}
