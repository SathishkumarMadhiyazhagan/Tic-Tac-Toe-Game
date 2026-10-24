# task.pdf coverage — gap analysis

**Reference:** hackathon specification (`task.pdf`; local path varies)  
**Repository:** `react_application` (single package: React 18 + Vite + Redux + Express)  
**Last reviewed:** 2026-10-24

This document is the **compliance checklist** for panel review. For how to run the app, see [README](../README.md). For API details, see [API.md](./API.md).

---

## Executive summary

| Area | Status |
|------|--------|
| Gameplay & UI (functional requirements) | **Covered** |
| REST API (`/api` prefix, task.pdf routes) | **Covered** (+ extras below) |
| Server owns rules, validation, scoring, computer moves | **Covered** (`server/` + `libs/game/game-service`) |
| Client applies API responses only (no local move application) | **Covered** (`HYDRATE_FROM_API` thunks) |
| Automated tests (logic, service, API, UI smoke) | **Covered** — 37 Vitest tests (`npm test`) |
| README + API documentation | **Covered** |
| Literal Angular + .NET submission bundle | **Not in repo** — React + Express by design |

**Stack note:** task.pdf mentions Angular/.NET in some submission wording; the **technology expectations** call for **React** and a REST API. This project uses **React 18, Vite, Redux, MUI** on the client and **Express (Node)** on the server, with the same endpoint shapes as the suggested API table.

---

## Repository layout (relevant to review)

| Path | Role |
|------|------|
| `src/` | Vite React shell (`main.tsx`, `app.tsx`, global styles) |
| `libs/game/util-game-logic/` | Pure rules (board, validation, win/draw, computer AI) — shared with server |
| `libs/game/game-service/` | In-memory orchestration used by Express |
| `libs/game/data-access/` | Redux store, thunks, API client, normalization |
| `libs/game/feature-game/`, `ui-board/`, `libs/scoreboard/` | UI features |
| `server/` | Express app, routes, interactive API console (`/`, `/api`) |

There is **no** json-server process in production paths; [API.md](./API.md) includes json-server-style notes for comparison only.

---

## 1. Functional requirements

| Requirement | Covered? | Implementation |
|-------------|----------|----------------|
| 3×3 board, X/O, lock occupied cells | Yes | `GameBoard` / `BoardCell`; server `validateMove` |
| Turn display and alternation; invalid move does not advance turn | Yes | `GamePage`; `game-service` |
| Win (row/column/diagonal), highlight cells, block further moves, scoreboard | Yes | `win.ts`, UI highlights, `isResultRecorded` |
| Draw: message, block moves, scoreboard | Yes | Same pipeline |
| Reset game: clear board/history/status, X to play, keep scoreboard | Yes | `POST /api/games/:id/reset` |
| Move history (number, player, position) | Yes | MUI table; API `moveHistory` + `position` |
| Undo — two-player (last move only) | Yes | `game-service.undo` |
| Undo — computer (remove O and preceding X when applicable) | Yes | `game-service.spec.ts` |
| Undo disabled when no moves | Yes | Server + disabled UI |
| Undo after game complete | **Option A** (disabled) | README; server returns 400 |
| Scoreboard: session X / O / draws, once per finished game | Yes | Server-side counts |
| Reset scoreboard (independent of board) | Yes | `POST /api/scoreboard/reset` |
| Scoreboard from backend | Yes | On every game response + `GET /api/scoreboard` |
| Two-player and vs-computer modes | Yes | Mode selector + `PATCH .../mode` |
| Computer AI priorities (win → block → centre → corner → free) | Yes | `computer.ts` (server-invoked) |
| Responsive UI (laptop) | Yes | MUI layout |

---

## 2. REST API

### task.pdf endpoints

| Method | Endpoint | Implemented? | Notes |
|--------|----------|--------------|--------|
| POST | `/api/games` | Yes | Returns full state + embedded scoreboard |
| GET | `/api/games/{id}` | Yes | |
| POST | `/api/games/{id}/moves` | Yes | Body: `{ "row", "column" }` (1-based) |
| POST | `/api/games/{id}/undo` | Yes | |
| POST | `/api/games/{id}/reset` | Yes | |
| GET | `/api/scoreboard` | Yes | |
| POST | `/api/scoreboard/reset` | Yes | |

### Additional endpoints (documented)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/games` | List all in-memory sessions |
| PATCH | `/api/games/{id}/mode` | Change mode and reset board (UI) |
| GET | `/`, `/api` | Browser API console (`server/api-console.html`) |

### Response shape (task.pdf)

| Field | Supported |
|-------|-----------|
| `gameId` | Yes |
| `board` (`""` / `X` / `O`) | Yes |
| `currentPlayer`, `mode`, `status`, `winner` | Yes |
| `winningCells` as `{ row, column }[]` (1-based) | Yes |
| `moveHistory` (incl. `position`) | Yes |
| `scoreboard` on game payloads | Yes |

### Known contract deviations

| topic | task.pdf / panel expectation | This repo |
|-------|---------------------------|-----------|
| Move body `player` | May include player in JSON | **Omitted** — server uses `currentPlayer` |
| App bootstrap | May load existing game/scoreboard | **`POST /api/games`** on first load (`initializeApp` in `game.thunks.ts`) |
| Persistence | Implied session continuity | **In-memory** — state lost when API process restarts |
| Backend stack | .NET in some bullets | **Express + TypeScript** |

---

## 3. Architecture

| Principle | Status |
|-----------|--------|
| Single rules implementation for server | Yes — `util-game-logic` imported by `game-service` |
| Redux reflects server state after each action | Yes — thunks → `HYDRATE_FROM_API` |
| Scoreboard updated only on server when a game completes | Yes |
| Undo Option A documented | Yes — README + this doc |
| Dev proxy | Vite proxies `/api` → `http://127.0.0.1:3000` |

---

## 4. Testing

| Area | Covered? | Where |
|------|----------|--------|
| Valid / invalid moves | Yes | `game-logic.spec.ts`, `game-service.spec.ts`, API tests |
| Turn switching | Yes | `game-logic.spec.ts` |
| Wins (row / column / diagonal) | Yes | `game-logic.spec.ts` |
| Draw | Yes | `game-logic.spec.ts` |
| Reset game | Yes | Reducer specs + `POST .../reset` integration |
| Undo (two-player & computer) | Yes | `game.reducer.spec.ts`, `game-service.spec.ts` |
| Scoreboard on win | Yes | `game-service.spec.ts` |
| Computer move order | Yes | `computer.spec.ts` |
| Moves after game over | Yes | Logic + API 400 |
| REST integration | Yes | `server/api.integration.spec.mts` |
| UI smoke | Yes | `src/app/app.spec.tsx` |

**Commands:** `npm test` (full suite, 37 tests) · `npm run test:api` (service + integration subset).

**Minor gaps (optional):** no dedicated integration test asserting draw increments `draws`; no Redux thunk test with mocked `fetch`.

---

## 5. Documentation map

| Document | Purpose |
|----------|---------|
| [README](../README.md) | Install, run, stack, design decisions |
| [API.md](./API.md) | Full REST reference (routes, shapes, curl, architecture) |
| **gap-analysis.md** (this file) | task.pdf vs implementation |

---

## 6. Acceptance criteria (task.pdf)

| Criterion | Met? |
|-----------|------|
| Frontend runs locally (`npm run start` / `dev`) | Yes |
| API runs locally (`npm run api`, port 3000) | Yes |
| REST integration between UI and API | Yes |
| Core gameplay, modes, undo, scoreboard, resets | Yes |
| Basic automated tests | Yes |
| README for reviewers | Yes |
| Ship Angular + .NET artifacts | **No** — document React + Express choice |

---

## 7. Optional follow-ups

1. **Session resume:** `GET /api/scoreboard` + persist `gameId` (e.g. `sessionStorage`) + `GET /api/games/{id}` instead of always creating a new game on refresh.
2. **Move body:** accept optional `player` and validate against `currentPlayer`.
3. **Draw scoring:** add an API integration test that completes a draw and asserts `draws` increments.
4. **Persistence:** SQLite or file-backed store if sessions must survive API restarts.
5. **.NET port** of `game-service` only if the panel mandates C#.

---

*For review: treat React + Express as an intentional implementation of the task.pdf API and behaviour requirements, not a missing Angular/.NET zip.*
