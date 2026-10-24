import { Button, Typography } from '@mui/material';
import type { Player } from '@tic-tac-toe/game-util-game-logic';

export interface BoardCellProps {
  cellIndex: number;
  value: Player | null;
  disabled: boolean;
  isWinning: boolean;
  onSelect: (cellIndex: number) => void;
}

export function BoardCell({
  cellIndex,
  value,
  disabled,
  isWinning,
  onSelect,
}: BoardCellProps) {
  const row = Math.floor(cellIndex / 3) + 1;
  const column = (cellIndex % 3) + 1;
  const label = value ? `Cell row ${row} column ${column}, ${value}` : `Empty cell row ${row} column ${column}`;

  return (
    <Button
      variant="outlined"
      onClick={() => onSelect(cellIndex)}
      disabled={disabled}
      aria-label={label}
      sx={{
        width: 96,
        height: 96,
        minWidth: 72,
        borderWidth: 2,
        borderColor: isWinning ? 'success.main' : 'divider',
        bgcolor: isWinning ? 'success.light' : 'background.paper',
        '&:hover': {
          bgcolor: isWinning ? 'success.light' : 'action.hover',
        },
      }}
    >
      <Typography
        variant="h4"
        component="span"
        color={value === 'X' ? 'primary.main' : value === 'O' ? 'secondary.main' : 'text.disabled'}
        fontWeight={700}
        aria-hidden={!value}
      >
        {value ?? ''}
      </Typography>
    </Button>
  );
}
