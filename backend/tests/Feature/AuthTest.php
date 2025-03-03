<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// POST /api/register

it('registers a new user and returns 200 with user json', function (): void {
    $response = $this->postJson('/api/register', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['id', 'name', 'email', 'role'])
        ->assertJsonPath('role', 'employee');

    $this->assertDatabaseHas('users', ['email' => 'jane@example.com']);
});

it('register returns 422 when email is already taken', function (): void {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->postJson('/api/register', [
        'name' => 'Duplicate',
        'email' => 'taken@example.com',
        'password' => 'password123',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

// POST /api/login

it('logs in with valid credentials and returns 200 with user json', function (): void {
    User::factory()->create([
        'email' => 'alice@example.com',
        'password' => 'secret1234',
    ]);

    $this->postJson('/api/login', [
        'email' => 'alice@example.com',
        'password' => 'secret1234',
    ])->assertStatus(200)
        ->assertJsonStructure(['id', 'name', 'email', 'role']);
});

it('login returns 422 on wrong password', function (): void {
    User::factory()->create(['email' => 'bob@example.com']);

    $this->postJson('/api/login', [
        'email' => 'bob@example.com',
        'password' => 'wrongpassword',
    ])->assertStatus(422)
        ->assertJsonPath('message', 'Invalid credentials.');
});

// POST /api/logout

it('logs out an authenticated user and returns 204', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/logout')
        ->assertStatus(204);
});

it('logout returns 401 for unauthenticated request', function (): void {
    $this->postJson('/api/logout')
        ->assertStatus(401);
});

// GET /api/me

it('returns the authenticated user on GET /api/me', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/me')
        ->assertStatus(200)
        ->assertJsonPath('id', $user->id)
        ->assertJsonPath('email', $user->email);
});

it('GET /api/me returns 401 when unauthenticated', function (): void {
    $this->getJson('/api/me')
        ->assertStatus(401);
});
