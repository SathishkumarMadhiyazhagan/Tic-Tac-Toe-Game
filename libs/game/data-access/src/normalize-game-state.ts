import {
  positionToCellIndex,
  type Board,
  type Move,
} from '@tic-tac-toe/game-util-game-logic';
import type { GameStateDto, MoveHistoryEntryDto } from './api.types';

function parseBoard(board: GameStateDto['board']): Board {
  return board.map((cell) => (cell === '' || cell === null ? null : cell));
}

function parseWinningCells(
  winningCells: GameStateDto['winningCells']
): number[] {
  if (winningCells.length === 0) {
    return [];
  }
  const first = winningCells[0];
  if (typeof first === 'number') {
    return winningCells as number[];
  }
  return winningCells.map((cell) => positionToCellIndex(cell.row, cell.column));
}

function parseMoveHistory(moves: MoveHistoryEntryDto[]): Move[] {
  return moves.map((move) => ({
    id: move.id,
    moveNumber: move.moveNumber,
    player: move.player,
    row: move.row,
    column: move.column,
    cellIndex: move.cellIndex,
  }));
}

export interface NormalizedGameState {
  gameId: string;
  board: Board;
  currentPlayer: GameStateDto['currentPlayer'];
  mode: GameStateDto['mode'];
  status: GameStateDto['status'];
  winner: GameStateDto['winner'];
  winningCells: number[];
  moveHistory: Move[];
  isResultRecorded: boolean;
  scoreboard: GameStateDto['scoreboard'];
}

export function normalizeGameState(dto: GameStateDto): NormalizedGameState {
  return {
    gameId: dto.gameId,
    board: parseBoard(dto.board),
    currentPlayer: dto.currentPlayer,
    mode: dto.mode,
    status: dto.status,
    winner: dto.winner,
    winningCells: parseWinningCells(dto.winningCells),
    moveHistory: parseMoveHistory(dto.moveHistory),
    isResultRecorded: dto.isResultRecorded,
    scoreboard: dto.scoreboard,
  };
}
