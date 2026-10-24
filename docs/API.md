# REST API reference (task.pdf contract)

The live server is **Express** (`npm run api` → port **3000**), not [json-server](https://github.com/typicode/json-server). Routes and JSON shapes follow **task.pdf**; custom actions (`/moves`, `/undo`, `/reset`, `/mode`) are implemented in `server/app.mts` + `GameService`.

**Architecture:** the server owns rules, validation, computer moves, undo, and scoreboard updates. The React client calls these endpoints and **hydrates Redux from each response** (`HYDRATE_FROM_API`) — it does not apply moves locally.

---

## Base URL

| Environment | URL |
|-------------|-----|
| API direct | `http://localhost:3000` |
| API prefix | `http://localhost:3000/api` |
| Via Vite proxy (`npm run start`) | `http://localhost:4200/api` |

### Browser console

Interactive index (json-server-style links):

- `http://localhost:3000/`
- `http://localhost:3000/api`

---

## Routes (all methods)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | API console (HTML) |
| `GET` | `/api` | API console (HTML) |
| `GET` | `/api/games` | List all game sessions |
| `POST` | `/api/games` | Create a new game |
| `GET` | `/api/games/:id` | Get one game by id |
| `POST` | `/api/games/:id/moves` | Play a move (server validates) |
| `POST` | `/api/games/:id/undo` | Undo last move(s) |
| `POST` | `/api/games/:id/reset` | Reset board and history |
| `PATCH` | `/api/games/:id/mode` | Change mode and reset board |
| `GET` | `/api/scoreboard` | Get session scoreboard |
| `POST` | `/api/scoreboard/reset` | Reset scoreboard to zero |

`:id` is the string `gameId` (e.g. `"1"`, `"2"`).

| Resource | Storage | Notes |
|----------|---------|--------|
| `games` | In-memory array | Full game state per item |
| `scoreboard` | In-memory singleton | Embedded on every game response; also `GET /api/scoreboard` |

---

## Game state (`GameState`)

Returned by all game endpoints:

```json
{
  "gameId": "1",
  "board": ["", "", "", "", "", "", "", "", ""],
  "currentPlayer": "X",
  "mode": "TwoPlayer",
  "status": "InProgress",
  "winner": null,
  "winningCells": [],
  "moveHistory": [],
  "isResultRecorded": false,
  "scoreboard": { "xWins": 0, "oWins": 0, "draws": 0 }
}
```

| Field | Type | Values |
|-------|------|--------|
| `gameId` | string | Server-assigned id |
| `board` | string[9] | `""`, `"X"`, or `"O"` (empty is `""`, not `null`) |
| `currentPlayer` | string | `"X"` \| `"O"` |
| `mode` | string | `"TwoPlayer"` \| `"Computer"` |
| `status` | string | `"InProgress"` \| `"Won"` \| `"Draw"` |
| `winner` | string \| null | `"X"` \| `"O"` \| `null` |
| `winningCells` | object[] | `{ "row", "column" }` (1-based); `[]` if none |
| `moveHistory` | object[] | See below |
| `isResultRecorded` | boolean | Scoreboard already updated for this result |
| `scoreboard` | object | Session totals (same shape as `GET /api/scoreboard`) |

### `moveHistory[]` entry

```json
{
  "id": "move-1730000000000-abc123",
  "moveNumber": 1,
  "player": "X",
  "row": 1,
  "column": 1,
  "cellIndex": 0,
  "position": "Row 1, Column 1"
}
```

### Scoreboard

```json
{ "xWins": 0, "oWins": 0, "draws": 0 }
```

---

## Endpoint details

### `GET /api/games`

**Response:** `200` — `GameState[]`

```bash
curl -s http://localhost:3000/api/games
```

### `POST /api/games`

**Response:** `201` — `GameState`

Optional body:

```json
{ "mode": "TwoPlayer" }
```

```bash
curl -s -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"mode":"Computer"}'
```

### `GET /api/games/:id`

**Response:** `200` — `GameState`  
**Errors:** `404` — `{ "message": "Game not found." }`

```bash
curl -s http://localhost:3000/api/games/1
```

### `POST /api/games/:id/moves`

Rows and columns are **1-based** (top-left is row 1, column 1). The server infers the player from `currentPlayer` (body does not include `player`).

**Request body:**

```json
{ "row": 1, "column": 1 }
```

**Response:** `200` — `GameState` (in `Computer` mode, may include the computer’s reply in the same response)  
**Errors:** `400`, `404`

```bash
curl -s -X POST http://localhost:3000/api/games/1/moves \
  -H "Content-Type: application/json" \
  -d '{"row":1,"column":1}'
```

### `POST /api/games/:id/undo`

Undo per mode rules (e.g. two plies in computer mode when applicable). **Body:** none.

**Response:** `200` — `GameState`  
**Errors:** `400`, `404`

```bash
curl -s -X POST http://localhost:3000/api/games/1/undo
```

### `POST /api/games/:id/reset`

Clears board and history; keeps `gameId` and session scoreboard.

Optional body:

```json
{ "mode": "TwoPlayer" }
```

**Response:** `200` — `GameState`

```bash
curl -s -X POST http://localhost:3000/api/games/1/reset \
  -H "Content-Type: application/json" \
  -d '{}'
```

### `PATCH /api/games/:id/mode`

Change mode and reset the board.

**Request body:**

```json
{ "mode": "Computer" }
```

**Response:** `200` — `GameState`  
**Errors:** `400` — invalid mode

```bash
curl -s -X PATCH http://localhost:3000/api/games/1/mode \
  -H "Content-Type: application/json" \
  -d '{"mode":"TwoPlayer"}'
```

### `GET /api/scoreboard`

**Response:** `200` — scoreboard object

```bash
curl -s http://localhost:3000/api/scoreboard
```

### `POST /api/scoreboard/reset`

Zeros session wins/draws. Does **not** reset the active board. **Body:** none.

**Response:** `200` — scoreboard object

```bash
curl -s -X POST http://localhost:3000/api/scoreboard/reset
```

---

## Errors

| Status | Body |
|--------|------|
| `400` | `{ "message": "..." }` |
| `404` | `{ "message": "..." }` |
| `500` | `{ "message": "Internal server error." }` |

---

## json-server note (reference only)

A typical path rewrite if this were behind json-server:

```json
{ "/api/*": "/$1" }
```

Default json-server CRUD cannot implement `/moves`, `/undo`, `/reset`, or `/mode`; this repo uses Express instead.

---

## Related

- [gap-analysis.md](./gap-analysis.md) — task.pdf compliance checklist
