import { cellIndexToPosition, type GameMode } from '@tic-tac-toe/game-util-game-logic';
import type { ThunkAction, UnknownAction } from 'redux-thunk';
import {
  updateGameMode,
  createGame,
  resetGame as resetGameApi,
  resetScoreboardApi,
  submitMove,
  undoMove,
} from './api';
import type { NormalizedGameState } from './normalize-game-state';
import { gameActions } from './game.actions';
import { scoreboardActions } from './scoreboard.actions';
import type { RootState } from './types';

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>;

function hydrateFromDto(dispatch: (action: UnknownAction) => void, dto: NormalizedGameState): void {
  dispatch(
    gameActions.hydrateFromApi({
      gameId: dto.gameId,
      board: dto.board,
      currentPlayer: dto.currentPlayer,
      mode: dto.mode,
      status: dto.status,
      winner: dto.winner,
      winningCells: dto.winningCells,
      moveHistory: dto.moveHistory,
      isResultRecorded: dto.isResultRecorded,
    })
  );
  dispatch(
    scoreboardActions.applyScores({
      xWins: dto.scoreboard.xWins,
      oWins: dto.scoreboard.oWins,
      draws: dto.scoreboard.draws,
    })
  );
}

export const initializeApp = (): AppThunk => async (dispatch) => {
  dispatch(gameActions.initStart());
  dispatch(scoreboardActions.loadStart());
  try {
    const state = await createGame('TwoPlayer');
    hydrateFromDto(dispatch, state);
    dispatch(
      scoreboardActions.loadSuccess({
        xWins: state.scoreboard.xWins,
        oWins: state.scoreboard.oWins,
        draws: state.scoreboard.draws,
      })
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to initialize the application.';
    dispatch(gameActions.initFailure(message));
    dispatch(scoreboardActions.loadFailure(message));
  }
};

export const changeGameMode = (mode: GameMode): AppThunk => async (dispatch, getState) => {
  const { gameId } = getState().game;
  if (!gameId) {
    return;
  }
  dispatch(gameActions.clearError());
  try {
    const state = await updateGameMode(gameId, mode);
    hydrateFromDto(dispatch, state);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to change the game mode.';
    dispatch(gameActions.setError(message));
  }
};

export const playMove = (cellIndex: number): AppThunk => async (dispatch, getState) => {
  const { gameId } = getState().game;
  if (!gameId) {
    return;
  }
  dispatch(gameActions.clearError());
  const { row, column } = cellIndexToPosition(cellIndex);
  try {
    const state = await submitMove(gameId, { row, column });
    hydrateFromDto(dispatch, state);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit the move.';
    dispatch(gameActions.setError(message));
  }
};

export const undoLastMove = (): AppThunk => async (dispatch, getState) => {
  const { gameId } = getState().game;
  if (!gameId) {
    return;
  }
  dispatch(gameActions.clearError());
  try {
    const state = await undoMove(gameId);
    hydrateFromDto(dispatch, state);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to undo the move.';
    dispatch(gameActions.setError(message));
  }
};

export const resetCurrentGame = (): AppThunk => async (dispatch, getState) => {
  const { gameId, mode } = getState().game;
  if (!gameId) {
    return;
  }
  dispatch(gameActions.clearError());
  try {
    const state = await resetGameApi(gameId, mode);
    hydrateFromDto(dispatch, state);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reset the game.';
    dispatch(gameActions.setError(message));
  }
};

export const resetScoreboard = (): AppThunk => async (dispatch) => {
  dispatch(scoreboardActions.resetStart());
  dispatch(gameActions.clearError());
  try {
    const scores = await resetScoreboardApi();
    dispatch(
      scoreboardActions.applyScores({
        xWins: scores.xWins,
        oWins: scores.oWins,
        draws: scores.draws,
      })
    );
    dispatch(scoreboardActions.resetSuccess());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to reset the scoreboard.';
    dispatch(scoreboardActions.resetFailure(message));
  }
};
