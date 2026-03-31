# Agentic Personal Assistant

A full-stack Retrieval-Augmented Generation (RAG) assistant where you can upload PDF files, ingest them into Pinecone, and chat with an agent that can search your uploaded knowledge base.

This repository has been migrated to TypeScript for both frontend and backend.

![Screenshot](./files/imgs/Screenshot%202026-03-31%20074035.png)

## Overview

- Frontend: React 19 + Vite + TypeScript
- Backend: Express + TypeScript (Node ESM, tsx in dev)
- Agent: LangChain createAgent with tool calling
- Vector DB: Pinecone
- Embeddings: llama-text-embed-v2 via Pinecone embeddings
- LLM: OpenAI gpt-4.1-nano
- Optional tracing: LangSmith

## Features

- Upload PDF documents for ingestion
- Split and embed document chunks into Pinecone
- Ask questions through an agentic chat API
- Tool-based retrieval from uploaded knowledge
- Session-aware chat through sessionId
- Strict TypeScript checks across client and server

## Project Structure

```text
agentic-personal-assistant/
|-- package.json
|-- tsconfig.base.json
|-- README.md
|-- project-overview.md
|-- client/
|   |-- package.json
|   |-- tsconfig.json
|   |-- index.html
|   |-- vite.config.js
|   |-- src/
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |   |-- App.css
|   |   `-- index.css
|   `-- ...
`-- server/
    |-- package.json
    |-- tsconfig.json
    |-- env.d.ts
    |-- env.ts
    |-- index.ts
    |-- agent.ts
    |-- tools.ts
    |-- ingest.ts
    |-- .env.example
    `-- ...
```

## Prerequisites

- Node.js 18+
- npm
- OpenAI API key
- Pinecone API key and an existing Pinecone index
- LangSmith credentials (optional)

## Setup

1. Install dependencies from the repository root.

```bash
npm run install:all
```

1. Create a server environment file.

PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

Bash:

```bash
cp server/.env.example server/.env
```

1. Edit server/.env with your real keys.

```env
# LLM
OPENAI_API_KEY=your_openai_api_key

# Vector DB (Pinecone)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name

# Optional LangSmith tracing
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_key
LANGSMITH_PROJECT="Agentic RAG"
```

## Running the App

From the repository root:

```bash
npm run dev
```

Default ports:

- Client: <http://localhost:5173>
- Server: <http://localhost:3001>

Run only one side when needed:

```bash
npm run dev:client
npm run dev:server
```

## Scripts

Root (package.json):

- npm run dev: run server and client concurrently
- npm run dev:server: run server workspace dev command
- npm run dev:client: run client workspace dev command
- npm run typecheck: run server and client type checks
- npm run lint: run lint fix + format in both workspaces
- npm run install:all: install root/client/server dependencies

Client (client/package.json):

- npm --prefix client run dev
- npm --prefix client run build
- npm --prefix client run typecheck
- npm --prefix client run lint

Server (server/package.json):

- npm --prefix server run dev
- npm --prefix server run build
- npm --prefix server run typecheck
- npm --prefix server run start

## API Endpoints

### POST /api/chat

Request body:

```json
{
  "message": "What does the uploaded PDF say about X?",
  "sessionId": "optional-session-id"
}
```

Success response:

```json
{
  "answer": "..."
}
```

Error response:

```json
{
  "error": "..."
}
```

### POST /api/ingest

- Content type: multipart/form-data
- File field name: file
- Allowed file type: PDF
- Upload limit: 25 MB

Success response:

```json
{
  "ok": true
}
```

## How It Works

Ingestion flow:

1. Frontend uploads PDF to /api/ingest.
2. Server loads PDF content.
3. Text is chunked (size 1000, overlap 200).
4. Chunks are embedded and written to Pinecone in batches.

Chat flow:

1. Frontend sends message to /api/chat.
2. Server runs LangChain agent.
3. Agent can call search_knowledge_base tool.
4. Tool performs similarity search in Pinecone.
5. Agent returns final answer text.

## TypeScript Notes

- Shared base config: tsconfig.base.json
- Client config: client/tsconfig.json (noEmit, bundler module resolution)
- Server config: server/tsconfig.json (NodeNext, outDir dist)
- Server dev runtime uses tsx
- Server production start runs compiled output from dist/index.js
- Environment access is validated by server/env.ts and typed by server/env.d.ts

## Troubleshooting

1. Dependency resolution fails during install.

- Use npm run install:all from root.
- If installing server manually, use:

```bash
npm --prefix server install --legacy-peer-deps
```

1. Missing environment variables.

- Confirm server/.env exists.
- Confirm OPENAI_API_KEY, PINECONE_API_KEY, and PINECONE_INDEX are set.

1. Port conflict on 3001 or 5173.

- Windows:

```powershell
netstat -ano | findstr :3001
netstat -ano | findstr :5173
```

- macOS/Linux:

```bash
lsof -i :3001
lsof -i :5173
```

1. Empty or weak retrieval answers.

- Ensure documents were ingested successfully.
- Ensure ingestion and retrieval both use llama-text-embed-v2.

## Notes

- The frontend currently calls the backend using absolute localhost URLs (<http://localhost:3001>).
- The Vite proxy is configured in client/vite.config.js but is not used by current fetch calls.
