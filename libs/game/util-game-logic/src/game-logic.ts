import { cloneBoard, cellIndexToPosition } from './board';
import { checkWinner, isDraw } from './win';
import type { Board, GameStatus, Move, Player } from './types';

export interface ApplyMoveResult {
  board: Board;
  move: Move;
  status: GameStatus;
  winner: Player | null;
  winningCells: number[];
  nextPlayer: Player;
}

export function applyMoveToBoard(
  board: Board,
  cellIndex: number,
  player: Player,
  moveNumber: number,
  moveId: string
): ApplyMoveResult {
  const nextBoard = cloneBoard(board);
  nextBoard[cellIndex] = player;
  const { row, column } = cellIndexToPosition(cellIndex);
  const move: Move = {
    id: moveId,
    moveNumber,
    player,
    row,
    column,
    cellIndex,
  };

  const { winner, winningCells } = checkWinner(nextBoard);
  if (winner) {
    return {
      board: nextBoard,
      move,
      status: 'Won',
      winner,
      winningCells,
      nextPlayer: player,
    };
  }

  if (isDraw(nextBoard)) {
    return {
      board: nextBoard,
      move,
      status: 'Draw',
      winner: null,
      winningCells: [],
      nextPlayer: player,
    };
  }

  return {
    board: nextBoard,
    move,
    status: 'InProgress',
    winner: null,
    winningCells: [],
    nextPlayer: player === 'X' ? 'O' : 'X',
  };
}

export function rebuildGameFromHistory(moves: Move[]): {
  board: Board;
  status: GameStatus;
  winner: Player | null;
  winningCells: number[];
  currentPlayer: Player;
} {
  let board = cloneBoard(Array(9).fill(null));
  let status: GameStatus = 'InProgress';
  let winner: Player | null = null;
  let winningCells: number[] = [];
  let currentPlayer: Player = 'X';

  for (const move of moves) {
    const result = applyMoveToBoard(
      board,
      move.cellIndex,
      move.player,
      move.moveNumber,
      move.id
    );
    board = result.board;
    status = result.status;
    winner = result.winner;
    winningCells = result.winningCells;
    currentPlayer = result.nextPlayer;
  }

  return { board, status, winner, winningCells, currentPlayer };
}
