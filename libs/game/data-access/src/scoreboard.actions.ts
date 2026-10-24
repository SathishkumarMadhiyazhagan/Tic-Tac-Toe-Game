export const SCOREBOARD_ACTION_TYPES = {
  LOAD_START: 'scoreboard/LOAD_START',
  LOAD_SUCCESS: 'scoreboard/LOAD_SUCCESS',
  LOAD_FAILURE: 'scoreboard/LOAD_FAILURE',
  APPLY_SCORES: 'scoreboard/APPLY_SCORES',
  RESET_START: 'scoreboard/RESET_START',
  RESET_SUCCESS: 'scoreboard/RESET_SUCCESS',
  RESET_FAILURE: 'scoreboard/RESET_FAILURE',
} as const;

export const scoreboardActions = {
  loadStart: () => ({ type: SCOREBOARD_ACTION_TYPES.LOAD_START }),
  loadSuccess: (scores: { xWins: number; oWins: number; draws: number }) => ({
    type: SCOREBOARD_ACTION_TYPES.LOAD_SUCCESS,
    payload: scores,
  }),
  loadFailure: (error: string) => ({
    type: SCOREBOARD_ACTION_TYPES.LOAD_FAILURE,
    payload: { error },
  }),
  applyScores: (scores: { xWins: number; oWins: number; draws: number }) => ({
    type: SCOREBOARD_ACTION_TYPES.APPLY_SCORES,
    payload: scores,
  }),
  resetStart: () => ({ type: SCOREBOARD_ACTION_TYPES.RESET_START }),
  resetSuccess: () => ({ type: SCOREBOARD_ACTION_TYPES.RESET_SUCCESS }),
  resetFailure: (error: string) => ({
    type: SCOREBOARD_ACTION_TYPES.RESET_FAILURE,
    payload: { error },
  }),
};

export type ScoreboardAction = ReturnType<
  (typeof scoreboardActions)[keyof typeof scoreboardActions]
>;
