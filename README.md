# Calendly

A TypeScript + Express REST API for a Calendly-style scheduling backend, backed by PostgreSQL (via Prisma) and Temporal for async slot generation, email-notification, and Google Calendar sync workflows.

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL with [Prisma](https://www.prisma.io/) ORM (pg adapter)
- **Workflows:** [Temporal](https://temporal.io/) (client + worker) for slot regeneration, booking confirmation emails, and Google Calendar event creation
- **Email:** [Nodemailer](https://nodemailer.com/) (SMTP), caught locally by MailHog
- **Calendar:** [googleapis](https://github.com/googleapis/google-api-nodejs-client) — OAuth2 setup flow + calendar event creation with a Google Meet link
- **Cache/state:** [Redis](https://redis.io/) (via [ioredis](https://github.com/redis/ioredis)) — stores the Google OAuth refresh token/email after setup
- **Validation:** Zod
- **Dates/times:** Luxon
- **Package manager:** pnpm
- **Dev tooling:** tsx, nodemon
- **Local infra:** Docker Compose (Temporal server + Temporal UI + MailHog + Redis)

## Project Structure

```
src/
├── app.ts                          # Express app, route mounting, health check
├── server.ts                       # Server bootstrap (DB connect + listen)
├── config/
│   ├── database.ts                 # Prisma/DB connection
│   ├── env.ts                      # Environment variable loading
│   ├── temporal.ts                 # Temporal client connection
│   ├── redis.ts                    # Redis client connection
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
│   └── workflows/                  # Workflow definitions (slot regeneration, booking confirmation email, Google Calendar event)
└── utils/                          # ApiError, ApiResponse helpers
prisma/
└── schema.prisma                   # User, EventType, AvailabilityRule,
                                     # AvailabilityException, Slot, Booking models
docker-compose.yml                  # Temporal server + Temporal UI + MailHog + Redis
postman_collection.json             # Postman collection covering all API routes
```

The codebase follows a layered architecture: **routes → controllers → services → repositories**.

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A running PostgreSQL instance
- Docker (for running Temporal, MailHog, and Redis locally)

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a `.env` file in the project root (copy [.env.example](.env.example) as a starting point — real secrets like `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are left blank there):

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

   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GOOGLE_REDIRECT_URI="http://localhost:3000/api/v1/integrations/google/callback"
   GOOGLE_SENDER_EMAIL="info@example.com"
   GOOGLE_CALENDER_ID=primary

   REDIS_URL=redis://localhost:6379
   ```

   Leave `SMTP_USER`/`SMTP_PASS` empty for MailHog (no auth needed locally); set both to enable SMTP auth against a real provider.

   The `GOOGLE_*` variables are only needed for the Google Calendar integration — see [Google Calendar Integration](#google-calendar-integration) below for the setup flow. Leaving `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_REDIRECT_URI` unset disables the integration (`isProjectCalenderConfigured()` returns `false`) without breaking the rest of the API. `REDIS_URL` is where the OAuth refresh token/email get stored after setup — it's only read by the Google Calendar integration, so it can be left at its default if you're not using that feature yet.

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
   - Redis: `localhost:6379`

## Running

Start the API (auto-reloads on changes):

```bash
pnpm dev
```

Start the Temporal worker in a separate terminal (required for slot-regeneration workflows to actually run):

```bash
pnpm dev:worker
```

The API runs at `http://localhost:3000` (or the `PORT` you configured). Workflow-triggering code paths are skipped with a warning instead of failing whenever either: `TEMPORAL_ENABLED` is not `"true"` (a static opt-out), or `isTemporalHealthy()` ([src/config/temporal.ts](src/config/temporal.ts)) can't reach the Temporal server — a live `getSystemInfo` check run before every workflow start, since a server that's down mid-session wouldn't be caught by the static flag alone.

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
| POST   | `/api/v1/bookings/:id/cancel`             | Cancel a booking                      | `x-host-id`    |
| GET    | `/api/v1/integrations/google/setup`       | Returns the Google OAuth2 consent URL | – |
| GET    | `/api/v1/integrations/google/callback`    | OAuth2 redirect target — exchanges `code` for a refresh token | – |

A ready-to-import [postman_collection.json](postman_collection.json) covers every route above with example request bodies and a `baseUrl`/`hostId` variable setup.

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

curl -X POST http://localhost:3000/api/v1/bookings/1/cancel \
  -H "x-host-id: 1"
```

## Data Model

Core entities (see `prisma/schema.prisma` for full detail):

- **User** — a host with a unique slug and timezone. `createUserService` ([src/services/user.service.ts](src/services/user.service.ts)) derives the slug from `name` when one isn't supplied, auto-disambiguating collisions with a numeric suffix (`jane`, `jane-2`, `jane-3`, ...); an explicitly-supplied slug that's already taken is rejected with a `409` instead, since that's a deliberate choice rather than a generated default.
- **EventType** — a bookable meeting type owned by a host (duration, buffers, location, slug).
- **AvailabilityRule** — recurring weekly availability window (`weekday` + `startTime`/`endTime`).
- **AvailabilityException** — one-off override for a specific date (`BLOCK_FULL_DAY`, `BLOCK_PARTIAL`, `ADD_AVAILABLE_WINDOW`).
- **Slot** — a concrete bookable time window generated from rules/exceptions for a host + event type.
- **Booking** — an invitee's reservation of a slot; carries `meetLink`/`calendarEventId` once the Google Calendar event workflow completes.

## Booking Concurrency Control

[src/services/booking.service.ts](src/services/booking.service.ts) implements slot booking two ways, both inside a `prisma.$transaction`, with Prisma calls factored into [src/repositories/booking.repository.ts](src/repositories/booking.repository.ts):

- `createBookingService` — **optimistic**: reads the slot, then commits the booking via a conditional `updateMany` (`WHERE id = ... AND status = 'AVAILABLE'`); if another request booked it first, the update matches zero rows and the request fails fast with `400`.
- `createBookingServiceWithPessimisticLock` — **pessimistic**: opens with `SELECT ... FOR UPDATE` to lock the slot row for the transaction's duration, so a concurrent booking attempt on the same slot blocks until this one commits or rolls back, then sees the up-to-date status. Not yet wired to a route.

Only `createBookingService` is exposed via `POST /api/v1/bookings` today. After either path commits, `postBookingActions` fires the Temporal workflows for the affected host/booking (see below), and the response is shaped by the shared `formatBookingResponse` helper. `listHostBooking` (backing `GET /api/v1/bookings`) supports filtering by `status`, and by `from`/`to` — matched against the *slot's* start time, not the booking's `createdAt`.

`cancelBookingService` (backing `POST /api/v1/bookings/:id/cancel`) validates the booking belongs to the requesting host and isn't already cancelled, then `cancelBookingRecord` transactionally marks it `CANCELLED` (with `cancelledAt`) and flips its slot back to `AVAILABLE`. It then re-triggers slot regeneration for that date — cancelling doesn't just free the one slot; any neighboring slots that were `BLOCKED` by this booking's buffer window need to be re-evaluated and freed too — followed by `startCancelBookingWorkflow` to send the cancellation email.

## Temporal Workflows

Workflows run asynchronously rather than inline in the request path, all started from [src/temporal/client.ts](src/temporal/client.ts) via `client.workflow.start(...)` — never call a workflow function directly from service code, since it relies on `proxyActivities` and only works inside the Temporal worker sandbox:

- `regenerateHostSlotsWorkflow` ([src/temporal/workflows/slot-generation.workflow.ts](src/temporal/workflows/slot-generation.workflow.ts)) calls the `regenerateHostSlotsActivity` activity to rebuild a host's slots (e.g. after availability rules/exceptions change, or after a booking — scoped to just that slot's date so buffer-adjacent slots get correctly blocked).
- `confirmBookingWorkflow` ([src/temporal/workflows/booking-notification.workflow.ts](src/temporal/workflows/booking-notification.workflow.ts)) runs `createGoogleCalenderEventActivity` (a no-op unless `isGoogleCalendarReady()` is true — i.e. the OAuth client is configured *and* setup consent has been completed) followed by `sendBookingConfirmationEmailActivity`, in that order within the same workflow. The activities run sequentially so the email — which includes the Meet link when one exists — always reads back a `meetLink` persisted by the calendar step, rather than racing it. `sendBookingConfirmationEmailActivity` sends the invitee a confirmation email via [src/mailer/booking.mailer.ts](src/mailer/booking.mailer.ts); `createGoogleCalenderEventActivity` creates the Google Calendar event via [src/services/google-calender.service.ts](src/services/google-calender.service.ts) and persists `meetLink`/`calendarEventId` onto the booking.
- `cancelBookingWorkflow` ([src/temporal/workflows/booking-notification.workflow.ts](src/temporal/workflows/booking-notification.workflow.ts)) runs `sendBookingCancellationEmailActivity`, notifying the invitee that their booking was cancelled.
- `createGoogleCalenderEventWorkflow` ([src/temporal/workflows/google-calender.workflow.ts](src/temporal/workflows/google-calender.workflow.ts)) is the same calendar-event step exposed standalone (`startCreateGoogleCalenderEventWorkflow` in [src/temporal/client.ts](src/temporal/client.ts)). Not called from the booking flow — kept for a future manual/admin re-sync trigger.
- An independent worker process ([src/temporal/worker.ts](src/temporal/worker.ts)) executes all of the above. Run `pnpm dev:worker` alongside `pnpm dev` for workflows to be picked up, inspect runs in the Temporal UI at `http://localhost:8080`, and check sent emails in the MailHog UI at `http://localhost:8025`.

## Google Calendar Integration

Booking confirmation can optionally create a Google Calendar event (with a Meet link) on the host's calendar, via [src/services/google-calender.service.ts](src/services/google-calender.service.ts):

1. Configure an OAuth2 client in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) with redirect URI `http://localhost:3000/api/v1/integrations/google/callback` (or your deployed equivalent), and enable the Google Calendar API.
2. On the OAuth consent screen's **Data Access** page, add the non-sensitive `.../auth/userinfo.email` scope in addition to the calendar scopes — required for the callback to resolve the authorizing account's email.
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in `.env`, and make sure Redis is running (`docker compose up -d redis`).
4. `GET /api/v1/integrations/google/setup` returns `{ data: { url } }` — visit that URL and grant consent.
5. Google redirects to `/api/v1/integrations/google/callback?code=...`; `exchangeSetupCode` exchanges the code for tokens and stores `{ refreshToken, email }` in Redis under the `google:integration` key via [src/config/redis.ts](src/config/redis.ts). The response only echoes back `{ email }` — the refresh token stays server-side.
6. From here on, `getGoogleCalenderClient()` reads the refresh token back out of Redis to authenticate every calendar API call — no manual `.env` copy-paste needed. Re-running steps 4–5 overwrites the stored token (e.g. if it's revoked).

Until setup is completed (or if `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_REDIRECT_URI` are unset), `isGoogleCalendarReady()` returns `false` and the calendar activity is skipped entirely — bookings, and their confirmation emails, still succeed without it.

## License

ISC
