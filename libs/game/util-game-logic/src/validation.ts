import { CELL_COUNT } from './constants';
import type {
  Board,
  GameMode,
  GameStatus,
  MoveValidationResult,
  Player,
} from './types';

export interface ValidateMoveParams {
  board: Board;
  cellIndex: number;
  player: Player;
  currentPlayer: Player;
  status: GameStatus;
  mode: GameMode;
  isComputerMoving: boolean;
  actingAsHuman?: boolean;
}

export function validateMove(params: ValidateMoveParams): MoveValidationResult {
  const {
    board,
    cellIndex,
    player,
    currentPlayer,
    status,
    mode,
    isComputerMoving,
    actingAsHuman = true,
  } = params;

  if (cellIndex < 0 || cellIndex >= CELL_COUNT) {
    return { valid: false, message: 'That cell is outside the board.' };
  }

  if (status !== 'InProgress') {
    return { valid: false, message: 'The game is already finished.' };
  }

  if (isComputerMoving && actingAsHuman) {
    return { valid: false, message: 'Please wait for the computer to move.' };
  }

  if (mode === 'Computer' && actingAsHuman && player !== 'X') {
    return { valid: false, message: 'You can only play as X in computer mode.' };
  }

  if (player !== currentPlayer) {
    return { valid: false, message: `It is ${currentPlayer}'s turn.` };
  }

  if (board[cellIndex] !== null) {
    return { valid: false, message: 'That cell is already occupied.' };
  }

  return { valid: true };
}
