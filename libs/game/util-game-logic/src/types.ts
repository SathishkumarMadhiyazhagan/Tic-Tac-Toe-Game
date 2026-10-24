export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];
export type GameMode = 'TwoPlayer' | 'Computer';
export type GameStatus = 'InProgress' | 'Won' | 'Draw';

export interface Move {
  id: string;
  moveNumber: number;
  player: Player;
  row: number;
  column: number;
  cellIndex: number;
}

export interface MoveValidationResult {
  valid: boolean;
  message?: string;
}
