# AI-Powered Coding Assistant

A full-stack, production-quality AI coding assistant built for educational platforms. Features a ChatGPT-style conversational UI powered by Google Gemini, with real-time streaming, persistent conversation history, and full authentication.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue) ![Gemini](https://img.shields.io/badge/Gemini-3.5--flash--lite-orange)

---

## Features

- **AI Code Generation** — Generate clean code in 13+ languages
- **Debugging** — Analyze errors and produce corrected code with explanations
- **Code Explanation** — Step-by-step breakdowns for learners
- **Optimization** — Algorithmic improvements with complexity analysis
- **Real-time Streaming** — Token-by-token SSE output (no page refresh)
- **Math Rendering** — KaTeX for inline and display math expressions
- **Syntax Highlighting** — highlight.js for 190+ languages
- **Conversation History** — Persist, search, rename, and delete chats
- **Dark / Light / System** themes with class-based switching
- **JWT Authentication** — Argon2id password hashing, 7-day tokens
- **Row-level security** — All DB queries scoped to `user_id`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS v4 |
| Backend | Python FastAPI + SQLAlchemy 2 (async) + asyncpg |
| Database | PostgreSQL 18 |
| AI Model | Google Gemini `gemini-3.5-flash-lite` |
| Auth | JWT (HS256) + Argon2id |
| Streaming | Server-Sent Events via `fetch` (supports POST + Auth header) |
| Math | remark-math + rehype-katex |
| Highlighting | highlight.js (github-dark theme) |

---

## Project Structure

```
AI-Powered Coding Assistant/
├── frontend/                  # React + TypeScript SPA
│   ├── src/
│   │   ├── components/        # UI components (chat, layout, auth, ui)
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── hooks/             # useChat, useConversations, useAuth, useTheme
│   │   ├── pages/             # LoginPage, RegisterPage, ChatPage
│   │   ├── services/          # API client functions
│   │   └── types/             # TypeScript types
│   └── vite.config.ts
├── backend/                   # FastAPI REST API
│   ├── app/
│   │   ├── ai/                # Gemini client, system prompt, context manager
│   │   ├── api/               # Route handlers (auth, chat, conversations, settings)
│   │   ├── core/              # Config, database, security, dependencies
│   │   ├── models/            # SQLAlchemy ORM models
│   │   └── schemas/           # Pydantic request/response schemas
│   ├── alembic/               # Database migrations
│   └── requirements.txt
├── .env.example               # Environment variable template
└── docker-compose.yml
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 18 (running locally or via Docker)
- Google Gemini API key — get one free at [aistudio.google.com](https://aistudio.google.com)

### 1. Clone & configure environment

```bash
git clone https://github.com/YOUR_USERNAME/ai-coding-assistant.git
cd "ai-coding-assistant"

cp .env.example .env
# Edit .env — set GEMINI_API_KEY and JWT_SECRET_KEY
```

### 2. Database setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE code_assistant;"

# Run migrations
cd backend
pip install -r requirements.txt
alembic upgrade head
```

### 3. Start the backend

```bash
cd backend
# Windows — load .env variables then start uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 5. Docker Compose (alternative)

```bash
docker-compose up --build
# → http://localhost:5173
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Example |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key | `AQ.Ab8RN...` |
| `DATABASE_URL` | PostgreSQL async connection string | `postgresql+asyncpg://postgres:password@localhost:5432/code_assistant` |
| `JWT_SECRET_KEY` | Random secret for JWT signing (32+ chars) | `change-me-in-production` |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_EXPIRY_DAYS` | Token lifetime in days | `7` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `ENVIRONMENT` | `development` or `production` | `development` |

> **Never commit your real `.env` file.** It is listed in `.gitignore`.

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login → JWT token |
| GET | `/api/auth/me` | ✅ | Current user info |
| POST | `/api/chat/stream` | ✅ | AI streaming response (SSE) |
| GET | `/api/conversations/` | ✅ | List user's conversations |
| POST | `/api/conversations/` | ✅ | Create conversation |
| PATCH | `/api/conversations/{id}` | ✅ | Rename conversation |
| DELETE | `/api/conversations/{id}` | ✅ | Delete conversation |
| GET | `/api/conversations/{id}/messages` | ✅ | Get message history |
| GET | `/api/settings/` | ✅ | Get user settings |
| PATCH | `/api/settings/` | ✅ | Update user settings |
| GET | `/api/health` | ❌ | Health check |

---

## Architecture Notes

- **SSE via `fetch`** (not `EventSource`) — required for POST requests with an `Authorization` header
- **Context budgeting** — sliding window with ~100K token cap; always keeps the system prompt
- **Auto-title** — Gemini generates a 3-6 word title on the first message of each conversation
- **Async throughout** — SQLAlchemy 2 async engine + asyncpg driver; Gemini SDK calls run in `asyncio.to_thread`
- **Tailwind v4 dark mode** — class-based via `@variant dark (&:where(.dark, .dark *))` in CSS

---

## License

MIT
