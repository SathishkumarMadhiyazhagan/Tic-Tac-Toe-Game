import type { GameMode, GameStatus, Player } from '../../util-game-logic/src/index';

export interface ScoreboardDto {
  xWins: number;
  oWins: number;
  draws: number;
}

/** Empty cells are `""` (not JSON `null`), per task API contract. */
export type ApiBoardCell = Player | '';

export interface BoardPosition {
  row: number;
  column: number;
}

export interface MoveHistoryEntryDto {
  id: string;
  moveNumber: number;
  player: Player;
  row: number;
  column: number;
  cellIndex: number;
  position: string;
}

export interface GameStateDto {
  gameId: string;
  board: ApiBoardCell[];
  currentPlayer: Player;
  mode: GameMode;
  status: GameStatus;
  winner: Player | null;
  winningCells: BoardPosition[];
  moveHistory: MoveHistoryEntryDto[];
  isResultRecorded: boolean;
  scoreboard: ScoreboardDto;
}

export interface MoveRequestDto {
  row: number;
  column: number;
}

export interface CreateGameRequestDto {
  mode?: GameMode;
}

export interface ResetGameRequestDto {
  mode?: GameMode;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
