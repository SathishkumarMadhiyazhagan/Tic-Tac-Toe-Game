import { describe, expect, it } from 'vitest';
import { createEmptyBoard } from './board';
import { selectComputerMove } from './computer';
import { applyMoveToBoard } from './game-logic';

describe('computer move selection', () => {
  it('selects a winning move for O', () => {
    const board = createEmptyBoard();
    board[3] = 'O';
    board[4] = 'O';
    expect(selectComputerMove(board)).toBe(5);
  });

  it('blocks an imminent X win', () => {
    const board = createEmptyBoard();
    board[0] = 'X';
    board[1] = 'X';
    expect(selectComputerMove(board)).toBe(2);
  });

  it('selects the centre when available', () => {
    expect(selectComputerMove(createEmptyBoard())).toBe(4);
  });

  it('selects a corner when centre is taken', () => {
    const board = createEmptyBoard();
    board[4] = 'X';
    expect(selectComputerMove(board)).toBe(0);
  });

  it('selects another available cell', () => {
    const board = createEmptyBoard();
    board[0] = 'X';
    board[1] = 'O';
    board[3] = 'X';
    board[4] = 'O';
    const move = selectComputerMove(board);
    expect([2, 5, 6, 7, 8]).toContain(move);
  });

  it('does not move after the game is complete', () => {
    const board = createEmptyBoard();
    board[0] = 'X';
    board[1] = 'X';
    board[2] = 'X';
    expect(selectComputerMove(board)).toBeNull();
  });
});

describe('reset game state', () => {
  it('starts a fresh in-progress board after moves', () => {
    const result = applyMoveToBoard(createEmptyBoard(), 0, 'X', 1, 'm1');
    expect(result.status).toBe('InProgress');
    expect(result.board.filter((cell) => cell !== null).length).toBe(1);
  });
});
