import { createEmptyBoard } from '@tic-tac-toe/game-util-game-logic';
import { GAME_ACTION_TYPES, type GameAction } from './game.actions';
import type { GameState } from './types';

export const initialGameState: GameState = {
  gameId: '',
  board: createEmptyBoard(),
  currentPlayer: 'X',
  mode: 'TwoPlayer',
  status: 'InProgress',
  winner: null,
  winningCells: [],
  moveHistory: [],
  isComputerMoving: false,
  isResultRecorded: false,
  loading: false,
  error: null,
};

export function gameReducer(state = initialGameState, action: GameAction): GameState {
  switch (action.type) {
    case GAME_ACTION_TYPES.INIT_START:
      return { ...state, loading: true, error: null };
    case GAME_ACTION_TYPES.INIT_FAILURE:
      return { ...state, loading: false, error: action.payload.error };
    case GAME_ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload.error };
    case GAME_ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };
    case GAME_ACTION_TYPES.HYDRATE_FROM_API:
      return {
        ...state,
        gameId: action.payload.gameId,
        board: action.payload.board,
        currentPlayer: action.payload.currentPlayer,
        mode: action.payload.mode,
        status: action.payload.status,
        winner: action.payload.winner,
        winningCells: action.payload.winningCells,
        moveHistory: action.payload.moveHistory,
        isResultRecorded: action.payload.isResultRecorded,
        isComputerMoving: false,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}
