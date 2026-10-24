import type { Board, GameMode, GameStatus, Move, Player } from '@tic-tac-toe/game-util-game-logic';

export const GAME_ACTION_TYPES = {
  INIT_START: 'game/INIT_START',
  INIT_FAILURE: 'game/INIT_FAILURE',
  SET_ERROR: 'game/SET_ERROR',
  CLEAR_ERROR: 'game/CLEAR_ERROR',
  HYDRATE_FROM_API: 'game/HYDRATE_FROM_API',
} as const;

export interface HydrateFromApiPayload {
  gameId: string;
  board: Board;
  currentPlayer: Player;
  mode: GameMode;
  status: GameStatus;
  winner: Player | null;
  winningCells: number[];
  moveHistory: Move[];
  isResultRecorded: boolean;
}

export const gameActions = {
  initStart: () => ({ type: GAME_ACTION_TYPES.INIT_START }),
  initFailure: (error: string) => ({
    type: GAME_ACTION_TYPES.INIT_FAILURE,
    payload: { error },
  }),
  setError: (error: string) => ({
    type: GAME_ACTION_TYPES.SET_ERROR,
    payload: { error },
  }),
  clearError: () => ({ type: GAME_ACTION_TYPES.CLEAR_ERROR }),
  hydrateFromApi: (payload: HydrateFromApiPayload) => ({
    type: GAME_ACTION_TYPES.HYDRATE_FROM_API,
    payload,
  }),
};

export type GameAction = ReturnType<
  (typeof gameActions)[keyof typeof gameActions]
>;
