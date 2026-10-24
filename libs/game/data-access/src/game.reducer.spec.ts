import { describe, expect, it } from 'vitest';
import { createEmptyBoard } from '@tic-tac-toe/game-util-game-logic';
import { gameActions } from './game.actions';
import { gameReducer, initialGameState } from './game.reducer';

describe('game reducer', () => {
  it('sets loading on init start', () => {
    const next = gameReducer(initialGameState, gameActions.initStart());
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('hydrates full state from the API payload', () => {
    const board = createEmptyBoard();
    board[0] = 'X';
    const next = gameReducer(
      { ...initialGameState, loading: true },
      gameActions.hydrateFromApi({
        gameId: '7',
        board,
        currentPlayer: 'O',
        mode: 'Computer',
        status: 'InProgress',
        winner: null,
        winningCells: [],
        moveHistory: [
          {
            id: 'm1',
            moveNumber: 1,
            player: 'X',
            row: 1,
            column: 1,
            cellIndex: 0,
          },
        ],
        isResultRecorded: false,
      })
    );
    expect(next.loading).toBe(false);
    expect(next.gameId).toBe('7');
    expect(next.mode).toBe('Computer');
    expect(next.board[0]).toBe('X');
    expect(next.moveHistory).toHaveLength(1);
    expect(next.isComputerMoving).toBe(false);
  });
});
