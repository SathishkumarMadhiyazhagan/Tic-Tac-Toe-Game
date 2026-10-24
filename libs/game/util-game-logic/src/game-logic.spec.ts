import { describe, expect, it } from 'vitest';
import { createEmptyBoard } from './board';
import { applyMoveToBoard, rebuildGameFromHistory } from './game-logic';
import { validateMove } from './validation';

describe('game logic', () => {
  it('applies a valid move and switches turns', () => {
    const board = createEmptyBoard();
    const result = applyMoveToBoard(board, 0, 'X', 1, 'm1');
    expect(result.board[0]).toBe('X');
    expect(result.nextPlayer).toBe('O');
    expect(result.status).toBe('InProgress');
  });

  it('rejects a move on an occupied cell', () => {
    const board = createEmptyBoard();
    board[0] = 'X';
    const validation = validateMove({
      board,
      cellIndex: 0,
      player: 'O',
      currentPlayer: 'O',
      status: 'InProgress',
      mode: 'TwoPlayer',
      isComputerMoving: false,
    });
    expect(validation.valid).toBe(false);
  });

  it('rejects a move outside the board', () => {
    const validation = validateMove({
      board: createEmptyBoard(),
      cellIndex: 9,
      player: 'X',
      currentPlayer: 'X',
      status: 'InProgress',
      mode: 'TwoPlayer',
      isComputerMoving: false,
    });
    expect(validation.valid).toBe(false);
  });

  it('allows the computer to move while isComputerMoving is true', () => {
    const validation = validateMove({
      board: createEmptyBoard(),
      cellIndex: 4,
      player: 'O',
      currentPlayer: 'O',
      status: 'InProgress',
      mode: 'Computer',
      isComputerMoving: true,
      actingAsHuman: false,
    });
    expect(validation.valid).toBe(true);
  });

  it('rejects a wrong-player move', () => {
    const validation = validateMove({
      board: createEmptyBoard(),
      cellIndex: 0,
      player: 'O',
      currentPlayer: 'X',
      status: 'InProgress',
      mode: 'TwoPlayer',
      isComputerMoving: false,
    });
    expect(validation.valid).toBe(false);
  });

  it('detects a row win', () => {
    const board = createEmptyBoard();
    board[0] = 'X';
    board[1] = 'X';
    const result = applyMoveToBoard(board, 2, 'X', 3, 'm3');
    expect(result.status).toBe('Won');
    expect(result.winner).toBe('X');
    expect(result.winningCells).toEqual([0, 1, 2]);
  });

  it('detects a column win', () => {
    const board = createEmptyBoard();
    board[0] = 'O';
    board[3] = 'O';
    const result = applyMoveToBoard(board, 6, 'O', 3, 'm3');
    expect(result.status).toBe('Won');
    expect(result.winner).toBe('O');
  });

  it('detects a diagonal win', () => {
    const board = createEmptyBoard();
    board[0] = 'X';
    board[4] = 'X';
    const result = applyMoveToBoard(board, 8, 'X', 3, 'm3');
    expect(result.status).toBe('Won');
    expect(result.winner).toBe('X');
  });

  it('detects a draw', () => {
    const board = createEmptyBoard();
    const sequence: Array<{ index: number; player: 'X' | 'O' }> = [
      { index: 0, player: 'X' },
      { index: 1, player: 'O' },
      { index: 2, player: 'X' },
      { index: 4, player: 'O' },
      { index: 3, player: 'X' },
      { index: 5, player: 'O' },
      { index: 7, player: 'X' },
      { index: 6, player: 'O' },
      { index: 8, player: 'X' },
    ];
    let moveNumber = 1;
    let last = applyMoveToBoard(board, 0, 'X', 1, 'm1');
    for (const step of sequence.slice(1)) {
      last = applyMoveToBoard(last.board, step.index, step.player, moveNumber, `m${moveNumber}`);
      moveNumber += 1;
    }
    expect(last.status).toBe('Draw');
  });

  it('rejects a move after completion', () => {
    const board = createEmptyBoard();
    board[0] = 'X';
    board[1] = 'X';
    board[2] = 'X';
    const validation = validateMove({
      board,
      cellIndex: 3,
      player: 'O',
      currentPlayer: 'O',
      status: 'Won',
      mode: 'TwoPlayer',
      isComputerMoving: false,
    });
    expect(validation.valid).toBe(false);
  });

  it('rebuilds state from history after undo', () => {
    const first = applyMoveToBoard(createEmptyBoard(), 0, 'X', 1, 'm1');
    applyMoveToBoard(first.board, 4, 'O', 2, 'm2');
    const rebuilt = rebuildGameFromHistory([first.move]);
    expect(rebuilt.board[4]).toBeNull();
    expect(rebuilt.currentPlayer).toBe('O');
  });
});
