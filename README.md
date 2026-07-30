# PawConnect

PawConnect is an AI-native pet care operations platform for pet owners and care teams. It brings together a conversational assistant, lost-and-found reporting, adoption listings, vet and grooming requests, staff availability, and an admin console into one workflow-driven system.

Milo, the assistant, is designed to do more than answer questions. It helps users move from intent to action: asking for missing details, creating structured records, and keeping staff-facing data available for review and follow-up.

## Highlights

- AI pet care assistant with chat sessions and knowledge-backed answers
- Lightweight RAG over seeded pet-care knowledge documents
- Deterministic workflow handlers for appointments, listings, and staff availability
- Social-style lost-and-found feed with image-based user posts
- Admin dashboard for listings, bookings, and staff operations
- Mobile-friendly admin record cards and desktop table views
- Toast-based feedback, validation, and delete confirmation flows
- PostgreSQL persistence with Prisma migrations and seed data

## Product Flow

```text
Pet owner
  -> asks Milo a question
  -> receives pet-care guidance or workflow prompts
  -> creates a lost/found report, adoption listing, or appointment request
  -> record is stored in PostgreSQL

Admin / staff
  -> reviews new records in the dashboard
  -> edits, deletes, or manages status
  -> uses staff and appointment data to support care operations
```

## Core Modules

### Assistant

Milo supports pet-care conversations around:

- grooming
- vet visits
- vaccination basics
- pet nutrition
- adoption readiness
- lost pet first steps
- staff availability
- appointment and listing creation

The chat API stores session history, routes operational requests through deterministic workflows, and falls back to knowledge-backed model responses for general pet-care questions.

### Lost And Found

The public landing page includes a compact social-style lost-and-found section:

- image-first cards
- lost/found badges
- pet details
- location details
- share action
- user-side create-post composer
- mandatory image upload

Images are currently stored as base64 data URLs in `PetListing.imageUrl`. This keeps the project self-contained and avoids introducing object storage before it is needed.

### Admin Console

The admin console manages operational records:

- adoption posts
- lost and found reports
- vet and grooming bookings
- staff profiles, availability, and status

The dashboard adapts by screen size:

- mobile: compact card layout with image previews
- desktop: table layout with listing thumbnails

## Architecture

```text
paw-connect/
  web/
    src/app/                 Next.js App Router pages and flows
    src/components/ui/       Reusable shadcn-style UI primitives
    src/lib/api.ts           Frontend API client
    src/lib/lost-found.ts    Lost/found data loading helper

  api/
    src/chat/                Assistant orchestration and workflow routing
    src/knowledge/           Knowledge search for RAG context
    src/listings/            Adoption and lost/found CRUD
    src/appointments/        Vet/grooming booking CRUD
    src/staff/               Staff CRUD
    src/health/              API/database health check
    prisma/schema.prisma     PostgreSQL schema
    prisma/seed.js           Development seed data
```

## AI And Workflow Design

PawConnect separates language generation from business-critical actions.

### LLM Responsibilities

The LLM is used where natural language is useful:

- answering pet-care questions
- explaining care guidance conversationally
- using retrieved knowledge context to produce grounded responses

### Deterministic Responsibilities

Normal application code is used where correctness and control matter:

- required field checks
- intent-specific workflow routing
- appointment creation
- listing creation
- staff availability lookup
- admin CRUD
- authentication checks
- CORS rules
- upload limits
- database writes

This prevents important operations from depending entirely on free-form model output.

## Retrieval-Augmented Generation

PawConnect uses a lightweight RAG flow for general pet-care answers.

When a user sends a question, the backend searches seeded `KnowledgeDocument` records for relevant context. Matching documents are passed into the model prompt, and the response includes citations from those sources.

Current retrieval is keyword-based. The Prisma schema includes an `embedding Float[]` field on `KnowledgeDocument`, which leaves a clear upgrade path for vector similarity search.

## Data Model

Main Prisma models:

- `KnowledgeDocument`
- `ChatSession`
- `ChatMessage`
- `PetListing`
- `AppointmentRequest`
- `StaffMember`

`PetListing` supports three workflows:

- `LOST`
- `FOUND`
- `ADOPTION`

## Failure Handling

The app includes practical guardrails for common failures:

- Empty or incomplete workflow requests ask for missing fields
- API failures surface as toast messages
- Invalid admin login appears as toast feedback
- Image uploads reject non-image files
- Large images are blocked before submit
- API JSON body size is raised for image-based posts
- Admin deletes require confirmation
- Admin dashboard remains renderable when the API is offline

## Current Trade-Offs

The project keeps a few implementation choices intentionally simple:

- Image upload stores base64 data URLs in PostgreSQL instead of object storage
- RAG retrieval is keyword-based instead of vector similarity search
- Admin authentication uses env-configured credentials and cookie sessions
- Observability is limited to application errors and health checks

Production upgrades would include object storage, role-based access control, rate limiting, structured logs, monitoring, E2E tests, and AI evaluation datasets.

## Tech Stack

Frontend:

- Next.js
- React
- Tailwind CSS
- shadcn-style UI primitives
- Framer Motion

Backend:

- NestJS
- Prisma
- PostgreSQL

AI:

- OpenRouter/OpenAI-compatible chat configuration
- Keyword-based retrieval over local knowledge documents

## Local Development

Start PostgreSQL:

```bash
docker compose up -d
```

Run the API:

```bash
cd api
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

Run the web app:

```bash
cd web
npm install
npm run dev
```

Local URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- Health check: `http://localhost:4000/health`

## Environment Variables

API: `api/.env`

```bash
PORT=4000
FRONTEND_URL="http://localhost:3000"
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/paw_connect?schema=public"
OPENROUTER_API_KEY=""
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
OPENROUTER_MODEL="meta-llama/llama-3.1-8b-instruct:free"
OPENAI_API_KEY=""
OPENAI_CHAT_MODEL="gpt-5.6-terra"
OPENAI_EMBEDDING_MODEL="text-embedding-3-small"
```

Web: `web/.env.local`

```bash
NEXT_PUBLIC_API_URL="http://localhost:4000"
ADMIN_EMAIL="admin@pawconnect.local"
ADMIN_PASSWORD="admin123"
ADMIN_SESSION_TOKEN="change-this-dev-token"
```

## Admin Access

Default development credentials:

- Email: `admin@pawconnect.local`
- Password: `admin123`

Change these values before deploying.

## Scripts

API:

```bash
npm run build
npm run start:prod
npm run prisma:seed
```

Web:

```bash
npm run lint
npm run build
npm run start
```

## Deployment

Recommended deployment:

- Frontend: Vercel
- Backend: Render Web Service
- Database: Render PostgreSQL

Backend build command:

```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

Backend start command:

```bash
npm run start:prod
```

Frontend build command:

```bash
npm run build
```

Required deployment wiring:

- Set `NEXT_PUBLIC_API_URL` in Vercel to the deployed API URL.
- Set `FRONTEND_URL` in Render to the deployed frontend URL.
- Set production admin credentials and session token in Vercel.
- Set `DATABASE_URL` in Render API from the PostgreSQL service.
