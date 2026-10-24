import type { GameMode } from '@tic-tac-toe/game-util-game-logic';
import type { GameStateDto, MoveRequestDto, ScoreboardDto } from './api.types';
import { normalizeGameState, type NormalizedGameState } from './normalize-game-state';

const API_BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.DEV
    ? '/api'
    : 'http://localhost:3000/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

async function requestGameState(url: string, options?: RequestInit): Promise<NormalizedGameState> {
  const dto = await request<GameStateDto>(url, options);
  return normalizeGameState(dto);
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'Cannot reach the API. From the tic-tac-toe folder run `npm run api` or `npm run dev`.'
      );
    }
    throw error;
  }
}

export async function createGame(mode: GameMode = 'TwoPlayer'): Promise<NormalizedGameState> {
  return requestGameState(`${API_BASE}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
}

export async function fetchAllGames(): Promise<NormalizedGameState[]> {
  const list = await request<GameStateDto[]>(`${API_BASE}/games`);
  return list.map((dto) => normalizeGameState(dto));
}

export async function fetchGame(gameId: string): Promise<NormalizedGameState> {
  return requestGameState(`${API_BASE}/games/${gameId}`);
}

export async function submitMove(
  gameId: string,
  move: MoveRequestDto
): Promise<NormalizedGameState> {
  return requestGameState(`${API_BASE}/games/${gameId}/moves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(move),
  });
}

export async function undoMove(gameId: string): Promise<NormalizedGameState> {
  return requestGameState(`${API_BASE}/games/${gameId}/undo`, {
    method: 'POST',
  });
}

export async function resetGame(
  gameId: string,
  mode?: GameMode
): Promise<NormalizedGameState> {
  return requestGameState(`${API_BASE}/games/${gameId}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mode ? { mode } : {}),
  });
}

export async function updateGameMode(
  gameId: string,
  mode: GameMode
): Promise<NormalizedGameState> {
  return requestGameState(`${API_BASE}/games/${gameId}/mode`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
}

export async function fetchScoreboard(): Promise<ScoreboardDto> {
  return request<ScoreboardDto>(`${API_BASE}/scoreboard`);
}

export async function resetScoreboardApi(): Promise<ScoreboardDto> {
  return request<ScoreboardDto>(`${API_BASE}/scoreboard/reset`, {
    method: 'POST',
  });
}
