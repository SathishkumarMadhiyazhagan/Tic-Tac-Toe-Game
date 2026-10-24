import { Box } from '@mui/material';
import type { Board } from '@tic-tac-toe/game-util-game-logic';
import { BoardCell } from './BoardCell';

export interface GameBoardProps {
  board: Board;
  winningCells: number[];
  disabled: boolean;
  onCellSelect: (cellIndex: number) => void;
}

export function GameBoard({
  board,
  winningCells,
  disabled,
  onCellSelect,
}: GameBoardProps) {
  return (
    <Box
      role="grid"
      aria-label="Tic tac toe board"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
        width: 'fit-content',
      }}
    >
      {board.map((value, index) => (
        <BoardCell
          key={index}
          cellIndex={index}
          value={value}
          disabled={disabled || value !== null}
          isWinning={winningCells.includes(index)}
          onSelect={onCellSelect}
        />
      ))}
    </Box>
  );
}
