import { cellIndexToPosition } from '../../util-game-logic/src/index';
import type { Board, Move, Player } from '../../util-game-logic/src/index';
import type { BoardPosition, GameStateDto, MoveHistoryEntryDto, ScoreboardDto } from './types';

export function formatBoardPosition(row: number, column: number): string {
  return `Row ${row}, Column ${column}`;
}

export function serializeBoard(board: Board): GameStateDto['board'] {
  return board.map((cell) => (cell === null ? '' : cell));
}

export function serializeWinningCells(cellIndexes: number[]): BoardPosition[] {
  return cellIndexes.map((index) => cellIndexToPosition(index));
}

export function serializeMoveHistory(moves: Move[]): MoveHistoryEntryDto[] {
  return moves.map((move) => ({
    id: move.id,
    moveNumber: move.moveNumber,
    player: move.player,
    row: move.row,
    column: move.column,
    cellIndex: move.cellIndex,
    position: formatBoardPosition(move.row, move.column),
  }));
}

export interface InternalGameSnapshot {
  id: string;
  mode: GameStateDto['mode'];
  board: Board;
  currentPlayer: Player;
  status: GameStateDto['status'];
  winner: Player | null;
  winningCells: number[];
  moveHistory: Move[];
  isResultRecorded: boolean;
}

export function toGameStateDto(
  game: InternalGameSnapshot,
  scoreboard: ScoreboardDto
): GameStateDto {
  return {
    gameId: game.id,
    board: serializeBoard(game.board),
    currentPlayer: game.currentPlayer,
    mode: game.mode,
    status: game.status,
    winner: game.winner,
    winningCells: serializeWinningCells(game.winningCells),
    moveHistory: serializeMoveHistory(game.moveHistory),
    isResultRecorded: game.isResultRecorded,
    scoreboard: { ...scoreboard },
  };
}
