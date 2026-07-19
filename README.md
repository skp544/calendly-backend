# Calendly

A TypeScript + Express REST API for a Calendly-style scheduling backend, backed by PostgreSQL (via Prisma) and Temporal for async slot generation workflows.

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL with [Prisma](https://www.prisma.io/) ORM (pg adapter)
- **Workflows:** [Temporal](https://temporal.io/) (client + worker) for slot regeneration
- **Validation:** Zod
- **Dates/times:** Luxon
- **Package manager:** pnpm
- **Dev tooling:** tsx, nodemon
- **Local infra:** Docker Compose (Temporal server + Temporal UI)

## Project Structure

```
src/
├── app.ts                          # Express app, route mounting, health check
├── server.ts                       # Server bootstrap (DB connect + listen)
├── config/
│   ├── database.ts                 # Prisma/DB connection
│   ├── env.ts                      # Environment variable loading
│   └── temporal.ts                 # Temporal client connection
├── controllers/                    # Request/response handling
├── services/                       # Business logic
├── repositories/                   # Data access (Prisma)
├── routes/                         # Route definitions
├── dtos/                           # Zod request schemas
├── middlewares/                    # validate, error-handler, requireUserId, route-not-found
├── temporal/
│   ├── client.ts                   # Starts workflows from the API process
│   ├── worker.ts                   # Temporal worker entrypoint
│   ├── activities/                 # Activity implementations
│   └── workflows/                  # Workflow definitions (e.g. slot regeneration)
└── utils/                          # ApiError, ApiResponse helpers
prisma/
└── schema.prisma                   # User, EventType, AvailabilityRule,
                                     # AvailabilityException, Slot, Booking models
docker-compose.yml                  # Temporal server + Temporal UI
```

The codebase follows a layered architecture: **routes → controllers → services → repositories**.

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A running PostgreSQL instance
- Docker (for running Temporal locally)

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a `.env` file in the project root:

   ```env
   PORT=3000

   DATABASE_URL="postgresql://user:password@localhost:5432/calendly?schema=public"

   NODE_ENV="development"

   SLOT_GENERATION_DAYS=30

   TEMPORAL_ADDRESS=localhost:7233
   TEMPORAL_NAMESPACE=default
   TEMPORAL_TASK_QUEUE=calendly-tasks
   TEMPORAL_ENABLED=true
   ```

3. Generate the Prisma client and apply the schema:

   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

4. Start Temporal (server + UI) via Docker Compose:

   ```bash
   docker compose up -d
   ```

   - Temporal server: `localhost:7233`
   - Temporal Web UI: [http://localhost:8080](http://localhost:8080)

## Running

Start the API (auto-reloads on changes):

```bash
pnpm dev
```

Start the Temporal worker in a separate terminal (required for slot-regeneration workflows to actually run):

```bash
pnpm dev:worker
```

The API runs at `http://localhost:3000` (or the `PORT` you configured). If `TEMPORAL_ENABLED` is not `"true"`, workflow-triggering code paths are skipped with a warning instead of failing.

## API Endpoints

All authenticated routes require an `x-host-id` header (numeric user/host ID).

| Method | Path                                     | Description                          | Auth header    |
| ------ | ----------------------------------------- | ------------------------------------- | -------------- |
| GET    | `/health`                                 | Health check                          | –              |
| GET    | `/api/v1/users`                           | List all users                        | –              |
| GET    | `/api/v1/users/:id`                       | Get a user by ID                      | –              |
| POST   | `/api/v1/users`                           | Create a user                         | –              |
| PATCH  | `/api/v1/users/:id`                       | Update a user                         | –              |
| DELETE | `/api/v1/users/:id`                       | Delete a user                         | –              |
| GET    | `/api/v1/event-types`                     | List event types for the host         | `x-host-id`    |
| GET    | `/api/v1/event-types/:id`                 | Get an event type by ID               | `x-host-id`    |
| POST   | `/api/v1/event-types`                     | Create an event type                  | `x-host-id`    |
| PATCH  | `/api/v1/event-types/:id`                 | Update an event type                  | `x-host-id`    |
| DELETE | `/api/v1/event-types/:id`                 | Delete an event type                  | `x-host-id`    |
| GET    | `/api/v1/public/event-types/:hostId/:slug`| Get a public event type by host+slug  | –              |
| GET    | `/api/v1/availability/rules`              | List weekly availability rules        | `x-host-id`    |
| POST   | `/api/v1/availability/rules`              | Create an availability rule           | `x-host-id`    |
| PATCH  | `/api/v1/availability/rules/:id`          | Update an availability rule           | `x-host-id`    |
| DELETE | `/api/v1/availability/rules/:id`          | Delete an availability rule           | `x-host-id`    |
| GET    | `/api/v1/availability/exceptions`         | List availability exceptions          | `x-host-id`    |
| POST   | `/api/v1/availability/exceptions`         | Create an availability exception      | `x-host-id`    |
| PATCH  | `/api/v1/availability/exceptions/:id`     | Update an availability exception      | `x-host-id`    |
| DELETE | `/api/v1/availability/exceptions/:id`     | Delete an availability exception      | `x-host-id`    |

### Example

```bash
curl http://localhost:3000/health

curl http://localhost:3000/api/v1/users

curl -X POST http://localhost:3000/api/v1/event-types \
  -H "Content-Type: application/json" \
  -H "x-host-id: 1" \
  -d '{"title":"30 Minute Meeting","durationMinutes":30}'

curl -X POST http://localhost:3000/api/v1/availability/rules \
  -H "Content-Type: application/json" \
  -H "x-host-id: 1" \
  -d '{"weekday":1,"startTime":"09:00","endTime":"17:00"}'
```

## Data Model

Core entities (see `prisma/schema.prisma` for full detail):

- **User** — a host with a unique slug and timezone.
- **EventType** — a bookable meeting type owned by a host (duration, buffers, location, slug).
- **AvailabilityRule** — recurring weekly availability window (`weekday` + `startTime`/`endTime`).
- **AvailabilityException** — one-off override for a specific date (`BLOCK_FULL_DAY`, `BLOCK_PARTIAL`, `ADD_AVAILABLE_WINDOW`).
- **Slot** — a concrete bookable time window generated from rules/exceptions for a host + event type.
- **Booking** — an invitee's reservation of a slot.

## Temporal Workflows

Slots are (re)generated asynchronously via a Temporal workflow rather than inline in the request path:

- `regenerateHostSlotsWorkflow` ([src/temporal/workflows/slot-generation.workflow.ts](src/temporal/workflows/slot-generation.workflow.ts)) calls the `regenerateHostSlotsActivity` activity to rebuild a host's slots (e.g. after availability rules/exceptions change).
- The API process ([src/temporal/client.ts](src/temporal/client.ts)) starts workflows on the `TEMPORAL_TASK_QUEUE` queue; an independent worker process ([src/temporal/worker.ts](src/temporal/worker.ts)) executes them.
- Run `pnpm dev:worker` alongside `pnpm dev` for workflows to be picked up, and inspect runs in the Temporal UI at `http://localhost:8080`.

## License

ISC
