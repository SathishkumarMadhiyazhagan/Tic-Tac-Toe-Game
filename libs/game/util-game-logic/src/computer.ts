import { CENTER_CELL, CORNER_CELLS, WINNING_LINES } from './constants';
import type { Board, Player } from './types';
import { checkWinner, isBoardFull } from './win';

function findWinningCell(board: Board, player: Player): number | null {
  for (const line of WINNING_LINES) {
    const cells = line.map((index) => board[index]);
    const playerCells = cells.filter((cell) => cell === player).length;
    const emptyCells = line.filter((index) => board[index] === null);
    if (playerCells === 2 && emptyCells.length === 1) {
      return emptyCells[0];
    }
  }
  return null;
}

function firstAvailable(board: Board, candidates: readonly number[]): number | null {
  for (const index of candidates) {
    if (board[index] === null) {
      return index;
    }
  }
  return null;
}

/**
 * Computer (O) move priority:
 * 1. Win if possible
 * 2. Block X from winning
 * 3. Take center
 * 4. Take first available corner
 * 5. First remaining empty cell (left-to-right, top-to-bottom)
 */
export function selectComputerMove(board: Board): number | null {
  const { winner } = checkWinner(board);
  if (winner !== null || isBoardFull(board)) {
    return null;
  }

  const winMove = findWinningCell(board, 'O');
  if (winMove !== null) {
    return winMove;
  }

  const blockMove = findWinningCell(board, 'X');
  if (blockMove !== null) {
    return blockMove;
  }

  if (board[CENTER_CELL] === null) {
    return CENTER_CELL;
  }

  const cornerMove = firstAvailable(board, CORNER_CELLS);
  if (cornerMove !== null) {
    return cornerMove;
  }

  for (let i = 0; i < board.length; i += 1) {
    if (board[i] === null) {
      return i;
    }
  }

  return null;
}
