export const BOARD_SIZE = 3;
export const CELL_COUNT = 9;

export const WINNING_LINES: readonly number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const CENTER_CELL = 4;
export const CORNER_CELLS = [0, 2, 6, 8] as const;
