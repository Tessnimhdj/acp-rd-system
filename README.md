# ACP RD System

Version 2 of the internal operations platform for ACP Solution.

This release replaces the first version with a structured codebase for client follow-up, field visits, and commercial planning. It is built for daily use by the sales, R&D, and production teams.

## Scope

- Client records and visit history
- Field visit reports, including unsuccessful visits
- Commercial calendar with appointment creation, approval, refusal, and cancellation
- Team and user management with role-based access
- Dashboard and company profile

## Roles

| Role | Access |
| --- | --- |
| Admin | Full access, including users and visit deletion |
| Sales manager | Team, visits, clients, and appointment validation |
| Commercial | Own visits, clients, and appointments |
| R&D | Technical fields on approved visits |
| Production | Read-only access to approved visits |

## Stack

- Laravel 10
- Inertia.js and React
- Bootstrap 5
- MySQL
- Spatie Laravel Permission

## Requirements

- PHP 8.2 or later
- Composer
- Node.js 18 or later
- MySQL

## Setup

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run dev
php artisan serve
```

The application is served at `http://127.0.0.1:8000`.
