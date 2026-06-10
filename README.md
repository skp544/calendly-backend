# Calendly

A TypeScript + Express REST API backed by PostgreSQL via Prisma.

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL with [Prisma](https://www.prisma.io/) ORM (pg adapter)
- **Validation:** Zod
- **Package manager:** pnpm
- **Dev tooling:** tsx, nodemon

## Project Structure

```
src/
├── app.ts                 # Express app, route mounting, health check
├── server.ts              # Server bootstrap (DB connect + listen)
├── config/
│   ├── database.ts        # Prisma/DB connection
│   └── env.ts             # Environment variable loading
├── controllers/
│   └── user.controller.ts # Request/response handling
├── services/
│   └── user.service.ts    # Business logic
├── repositories/
│   └── user.repository.ts # Data access (Prisma)
└── routes/
    └── user.routes.ts     # User route definitions
prisma/
└── schema.prisma          # Prisma schema (User model)
```

The codebase follows a layered architecture: **routes → controllers → services → repositories**.

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A running PostgreSQL instance

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a `.env` file in the project root:

   ```env
   PORT=3000
   DATABASE_URL="postgresql://user:password@localhost:5432/calendly"
   ```

3. Generate the Prisma client and apply the schema:

   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

## Running

Start the development server (auto-reloads on changes):

```bash
pnpm dev
```

The server runs at `http://localhost:3000` (or the `PORT` you configured).

## API Endpoints

| Method | Path                  | Description          |
| ------ | --------------------- | -------------------- |
| GET    | `/health`             | Health check         |
| GET    | `/api/v1/users`       | List all users       |
| GET    | `/api/v1/users/:id`   | Get a user by ID     |

### Example

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/users
curl http://localhost:3000/api/v1/users/1
```

## Data Model

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## License

ISC
