import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { gameReducer } from './game.reducer';
import { scoreboardReducer } from './scoreboard.reducer';
import type { RootState } from './types';

const rootReducer = combineReducers({
  game: gameReducer,
  scoreboard: scoreboardReducer,
});

export const store = createStore(rootReducer, applyMiddleware(thunk));

export type AppDispatch = typeof store.dispatch;

export const selectGame = (state: RootState) => state.game;
export const selectScoreboard = (state: RootState) => state.scoreboard;
