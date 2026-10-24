import type { Board, GameMode, GameStatus, Move, Player } from '@tic-tac-toe/game-util-game-logic';

export interface GameState {
  gameId: string;
  board: Board;
  currentPlayer: Player;
  mode: GameMode;
  status: GameStatus;
  winner: Player | null;
  winningCells: number[];
  moveHistory: Move[];
  isComputerMoving: boolean;
  isResultRecorded: boolean;
  loading: boolean;
  error: string | null;
}

export interface ScoreboardState {
  xWins: number;
  oWins: number;
  draws: number;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  game: GameState;
  scoreboard: ScoreboardState;
}
