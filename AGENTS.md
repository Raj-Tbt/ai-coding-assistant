# AGENTS.md — Development Guide

## Architecture Overview

```
frontend/  →  Vite + React 18 + TypeScript + Tailwind CSS
backend/   →  FastAPI + SQLAlchemy 2 (async) + PostgreSQL
AI layer   →  Google Gemini 2.0 Flash via google-genai SDK
Auth       →  JWT (HS256) + Argon2id
Streaming  →  Server-Sent Events (POST /api/chat/stream)
```

## Key Design Decisions

- **SSE via fetch** (not EventSource) — required for POST + Authorization header
- **Context budgeting** — Token-estimated sliding window (100K cap), always keeps system prompt
- **Auto-title** — Gemini generates a 3-6 word title on the first message
- **Row-level security** — All DB queries filter by `user_id`; users never access other users' data
- **Argon2id** — Password hashing (argon2-cffi); never bcrypt
- **Async throughout** — SQLAlchemy 2 async engine + asyncpg driver

## Code Style

- **Comments**: only when necessary, explain WHY not WHAT, no decorative banners
- **TypeScript**: strict types, no `any` unless unavoidable
- **Python**: type hints everywhere, async/await throughout
- **Naming**: meaningful, conventional (snake_case Python, camelCase TS)

## Adding a New Feature

1. Backend: add model → schema → service → API endpoint → include in router
2. Frontend: add type → service → hook (TanStack Query) → component → page
3. Never bypass `user_id` filtering in DB queries
4. Always handle loading and error states in UI components

## Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Running Tests

```bash
cd backend
pytest tests/
```
