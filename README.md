# Calendly

A TypeScript + Express REST API for a Calendly-style scheduling backend, backed by PostgreSQL (via Prisma) and Temporal for async slot generation and email-notification workflows.

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL with [Prisma](https://www.prisma.io/) ORM (pg adapter)
- **Workflows:** [Temporal](https://temporal.io/) (client + worker) for slot regeneration and booking confirmation emails
- **Email:** [Nodemailer](https://nodemailer.com/) (SMTP), caught locally by MailHog
- **Validation:** Zod
- **Dates/times:** Luxon
- **Package manager:** pnpm
- **Dev tooling:** tsx, nodemon
- **Local infra:** Docker Compose (Temporal server + Temporal UI + MailHog)

## Project Structure

```
src/
├── app.ts                          # Express app, route mounting, health check
├── server.ts                       # Server bootstrap (DB connect + listen)
├── config/
│   ├── database.ts                 # Prisma/DB connection
│   ├── env.ts                      # Environment variable loading
│   ├── temporal.ts                 # Temporal client connection
│   └── nodemailer.ts               # SMTP transporter (Nodemailer)
├── controllers/                    # Request/response handling
├── services/                       # Business logic
├── repositories/                   # Data access (Prisma)
├── routes/                         # Route definitions
├── dtos/                           # Zod request schemas
├── mailer/                         # Email templates/senders (e.g. booking confirmation)
├── middlewares/                    # validate, validateQuery, error-handler, requireUserId, route-not-found
├── temporal/
│   ├── client.ts                   # Starts workflows from the API process
│   ├── worker.ts                   # Temporal worker entrypoint
│   ├── activities/                 # Activity implementations
│   └── workflows/                  # Workflow definitions (slot regeneration, booking confirmation email)
└── utils/                          # ApiError, ApiResponse helpers
prisma/
└── schema.prisma                   # User, EventType, AvailabilityRule,
                                     # AvailabilityException, Slot, Booking models
docker-compose.yml                  # Temporal server + Temporal UI + MailHog
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

   SMTP_HOST=localhost
   SMTP_PORT=1025
   SMTP_USER=
   SMTP_PASS=
   EMAIL_FROM="Calendly <noreply@example.com>"
   ```

   Leave `SMTP_USER`/`SMTP_PASS` empty for MailHog (no auth needed locally); set both to enable SMTP auth against a real provider.

3. Generate the Prisma client and apply the schema:

   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

4. Start Temporal and MailHog via Docker Compose:

   ```bash
   docker compose up -d
   ```

   - Temporal server: `localhost:7233`
   - Temporal Web UI: [http://localhost:8080](http://localhost:8080)
   - MailHog SMTP: `localhost:1025`
   - MailHog Web UI (view sent emails): [http://localhost:8025](http://localhost:8025)

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
| POST   | `/api/v1/bookings`                        | Book an available slot                | `x-host-id`    |
| GET    | `/api/v1/bookings`                        | List a host's bookings (filters: `status`, `from`, `to`) | `x-host-id` |

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

curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "x-host-id: 1" \
  -d '{"slotId":"<slot-id>","inviteeEmail":"invitee@example.com","inviteeName":"Jane Doe"}'

curl "http://localhost:3000/api/v1/bookings?status=CONFIRMED&from=2026-08-01&to=2026-08-31" \
  -H "x-host-id: 1"
```

## Data Model

Core entities (see `prisma/schema.prisma` for full detail):

- **User** — a host with a unique slug and timezone.
- **EventType** — a bookable meeting type owned by a host (duration, buffers, location, slug).
- **AvailabilityRule** — recurring weekly availability window (`weekday` + `startTime`/`endTime`).
- **AvailabilityException** — one-off override for a specific date (`BLOCK_FULL_DAY`, `BLOCK_PARTIAL`, `ADD_AVAILABLE_WINDOW`).
- **Slot** — a concrete bookable time window generated from rules/exceptions for a host + event type.
- **Booking** — an invitee's reservation of a slot.

## Booking Concurrency Control

[src/services/booking.service.ts](src/services/booking.service.ts) implements slot booking two ways, both inside a `prisma.$transaction`, with Prisma calls factored into [src/repositories/booking.repository.ts](src/repositories/booking.repository.ts):

- `createBookingService` — **optimistic**: reads the slot, then commits the booking via a conditional `updateMany` (`WHERE id = ... AND status = 'AVAILABLE'`); if another request booked it first, the update matches zero rows and the request fails fast with `400`.
- `createBookingServiceWithPessimisticLock` — **pessimistic**: opens with `SELECT ... FOR UPDATE` to lock the slot row for the transaction's duration, so a concurrent booking attempt on the same slot blocks until this one commits or rolls back, then sees the up-to-date status. Not yet wired to a route.

Only `createBookingService` is exposed via `POST /api/v1/bookings` today. After either path commits, `postBookingActions` fires two Temporal workflows for the affected host/booking (see below), and the response is shaped by the shared `formatBookingResponse` helper. `listHostBooking` (backing `GET /api/v1/bookings`) supports filtering by `status`, and by `from`/`to` — matched against the *slot's* start time, not the booking's `createdAt`.

## Temporal Workflows

Two workflows run asynchronously rather than inline in the request path, both started from [src/temporal/client.ts](src/temporal/client.ts) via `client.workflow.start(...)` — never call a workflow function directly from service code, since it relies on `proxyActivities` and only works inside the Temporal worker sandbox:

- `regenerateHostSlotsWorkflow` ([src/temporal/workflows/slot-generation.workflow.ts](src/temporal/workflows/slot-generation.workflow.ts)) calls the `regenerateHostSlotsActivity` activity to rebuild a host's slots (e.g. after availability rules/exceptions change, or after a booking — scoped to just that slot's date so buffer-adjacent slots get correctly blocked).
- `sendBookingConfirmationEmailWorkflow` ([src/temporal/workflows/booking-notification.workflow.ts](src/temporal/workflows/booking-notification.workflow.ts)) calls `sendBookingConfirmationEmailActivity`, which sends the invitee a confirmation email via [src/mailer/booking.mailer.ts](src/mailer/booking.mailer.ts).
- An independent worker process ([src/temporal/worker.ts](src/temporal/worker.ts)) executes both. Run `pnpm dev:worker` alongside `pnpm dev` for workflows to be picked up, inspect runs in the Temporal UI at `http://localhost:8080`, and check sent emails in the MailHog UI at `http://localhost:8025`.

## License

ISC
