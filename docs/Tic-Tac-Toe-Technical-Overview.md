# Tic Tac Toe Application — Technical Overview (End-to-End)

**Document version:** 1.0  
**Stack:** React 18, Redux, Nx, Material UI, Express API  
**Repository path:** `react_application/tic-tac-toe`

---

## 1. Purpose (Why this application exists)

This project is a **frontend-only** Tic Tac Toe product built to a formal technical exercise specification. It demonstrates how to:

- Deliver a complete browser game with **clear separation of concerns** (UI, state, rules, API).
- Manage complex session behaviour (modes, undo, scoreboard, computer AI) with **predictable global state**.
- Integrate with a **REST-style mock backend** without implementing a real .NET or Node production server.
- Structure a real-world codebase in an **Nx monorepo** so features can grow without turning into a single unmaintainable folder.

**Why not a custom backend?** Game rules, validation, win/draw detection, and undo logic must live in the client so the solution stays easy to install, review, and test in an interview or panel setting. The API only **persists JSON**; it does not own business rules.

---

## 2. What the application does (Scope)

| Capability | Description |
|------------|-------------|
| **Two-player mode** | Humans play X and O; X starts; turns alternate. |
| **Computer mode** | Human is X; O is automated after each valid human move. |
| **Board** | 3×3 grid; occupied cells locked; no moves after win/draw. |
| **Move history** | Table of move number, player, row, column (1-based). |
| **Undo** | Two-player: one move. Computer: pair of moves when applicable. Disabled after game ends. |
| **Scoreboard** | Session counts for X wins, O wins, draws; updated once per finished game. |
| **Reset game** | Clears board and history; keeps mode and scoreboard. |
| **Reset scoreboard** | Zeros counts; does not reset the active board. |
| **API sync** | REST API (`server/`) owns game and scoreboard state; client hydrates from responses. |

---

## 3. Technology choices (What & why)

| Technology | Role | Why use it |
|------------|------|------------|
| **React 18** | UI rendering | Functional components and hooks; industry standard for interactive UIs. |
| **Nx** | Workspace & builds | Monorepo boundaries, `nx serve` / `nx test` / `nx build` for the app and libs. |
| **Redux** | Global state | Single source of truth for board, mode, history, scoreboard, API status. |
| **redux-thunk** | Async flows | Init, moves, sync, scoreboard updates without Redux Toolkit (per spec). |
| **Material UI (MUI)** | Design system | Buttons, layout, tables, alerts; responsive `sx` styling with minimal custom CSS. |
| **Express** | REST API | In-memory `GameService`; task.pdf routes under `/api`. |
| **Vite** | Dev server & bundle | Fast HMR for the React app under Nx. |
| **Vitest + RTL** | Tests | Unit tests for pure logic, reducers, and smoke UI render. |

---

## 4. High-level architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (http://localhost:4200)                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ apps/tic-tac-toe — shell (Provider, Theme, bootstrap) │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                               │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │ libs/game/feature-game — GamePage (containers, actions) │  │
│  │ libs/game/ui-board — GameBoard, BoardCell               │  │
│  │ libs/scoreboard/feature-scoreboard — ScoreboardPanel    │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │ dispatch / select             │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │ libs/game/data-access — Redux store, thunks, API client │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │ calls pure functions           │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │ libs/game/util-game-logic — rules, validation, AI, win  │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────┘
                                │ HTTP (fetch)
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  Express API (http://localhost:3000/api) — GameService       │
│  Routes: /api/games, /api/games/:id/moves, /api/scoreboard  │
└─────────────────────────────────────────────────────────────┘
```

**Layering principle:** React components do not embed win detection or computer strategy. They dispatch thunks; thunks call **pure** utilities and reducers apply results.

---

## 5. Nx project structure

```
tic-tac-toe/
├── apps/tic-tac-toe/              # Entry: main.tsx, App, Vite config
├── libs/game/util-game-logic/     # Domain logic (no React, no Redux)
├── libs/game/data-access/         # Redux + API
├── libs/game/ui-board/            # Presentational board
├── libs/game/feature-game/        # Smart page composing UI + store
├── libs/scoreboard/feature-scoreboard/
├── server/                        # Express REST API
└── package.json                   # scripts: start, api, dev, test
```

Path aliases (e.g. `@tic-tac-toe/game-data-access`) are defined in `tsconfig.base.json` and Vite `resolve.alias`.

---

## 6. Redux state model

### 6.1 Game slice (`GameState`)

| Field | Use |
|-------|-----|
| `gameId` | Server-side game record id from POST `/games`. |
| `board` | Nine cells: `'X'`, `'O'`, or `null`. |
| `currentPlayer` | Who may move next. |
| `mode` | `TwoPlayer` or `Computer`. |
| `status` | `InProgress`, `Won`, or `Draw`. |
| `winner` | `'X'`, `'O'`, or `null`. |
| `winningCells` | Indices of winning line for highlight. |
| `moveHistory` | Ordered list of moves with row/column (1-based). |
| `isComputerMoving` | Disables UI while AI “thinks”. |
| `isResultRecorded` | Prevents double scoreboard updates. |
| `loading` / `error` | API lifecycle and user-visible errors. |

### 6.2 Scoreboard slice (`ScoreboardState`)

`xWins`, `oWins`, `draws`, plus `loading` and `error` for API operations.

### 6.3 Action flow (typical move)

1. User clicks cell → `playMove(index)` thunk.
2. Thunk calls `POST /api/games/:id/moves` with 1-based row/column.
3. `GameService` validates, applies move, runs computer AI when needed, updates scoreboard once on completion.
4. Thunk dispatches `HYDRATE_FROM_API` with the response; Redux mirrors server state.

---

## 7. Game logic library (`util-game-logic`)

| Module | Responsibility |
|--------|----------------|
| `board.ts` | Empty board, index ↔ row/column (1-based for display). |
| `validation.ts` | Bounds, empty cell, correct player, in-progress, computer flags. |
| `win.ts` | Row/column/diagonal wins; draw when full with no winner. |
| `game-logic.ts` | `applyMoveToBoard`, `rebuildGameFromHistory` (for undo). |
| `computer.ts` | AI priority: win → block → centre → corner → first free cell. |

**Why pure functions?** Easy to unit test without mounting React or mocking Redux. Matches specification that rules are testable outside components.

---

## 8. REST API (Express)

See `docs/API.md` and `docs/json-server-api.md` for the full contract. The server owns validation, computer moves, undo, reset, and scoreboard updates. The client uses Vite proxy `/api` → port 3000 in development.

---

## 9. User interface (MUI)

- **GamePage:** mode selector, status line (`aria-live`), board, action buttons, history table, scoreboard card.
- **GameBoard / BoardCell:** grid layout; keyboard-accessible buttons; winning cells highlighted (colour + border).
- **Theme:** primary/secondary colours distinguish X and O; success tone for winning cells.

**Why MUI?** Spec requires a component library for layout and consistency; custom CSS is limited to what MUI does not cover.

---

## 10. Key behavioural decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Undo after win/draw | **Disabled** | Avoid scoreboard rollback complexity. |
| Mode change | Resets board/history; keeps scoreboard | Per specification. |
| Computer undo | Remove O then preceding X when possible | Returns turn to human X. |
| Scoreboard | `isResultRecorded` flag | Exactly one increment per completed game. |
| Computer move | Server-side in same request | No client-side AI after hydrate. |

---

## 11. End-to-end runtime flow

1. **Install:** `npm install` in `tic-tac-toe/`.
2. **API:** `npm run api` → Express on port **3000**.
3. **UI:** `npm run start` → Vite serves app on port **4200** (`npm run dev` runs both).
4. **Bootstrap:** `initializeApp` POSTs `/api/games` and hydrates Redux from the response.
5. **Play:** Thunks POST move/undo/reset endpoints and hydrate from each response.
6. **Test:** `npm test` runs Vitest (logic, reducer, App smoke test).

---

## 12. Testing strategy

| Area | Examples |
|------|----------|
| Pure logic | Valid/invalid moves, wins, draws, undo rebuild, computer priorities. |
| Reducers | Reset game, undo moves. |
| UI | App renders title with mocked init. |

Tests run via **Nx:** `nx test tic-tac-toe`.

---

## 13. Limitations and assumptions

- Single scoreboard record (`id: 1`) for the demo session.
- No authentication or multi-user isolation.
- API must be running for persistence; otherwise init may show errors depending on version/branch.
- Production deployment would need a real API host URL and CORS/proxy strategy (not in scope for the exercise).

---

## 14. Possible extensions

- Playwright e2e tests for full click paths.
- Vite proxy for `/api` in development.
- Offline mode with graceful degradation.
- Multiple saved games in the UI.

---

## 15. Summary

This application is a **spec-driven**, **layered** React solution: **util-game-logic** owns rules, **data-access** owns state and HTTP, **feature** and **ui** libraries own presentation, and **Express** serves the task.pdf API contract. That split supports review, testing, and panel discussion of both product behaviour and engineering trade-offs.
