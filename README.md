# Football Fantasy Manager — Backend

A pragmatic Node.js + TypeScript backend for a football fantasy manager. It follows a clean layered architecture (routes → controllers → services → models), uses MongoDB (Mongoose), Zod for validation, JWT for auth, and a tiny Mongo-backed worker for background jobs (team creation).

### Highlights

- Strict TypeScript, no `any`, no non-null assertions.
- Zod input validation at the edge.
- JWT access tokens with Bearer auth.
- Async team creation using a simple job queue (Mongo-based worker).
- Transfer market: list/filter, add/remove listings, buy at 95% of asking price.
- Opinionated linting, formatting, security headers, structured logging.

## Getting Started

### Prerequisites

- Node.js >= 18.17
- A running MongoDB instance (e.g. `mongodb://localhost:27017`)

### Install

```bash
pnpm install
```

### Configure

Copy `.env` (created during setup) and adjust as needed:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/football_manager
JWT_SECRET=replace_me_in_prod
JWT_EXPIRES_IN=15m
BCRYPT_SALT_ROUNDS=12
```

### Run (API)

```bash
pnpm run dev
```

API will start on `http://localhost:4000`.

### Run (Worker)

```bash
pnpm exec tsx src/jobs/worker.ts
```

This worker polls MongoDB for pending jobs and processes team creation in the background.

## API Overview

Base URL: `/api`

Auth

- POST `/v1/auth/login-or-register` — body: `{ email, password }`
  - Returns `{ user: { id, email }, accessToken }`.

Teams

- GET `/v1/teams/me` — requires `Authorization: Bearer <token>`
- POST `/v1/teams/create-job` — enqueue async team creation

Transfer Market

- GET `/v1/transfers` — query: `playerName`, `teamName`, `minPrice`, `maxPrice`
- POST `/v1/transfers/list` — body: `{ playerId, askingPrice }`
- POST `/v1/transfers/unlist` — body: `{ playerId }`
- POST `/v1/transfers/buy` — body: `{ listingId }`

Notes

- Buy price is 95% of asking price.
- Teams must maintain 15–25 players.
- Team creation is asynchronous; poll `GET /v1/teams/me` after enqueuing.

## Project Structure

```
src/
  app/                 # express app composition
  config/              # database + domain constants
  controllers/         # request handlers
  jobs/                # background worker(s)
  middlewares/         # auth/error middleware
  models/              # mongoose models
  routes/              # route definitions (v1)
  services/            # business logic
  utils/               # helpers (logger, jwt)
  validations/         # zod schemas
```

## Development

- Lint: `pnpm run lint`
- Format: `pnpm run format`
- Build: `pnpm run build`

## Time Report

- Project scaffolding and tooling: ~30m
- Auth (Zod, JWT, bcrypt) and middleware: ~40m
- Models (User, Team, Player, Transfer, Job): ~30m
- Services and controllers (auth, team, transfer): ~70m
- Job worker and team creation flow: ~35m
- README and polish: ~15m

Total: ~3h 40m

## Notes & Trade-offs

- The job queue is intentionally minimal to keep dependencies light. In production, consider BullMQ or a managed queue.
- Text search on player name uses a basic index; a more advanced search service can be introduced later.
- Validation uses Zod at the service boundary for clarity and testability.
