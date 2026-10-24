# Tic Tac Toe (React 18 + Redux + Vite + MUI)

Browser-based Tic Tac Toe with two-player and computer modes, move history, undo, scoreboard, and a **REST API** where the **server owns game rules and state**.

## Technology stack

- **React 18** (functional components and hooks)
- **Vite** (React app at repo root)
- **Redux** + **redux-thunk**
- **Material UI (MUI)**
- **Express** API (`server/`) with shared **`game-service`** (uses `util-game-logic`)
- **Vitest** + **React Testing Library** + **Supertest** (API integration)

## Features

- 3×3 board, win/draw detection, winning-cell highlight
- Two Player and Play Against Computer modes
- Server-side move validation, computer AI, undo, reset
- Move history (move #, player, row/column)
- Session scoreboard (X / O / draws)
- **Undo Option A:** disabled after game completion
- Frontend renders state **returned by the API** after each action

## Project structure

```
Tic-Tac-Toe-Game/
├── src/                        # React app (Vite entry)
├── public/
├── server/                     # Express REST API (task.pdf routes)
├── libs/game/
│   ├── util-game-logic/        # Pure rules (shared with server)
│   ├── game-service/           # Server-side orchestration
│   ├── data-access/            # Redux + API client
│   ├── ui-board/
│   └── feature-game/
├── libs/scoreboard/feature-scoreboard/
└── docs/
    ├── API.md                  # Full REST reference (routes, shapes, curl)
    └── gap-analysis.md         # task.pdf checklist vs this repo
```

## Prerequisites

- Node.js 20+
- npm 10+

## Installation

```bash
npm install
```

## Run locally

**Terminal 1 – API (port 3000):**

```bash
npm run api
```

**Terminal 2 – React app (port 4200):**

```bash
npm run start
```

Or both:

```bash
npm run dev
```

- Frontend: http://localhost:4200  
- API base: http://localhost:3000/api  

## API summary (task.pdf)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/games` | List all games |
| POST | `/api/games` | Create game |
| GET | `/api/games/{id}` | Get game state |
| POST | `/api/games/{id}/moves` | Submit move `{ row, column }` |
| POST | `/api/games/{id}/undo` | Undo |
| POST | `/api/games/{id}/reset` | Reset game |
| PATCH | `/api/games/{id}/mode` | Change mode + reset board |
| GET | `/api/scoreboard` | Get scoreboard |
| POST | `/api/scoreboard/reset` | Reset scoreboard |

Details: [docs/API.md](./docs/API.md)

## Tests

```bash
npm test                 # UI + game logic + reducers
npm run test:api           # GameService + REST integration tests
```

## Redux

- Thunks call **POST/PATCH/GET** endpoints only.
- `HYDRATE_FROM_API` applies the full game + scoreboard from each response.
- `util-game-logic` remains the single rules implementation (used by `game-service`).

## Design decisions

- **Express + in-memory store** instead of .NET for easy local run; contract matches task.pdf.
- **PATCH `/api/games/:id/mode`** added for mode selector (not in original table; resets board per spec).
- **Undo after completion:** disabled (Option A).
- **Scoreboard:** updated on server when a game completes; reset via `POST /api/scoreboard/reset`.

## AI-assisted development

Built with Cursor assistance: React/Vite scaffold, Redux/MUI, API layer, tests, and documentation. Game rules and API contract were reviewed against task.pdf.

## Known limitations

- In-memory API state (resets when server restarts); no persistence layer.
- No authentication.

## Future improvements

- ASP.NET Core port of `game-service`
- SQLite persistence
- Playwright e2e tests
