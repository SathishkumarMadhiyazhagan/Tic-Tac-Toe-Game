import { SCOREBOARD_ACTION_TYPES, type ScoreboardAction } from './scoreboard.actions';
import type { ScoreboardState } from './types';

export const initialScoreboardState: ScoreboardState = {
  xWins: 0,
  oWins: 0,
  draws: 0,
  loading: false,
  error: null,
};

export function scoreboardReducer(
  state = initialScoreboardState,
  action: ScoreboardAction
): ScoreboardState {
  switch (action.type) {
    case SCOREBOARD_ACTION_TYPES.LOAD_START:
    case SCOREBOARD_ACTION_TYPES.RESET_START:
      return { ...state, loading: true, error: null };
    case SCOREBOARD_ACTION_TYPES.LOAD_SUCCESS:
    case SCOREBOARD_ACTION_TYPES.APPLY_SCORES:
      return {
        ...state,
        xWins: action.payload.xWins,
        oWins: action.payload.oWins,
        draws: action.payload.draws,
        loading: false,
        error: null,
      };
    case SCOREBOARD_ACTION_TYPES.LOAD_FAILURE:
    case SCOREBOARD_ACTION_TYPES.RESET_FAILURE:
      return { ...state, loading: false, error: action.payload.error };
    case SCOREBOARD_ACTION_TYPES.RESET_SUCCESS:
      return {
        ...state,
        xWins: 0,
        oWins: 0,
        draws: 0,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}
