# AI-Powered Customer Support System

A fullstack multi-agent customer support platform built with **Hono**, **React**, **PostgreSQL**, and **Vercel AI SDK**.

This monorepo uses Turborepo to manage the backend API and frontend web application.

## 🚀 Getting Started

### Prerequisites

-   **Node.js 18+** (pnpm recommended)
-   **PostgreSQL** (running locally or cloud like Supabase/Neon)
-   **OpenAI API Key**

### Installation & Setup

1.  **Install Dependencies**
    ```bash
    pnpm install
    ```

2.  **Environment Configuration**
    
    Create a `.env` file in the root directory. It must contain the following keys:

    ```env
    # Database Connection (Transaction Mode)
    DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]?pgbouncer=true"

    # AI Provider
    OPENAI_API_KEY="sk-proj-..."
    
    PORT=3001
    NODE_ENV=development
   
    ```

3.  **Database Setup**
    Push the schema and seed demo data:
    ```bash
    pnpm db:push
    pnpm db:seed
    ```

4.  **Run Development Server**
    Start both frontend and backend concurrently:
    ```bash
    pnpm dev
    ```
    -   **Frontend**: [http://localhost:5173](http://localhost:5173) (or 5174 if port in use)
    -   **Backend**: [http://localhost:3001](http://localhost:3001)

## 📂 Project Structure

```
swadesAI_technical_assessment/
├── .turbo                          # Turborepo configuration
├── apps/
│   ├── api/                        # Hono Backend (Node.js)
│   │   ├── prisma/                 # Database Schema & Seed
│   │   ├── src/
│   │       ├── agents/             # AI Agents (Router, Support, Order, Billing)
│   │       ├── tools/              # DB-querying tools for each agent
│   │       ├── services/           # Orchestration & Business Logic
│   │       ├── controllers/        # HTTP Request Handling
│   │       ├── routes/             # API Route Definitions
│   │       ├── middleware/         # Error, Logging, Rate Limits
│   │       └── lib/                # Prisma, AI SDK setup
│   │
│   └── web/                        # React Frontend (Vite)
│       └── src/
│           ├── components/         # Chat UI Components
│           ├── hooks/              # AI SDK Hooks (useChat)
│           ├── api/                # Hono RPC Client
│           └── styles/             # CSS Design System
│
└── packages/
    └── shared/                     # Shared Types & Constants
```

## ✨ Key Features

-   **Multi-Agent System**: Specialized agents handle support, orders, and billing queries.
-   **Intelligent Routing**: Classifies generic user intent to direct queries to the right agent.
-   **Conversational Memory**: Handles long chats via context compaction (summarization).
-   **Streaming Responses**: Real-time token streaming with typing indicators.
-   **Rate Limiting**: Protected API endpoints (100 req/min general, 20 req/min chat).

## 🔗 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat/messages` | Send message (streaming response) |
| `GET` | `/api/chat/conversations` | List user conversations |
| `GET` | `/api/chat/conversations/:id` | Get conversation history |
| `GET` | `/api/agents` | List available agents |
| `GET` | `/api/health` | System health check |
