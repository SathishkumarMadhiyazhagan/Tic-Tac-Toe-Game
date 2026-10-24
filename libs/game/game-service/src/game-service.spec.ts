import { describe, expect, it } from 'vitest';
import { GameService } from './game-service';
import { ApiError } from './types';

describe('GameService', () => {
  it('lists all created games', () => {
    const service = new GameService();
    expect(service.listGames()).toHaveLength(0);
    const first = service.createGame();
    const second = service.createGame();
    const games = service.listGames();
    expect(games).toHaveLength(2);
    expect(games.map((g) => g.gameId)).toEqual([first.gameId, second.gameId]);
  });

  it('creates a game with empty-string board cells and accepts a valid move', () => {
    const service = new GameService();
    const created = service.createGame({ mode: 'TwoPlayer' });
    expect(created.board.every((cell) => cell === '')).toBe(true);
    expect(created.winningCells).toEqual([]);
    expect(created.moveHistory).toEqual([]);
    const afterMove = service.submitMove(created.gameId, { row: 1, column: 1 });
    expect(afterMove.board[0]).toBe('X');
    expect(afterMove.currentPlayer).toBe('O');
    expect(afterMove.moveHistory[0]?.position).toBe('Row 1, Column 1');
  });

  it('rejects an invalid occupied-cell move', () => {
    const service = new GameService();
    const created = service.createGame();
    service.submitMove(created.gameId, { row: 1, column: 1 });
    expect(() => service.submitMove(created.gameId, { row: 1, column: 1 })).toThrow(
      ApiError
    );
  });

  it('updates scoreboard once when X wins', () => {
    const service = new GameService();
    const game = service.createGame();
    service.submitMove(game.gameId, { row: 1, column: 1 });
    service.submitMove(game.gameId, { row: 1, column: 2 });
    service.submitMove(game.gameId, { row: 2, column: 1 });
    service.submitMove(game.gameId, { row: 2, column: 2 });
    const won = service.submitMove(game.gameId, { row: 3, column: 1 });
    expect(won.status).toBe('Won');
    expect(won.winningCells).toEqual([
      { row: 1, column: 1 },
      { row: 2, column: 1 },
      { row: 3, column: 1 },
    ]);
    expect(won.scoreboard.xWins).toBe(1);
    expect(() => service.submitMove(game.gameId, { row: 3, column: 3 })).toThrow(ApiError);
  });

  it('plays a computer response in computer mode', () => {
    const service = new GameService();
    const game = service.createGame({ mode: 'Computer' });
    const after = service.submitMove(game.gameId, { row: 1, column: 1 });
    expect(after.board[0]).toBe('X');
    expect(after.board.some((cell) => cell === 'O')).toBe(true);
  });

  it('undoes two moves in computer mode when O has moved', () => {
    const service = new GameService();
    const game = service.createGame({ mode: 'Computer' });
    service.submitMove(game.gameId, { row: 1, column: 1 });
    const undone = service.undo(game.gameId);
    expect(undone.moveHistory).toHaveLength(0);
    expect(undone.currentPlayer).toBe('X');
  });

  it('resets scoreboard independently', () => {
    const service = new GameService();
    const game = service.createGame();
    service.submitMove(game.gameId, { row: 1, column: 1 });
    service.submitMove(game.gameId, { row: 1, column: 2 });
    service.submitMove(game.gameId, { row: 2, column: 1 });
    service.submitMove(game.gameId, { row: 2, column: 2 });
    const won = service.submitMove(game.gameId, { row: 3, column: 1 });
    expect(won.scoreboard.xWins).toBe(1);
    const cleared = service.resetScoreboard();
    expect(cleared).toEqual({ xWins: 0, oWins: 0, draws: 0 });
  });
});
