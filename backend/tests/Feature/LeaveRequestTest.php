<?php

use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// GET /api/leave-requests

it('returns only the authenticated employee\'s own requests', function (): void {
    $employee = User::factory()->create(['role' => 'employee']);
    $other = User::factory()->create(['role' => 'employee']);

    LeaveRequest::factory()->count(2)->create(['user_id' => $employee->id]);
    LeaveRequest::factory()->create(['user_id' => $other->id]);

    $response = $this->actingAs($employee)->getJson('/api/leave-requests');

    $response->assertStatus(200);
    expect($response->json())->toHaveCount(2)
        ->each(fn ($item) => $item->user_id->toBe($employee->id));
});

it('GET /api/leave-requests returns 401 when unauthenticated', function (): void {
    $this->getJson('/api/leave-requests')->assertStatus(401);
});

// POST /api/leave-requests

it('creates a leave request and returns 201 with json', function (): void {
    $employee = User::factory()->create(['role' => 'employee']);

    $payload = [
        'type' => 'vacation',
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(7)->toDateString(),
        'reason' => 'Family holiday trip abroad.',
    ];

    $response = $this->actingAs($employee)->postJson('/api/leave-requests', $payload);

    $response->assertStatus(201)
        ->assertJsonStructure(['id', 'type', 'start_date', 'end_date', 'reason', 'status', 'user_id']);

    $this->assertDatabaseHas('leave_requests', [
        'user_id' => $employee->id,
        'type' => 'vacation',
        'status' => 'pending',
    ]);
});

it('store returns 422 when end_date is before start_date', function (): void {
    $employee = User::factory()->create();

    $this->actingAs($employee)->postJson('/api/leave-requests', [
        'type' => 'sick',
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'reason' => 'Not feeling well at all.',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['end_date']);
});

it('store returns 422 when start_date is in the past', function (): void {
    $employee = User::factory()->create();

    $this->actingAs($employee)->postJson('/api/leave-requests', [
        'type' => 'personal',
        'start_date' => now()->subDay()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'reason' => 'Personal matter to attend to.',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['start_date']);
});

it('store returns 422 when reason is too short', function (): void {
    $employee = User::factory()->create();

    $this->actingAs($employee)->postJson('/api/leave-requests', [
        'type' => 'vacation',
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addDays(3)->toDateString(),
        'reason' => 'Too short',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['reason']);
});

it('POST /api/leave-requests returns 401 when unauthenticated', function (): void {
    $this->postJson('/api/leave-requests', [])->assertStatus(401);
});

// GET /api/leave-requests/{id}

it('returns a specific leave request owned by the authenticated user', function (): void {
    $employee = User::factory()->create();
    $leaveRequest = LeaveRequest::factory()->create(['user_id' => $employee->id]);

    $this->actingAs($employee)
        ->getJson("/api/leave-requests/{$leaveRequest->id}")
        ->assertStatus(200)
        ->assertJsonPath('id', $leaveRequest->id);
});

it('returns 403 when employee tries to view another employee\'s request', function (): void {
    $employeeA = User::factory()->create(['role' => 'employee']);
    $employeeB = User::factory()->create(['role' => 'employee']);
    $leaveRequest = LeaveRequest::factory()->create(['user_id' => $employeeB->id]);

    $this->actingAs($employeeA)
        ->getJson("/api/leave-requests/{$leaveRequest->id}")
        ->assertStatus(403);
});

// GET /api/leave-requests (manager)

it('manager sees all requests regardless of owner', function (): void {
    $manager = User::factory()->create(['role' => 'manager']);
    $employeeA = User::factory()->create(['role' => 'employee']);
    $employeeB = User::factory()->create(['role' => 'employee']);

    LeaveRequest::factory()->count(2)->create(['user_id' => $employeeA->id]);
    LeaveRequest::factory()->create(['user_id' => $employeeB->id]);

    $this->actingAs($manager)
        ->getJson('/api/leave-requests')
        ->assertStatus(200)
        ->assertJsonCount(3);
});

it('manager can filter requests by status=pending', function (): void {
    $manager = User::factory()->create(['role' => 'manager']);
    $employee = User::factory()->create(['role' => 'employee']);

    LeaveRequest::factory()->create(['user_id' => $employee->id, 'status' => 'pending']);
    LeaveRequest::factory()->create(['user_id' => $employee->id, 'status' => 'approved']);

    $this->actingAs($manager)
        ->getJson('/api/leave-requests?status=pending')
        ->assertStatus(200)
        ->assertJsonCount(1)
        ->assertJsonPath('0.status', 'pending');
});

// PATCH /api/leave-requests/{id}/decide

it('manager can approve a pending request', function (): void {
    $manager = User::factory()->create(['role' => 'manager']);
    $employee = User::factory()->create(['role' => 'employee']);
    $leaveRequest = LeaveRequest::factory()->create(['user_id' => $employee->id, 'status' => 'pending']);

    $this->actingAs($manager)
        ->patchJson("/api/leave-requests/{$leaveRequest->id}/decide", ['decision' => 'approved'])
        ->assertStatus(200)
        ->assertJsonPath('status', 'approved')
        ->assertJsonPath('decided_by', $manager->id);

    $this->assertDatabaseHas('leave_requests', [
        'id' => $leaveRequest->id,
        'status' => 'approved',
        'decided_by' => $manager->id,
    ]);
});

it('manager can reject a pending request with a note', function (): void {
    $manager = User::factory()->create(['role' => 'manager']);
    $employee = User::factory()->create(['role' => 'employee']);
    $leaveRequest = LeaveRequest::factory()->create(['user_id' => $employee->id, 'status' => 'pending']);

    $this->actingAs($manager)
        ->patchJson("/api/leave-requests/{$leaveRequest->id}/decide", [
            'decision' => 'rejected',
            'note' => 'Insufficient staffing during that period.',
        ])
        ->assertStatus(200)
        ->assertJsonPath('status', 'rejected')
        ->assertJsonPath('decision_note', 'Insufficient staffing during that period.');
});

it('employee cannot decide a leave request', function (): void {
    $employee = User::factory()->create(['role' => 'employee']);
    $other = User::factory()->create(['role' => 'employee']);
    $leaveRequest = LeaveRequest::factory()->create(['user_id' => $other->id, 'status' => 'pending']);

    $this->actingAs($employee)
        ->patchJson("/api/leave-requests/{$leaveRequest->id}/decide", ['decision' => 'approved'])
        ->assertStatus(403);
});

it('manager cannot decide their own leave request', function (): void {
    $manager = User::factory()->create(['role' => 'manager']);
    $leaveRequest = LeaveRequest::factory()->create(['user_id' => $manager->id, 'status' => 'pending']);

    $this->actingAs($manager)
        ->patchJson("/api/leave-requests/{$leaveRequest->id}/decide", ['decision' => 'approved'])
        ->assertStatus(403);
});

it('manager cannot decide an already-approved request', function (): void {
    $manager = User::factory()->create(['role' => 'manager']);
    $employee = User::factory()->create(['role' => 'employee']);
    $leaveRequest = LeaveRequest::factory()->create([
        'user_id' => $employee->id,
        'status' => 'approved',
        'decided_by' => $manager->id,
    ]);

    $this->actingAs($manager)
        ->patchJson("/api/leave-requests/{$leaveRequest->id}/decide", ['decision' => 'rejected'])
        ->assertStatus(403);
});

it('decide returns 422 for invalid decision value', function (): void {
    $manager = User::factory()->create(['role' => 'manager']);
    $employee = User::factory()->create(['role' => 'employee']);
    $leaveRequest = LeaveRequest::factory()->create(['user_id' => $employee->id, 'status' => 'pending']);

    $this->actingAs($manager)
        ->patchJson("/api/leave-requests/{$leaveRequest->id}/decide", ['decision' => 'maybe'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['decision']);
});

it('decide returns 401 when unauthenticated', function (): void {
    $employee = User::factory()->create(['role' => 'employee']);
    $leaveRequest = LeaveRequest::factory()->create(['user_id' => $employee->id]);

    $this->patchJson("/api/leave-requests/{$leaveRequest->id}/decide", ['decision' => 'approved'])
        ->assertStatus(401);
});
