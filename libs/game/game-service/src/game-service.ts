import {
  applyMoveToBoard,
  createEmptyBoard,
  positionToCellIndex,
  rebuildGameFromHistory,
  selectComputerMove,
  validateMove,
  type GameMode,
  type Move,
  type Player,
} from '../../util-game-logic/src/index';
import type {
  CreateGameRequestDto,
  GameStateDto,
  MoveRequestDto,
  ResetGameRequestDto,
  ScoreboardDto,
} from './types';
import { toGameStateDto } from './serialize';
import { ApiError } from './types';

interface StoredGame {
  id: string;
  mode: GameMode;
  board: ReturnType<typeof createEmptyBoard>;
  currentPlayer: Player;
  status: GameStateDto['status'];
  winner: Player | null;
  winningCells: number[];
  moveHistory: Move[];
  isResultRecorded: boolean;
}

function createMoveId(): string {
  return `move-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class GameService {
  private games = new Map<string, StoredGame>();
  private scoreboard: ScoreboardDto = { xWins: 0, oWins: 0, draws: 0 };
  private nextId = 1;

  getScoreboard(): ScoreboardDto {
    return { ...this.scoreboard };
  }

  resetScoreboard(): ScoreboardDto {
    this.scoreboard = { xWins: 0, oWins: 0, draws: 0 };
    return this.getScoreboard();
  }

  createGame(request: CreateGameRequestDto = {}): GameStateDto {
    const id = String(this.nextId++);
    const mode = request.mode ?? 'TwoPlayer';
    const game: StoredGame = {
      id,
      mode,
      board: createEmptyBoard(),
      currentPlayer: 'X',
      status: 'InProgress',
      winner: null,
      winningCells: [],
      moveHistory: [],
      isResultRecorded: false,
    };
    this.games.set(id, game);
    return toGameStateDto(game, this.scoreboard);
  }

  listGames(): GameStateDto[] {
    return Array.from(this.games.values())
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((game) => toGameStateDto(game, this.scoreboard));
  }

  getGame(gameId: string): GameStateDto {
    const game = this.games.get(gameId);
    if (!game) {
      throw new ApiError('Game not found.', 404);
    }
    return toGameStateDto(game, this.scoreboard);
  }

  private recordResultIfNeeded(game: StoredGame): void {
    if (game.status === 'InProgress' || game.isResultRecorded) {
      return;
    }
    if (game.status === 'Won' && game.winner === 'X') {
      this.scoreboard.xWins += 1;
    } else if (game.status === 'Won' && game.winner === 'O') {
      this.scoreboard.oWins += 1;
    } else if (game.status === 'Draw') {
      this.scoreboard.draws += 1;
    }
    game.isResultRecorded = true;
  }

  private applyMoveToGame(game: StoredGame, cellIndex: number, player: Player): void {
    const result = applyMoveToBoard(
      game.board,
      cellIndex,
      player,
      game.moveHistory.length + 1,
      createMoveId()
    );
    game.board = result.board;
    game.currentPlayer = result.nextPlayer;
    game.status = result.status;
    game.winner = result.winner;
    game.winningCells = result.winningCells;
    game.moveHistory.push(result.move);
    this.recordResultIfNeeded(game);
  }

  private applyValidatedMove(
    game: StoredGame,
    cellIndex: number,
    player: Player,
    actingAsHuman: boolean
  ): void {
    const validation = validateMove({
      board: game.board,
      cellIndex,
      player,
      currentPlayer: game.currentPlayer,
      status: game.status,
      mode: game.mode,
      isComputerMoving: false,
      actingAsHuman,
    });
    if (!validation.valid) {
      throw new ApiError(validation.message ?? 'Invalid move.');
    }
    this.applyMoveToGame(game, cellIndex, player);
  }

  private playComputerTurnIfNeeded(game: StoredGame): void {
    if (
      game.mode !== 'Computer' ||
      game.status !== 'InProgress' ||
      game.currentPlayer !== 'O'
    ) {
      return;
    }
    const cellIndex = selectComputerMove(game.board);
    if (cellIndex === null) {
      return;
    }
    this.applyMoveToGame(game, cellIndex, 'O');
  }

  submitMove(gameId: string, request: MoveRequestDto): GameStateDto {
    const game = this.games.get(gameId);
    if (!game) {
      throw new ApiError('Game not found.', 404);
    }

    const cellIndex = positionToCellIndex(request.row, request.column);
    if (cellIndex < 0) {
      throw new ApiError('That cell is outside the board.');
    }

    const humanPlayer = game.currentPlayer;
    if (game.mode === 'Computer' && humanPlayer !== 'X') {
      throw new ApiError('You can only play as X in computer mode.');
    }

    this.applyValidatedMove(game, cellIndex, humanPlayer, true);
    this.playComputerTurnIfNeeded(game);

    return toGameStateDto(game, this.scoreboard);
  }

  undo(gameId: string): GameStateDto {
    const game = this.games.get(gameId);
    if (!game) {
      throw new ApiError('Game not found.', 404);
    }
    if (game.status !== 'InProgress') {
      throw new ApiError('Undo is disabled after the game is completed.');
    }
    if (game.moveHistory.length === 0) {
      throw new ApiError('There are no moves to undo.');
    }

    let removedCount = 1;
    if (game.mode === 'Computer') {
      const last = game.moveHistory[game.moveHistory.length - 1];
      if (last.player === 'O') {
        removedCount = 2;
      }
    }
    removedCount = Math.min(removedCount, game.moveHistory.length);
    const nextHistory = game.moveHistory.slice(0, game.moveHistory.length - removedCount);
    const rebuilt = rebuildGameFromHistory(nextHistory);
    game.board = rebuilt.board;
    game.currentPlayer = rebuilt.currentPlayer;
    game.status = rebuilt.status;
    game.winner = rebuilt.winner;
    game.winningCells = rebuilt.winningCells;
    game.moveHistory = nextHistory;
    game.isResultRecorded = false;

    return toGameStateDto(game, this.scoreboard);
  }

  resetGame(gameId: string, request: ResetGameRequestDto = {}): GameStateDto {
    const game = this.games.get(gameId);
    if (!game) {
      throw new ApiError('Game not found.', 404);
    }
    if (request.mode) {
      game.mode = request.mode;
    }
    game.board = createEmptyBoard();
    game.currentPlayer = 'X';
    game.status = 'InProgress';
    game.winner = null;
    game.winningCells = [];
    game.moveHistory = [];
    game.isResultRecorded = false;
    return toGameStateDto(game, this.scoreboard);
  }

  setMode(gameId: string, mode: GameMode): GameStateDto {
    return this.resetGame(gameId, { mode });
  }
}
