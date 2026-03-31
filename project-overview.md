# Project Overview: Agentic Personal Assistant

This document explains the full project end to end: what each part does, how data flows through the system, and where to find the key logic.

## 1. What This Project Is

This is a full-stack Retrieval-Augmented Generation (RAG) app that lets you:

1. Upload PDF documents.
2. Ingest them into a Pinecone vector database.
3. Chat with an AI assistant that can search those uploaded docs when needed.

At a high level:

- Frontend: React + Vite chat interface and PDF upload UI.
- Backend: Express API for chat and ingestion.
- AI orchestration: LangChain agent with a retrieval tool.
- Vector store: Pinecone with embeddings (`llama-text-embed-v2`).
- LLM: OpenAI model (`gpt-4o`).

## 2. Repository Structure

- Root
  - `package.json`: workspace scripts to run server/client together.
  - `README.md`: setup and architecture summary.
  - `LICENSE`: MIT license.
  - `.gitignore`: root ignore rules.

- `server/`
  - `index.ts`: Express app and API routes.
  - `agent.ts`: LangChain agent setup and invocation.
  - `tools.ts`: knowledge-base retrieval tool over Pinecone.
  - `ingest.ts`: PDF -> chunks -> embeddings -> Pinecone flow.
  - `package.json`: backend dependencies and scripts.
  - `.env.example`: required environment variables.

- `client/`
  - `src/main.tsx`: React entry point.
  - `src/App.tsx`: UI logic for chat + upload.
  - `src/App.css`: chat/upload styling.
  - `src/index.css`: global styles.
  - `vite.config.js`: Vite setup (including API proxy config).
  - `package.json`: frontend dependencies and scripts.

## 3. Root-Level Scripts

In root `package.json`:

- `npm run dev`
  - Runs backend and frontend concurrently.
  - Server on port `3001`.
  - Client on port `5173`.

- `npm run dev:server`
  - Starts only backend.

- `npm run dev:client`
  - Starts only frontend.

- `npm run install:all`
  - Installs root, server, and client dependencies.

## 4. Backend Walkthrough

### 4.1 Express App (`server/index.ts`)

Main setup:

- Loads env vars via `dotenv/config`.
- Enables CORS and JSON body parsing.
- Configures Multer for PDF file upload:
  - files are stored temporarily in OS temp directory.
  - only PDFs are accepted.
  - max file size is `25 MB`.

Routes:

1. `POST /api/chat`
   - Expects JSON body with `message` and optional `sessionId`.
   - Calls `runAgent({ message, sessionId })`.
   - Returns `{ answer }`.
   - Includes fallback text if the model returns empty output.

2. `POST /api/ingest`
   - Expects multipart upload under field name `file`.
   - Calls `ingestData(filePath)` to process/store document chunks.
   - Deletes temporary file after processing (success or failure).

### 4.2 Agent Orchestration (`server/agent.ts`)

`runAgent` does the following:

1. Creates a `ChatOpenAI` model (`gpt-4o`, `temperature: 0`).
2. Creates a LangChain agent with:
   - the model,
   - tool list containing `searchKnowledgeBase`,
   - `MemorySaver` checkpointer,
   - a system prompt instructing use of the knowledge base.
3. Invokes the agent with user message.
4. Uses `thread_id: sessionId` so conversations can be tracked by session.
5. Returns the final agent output text.

### 4.3 Retrieval Tool (`server/tools.ts`)

`searchKnowledgeBase` is a LangChain tool (`name: search_knowledge_base`) that:

1. Lazily initializes Pinecone vector store once.
2. Validates env vars:
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX`
3. Creates Pinecone embeddings with model `llama-text-embed-v2`.
4. Runs `similaritySearch(query, 10)`.
5. Returns joined chunk text as context for the LLM.

### 4.4 Ingestion Pipeline (`server/ingest.ts`)

`ingestData(filePath)` pipeline:

1. Loads PDF via `PDFLoader`.
2. Splits content with `RecursiveCharacterTextSplitter`:
   - `chunkSize: 1000`
   - `chunkOverlap: 200`
3. Connects to Pinecone index from env vars.
4. Uses `PineconeEmbeddings` with `llama-text-embed-v2`.
5. Adds document chunks to vector store in batches of `96`.

This embedding model must match retrieval-time embeddings in `tools.ts` (and it does).

## 5. Frontend Walkthrough

### 5.1 Entry Point (`client/src/main.tsx`)

- Standard React bootstrap.
- Renders `<App />` inside `<StrictMode>`.

### 5.2 Main Component (`client/src/App.tsx`)

State managed in component:

- `input`: current message draft.
- `messages`: chat transcript.
- `loading`: chat request in progress.
- `selectedFile`: chosen PDF file.
- `uploading`: ingestion request in progress.
- `uploadStatus`: success/error status text.

Main behaviors:

1. Chat send flow (`sendMessage`)
   - Skips empty input and concurrent sends.
   - Appends user message locally.
   - `POST` to `http://localhost:3001/api/chat`.
   - Appends AI response or error message.

2. Upload flow (`uploadDocument`)
   - Builds `FormData` with selected file.
   - `POST` to `http://localhost:3001/api/ingest`.
   - Shows status and clears selected file on success.

3. UX details
   - Auto-scroll to newest message.
   - Enter sends message.
   - Shift+Enter inserts newline.
   - AI messages rendered using `react-markdown`.

### 5.3 Styling (`client/src/App.css`, `client/src/index.css`)

- `App.css` contains most of the intentional app UI:
  - dark shell,
  - sticky header,
  - upload panel,
  - chat bubbles,
  - composer.

- `index.css` contains global Vite defaults and base element styles.

## 6. End-to-End Runtime Flow

### 6.1 Ingestion Flow

1. User selects PDF in frontend.
2. Frontend posts file to `/api/ingest`.
3. Backend parses PDF.
4. Backend chunks text.
5. Backend creates embeddings for chunks.
6. Backend writes vectors to Pinecone.
7. Backend returns success response.

### 6.2 Chat Flow

1. User sends message.
2. Frontend posts message to `/api/chat`.
3. Backend runs LangChain agent.
4. Agent decides whether to call retrieval tool.
5. Tool searches Pinecone and returns top chunks.
6. Model composes final answer.
7. Backend returns answer.
8. Frontend renders answer in chat.

## 7. Environment Variables

Based on `server/.env.example`, key variables are:

- `OPENAI_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_INDEX`
- `LANGSMITH_TRACING`
- `LANGSMITH_ENDPOINT`
- `LANGSMITH_API_KEY`
- `LANGSMITH_PROJECT`

If Pinecone or OpenAI keys/index are missing, ingestion or retrieval will fail.

## 8. Notable Observations

1. `client/vite.config.js` has an `/api` proxy to `http://localhost:3001`, but `App.tsx` currently calls absolute backend URLs (`http://localhost:3001/...`).
2. The frontend does not send `sessionId` in chat calls right now, so backend defaults to `sessionId = "default"`.
3. There is an extra nested package manifest at `client/client/package.json` that appears unrelated to runtime logic.

## 9. Tech Stack Summary

- Backend: Node.js, Express, Multer
- Frontend: React, Vite
- LLM/Agent: LangChain + OpenAI (`gpt-4o`)
- Vector DB: Pinecone
- Embeddings: Pinecone embeddings (`llama-text-embed-v2`)
- Optional observability: LangSmith

## 10. Quick Mental Model

Think of this as two pipelines sharing one knowledge base:

1. Write pipeline (ingestion): PDF -> chunks -> embeddings -> Pinecone.
2. Read pipeline (chat): question -> optional retrieval -> LLM answer.

The LangChain agent is the decision layer that determines when retrieval is necessary before responding.
