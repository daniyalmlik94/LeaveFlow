# LeaveFlow

A small HR leave-request application built as a portfolio piece to demonstrate Laravel + React monolith judgment. Employees submit leave requests; managers approve or reject them.

## How to run

**Requirements:** PHP 8.3, Composer, Node 18+, pnpm

```bash
# Backend (port 8000)
cd backend
cp .env.example .env          # then add your APP_KEY if not already set
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Frontend (port 5173) — in a separate terminal
cd frontend
pnpm install
pnpm dev
```

Then open http://localhost:5173.

## Run tests

```bash
cd backend
php vendor/bin/pest
```

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel, PHP 8.3 |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Auth | Laravel Sanctum (cookie-based SPA) |
| Database | SQLite (dev) |
| Testing | Pest |
