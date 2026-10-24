import { BOARD_SIZE, CELL_COUNT } from './constants';
import type { Board, Cell } from './types';

export function createEmptyBoard(): Board {
  return Array<Cell>(CELL_COUNT).fill(null);
}

export function cellIndexToPosition(cellIndex: number): { row: number; column: number } {
  if (cellIndex < 0 || cellIndex >= CELL_COUNT) {
    throw new Error('Cell index is outside the board.');
  }
  return {
    row: Math.floor(cellIndex / BOARD_SIZE) + 1,
    column: (cellIndex % BOARD_SIZE) + 1,
  };
}

export function positionToCellIndex(row: number, column: number): number {
  if (row < 1 || row > BOARD_SIZE || column < 1 || column > BOARD_SIZE) {
    return -1;
  }
  return (row - 1) * BOARD_SIZE + (column - 1);
}

export function isCellEmpty(board: Board, cellIndex: number): boolean {
  return cellIndex >= 0 && cellIndex < CELL_COUNT && board[cellIndex] === null;
}

export function cloneBoard(board: Board): Board {
  return [...board];
}
