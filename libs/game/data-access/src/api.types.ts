import type { GameMode, GameStatus, Player } from '@tic-tac-toe/game-util-game-logic';

export interface ScoreboardDto {
  xWins: number;
  oWins: number;
  draws: number;
}

/** Wire format from the API — empty board cells are `""`. */
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
  winningCells: BoardPosition[] | number[];
  moveHistory: MoveHistoryEntryDto[];
  isResultRecorded: boolean;
  scoreboard: ScoreboardDto;
}

export interface MoveRequestDto {
  row: number;
  column: number;
}
