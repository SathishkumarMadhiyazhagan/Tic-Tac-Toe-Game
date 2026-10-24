import { WINNING_LINES } from './constants';
import type { Board, Player } from './types';

export interface WinResult {
  winner: Player | null;
  winningCells: number[];
}

export function checkWinner(board: Board): WinResult {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const first = board[a];
    if (first !== null && first === board[b] && first === board[c]) {
      return { winner: first, winningCells: [...line] };
    }
  }
  return { winner: null, winningCells: [] };
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

export function isDraw(board: Board): boolean {
  const { winner } = checkWinner(board);
  return winner === null && isBoardFull(board);
}
