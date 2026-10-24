import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { GameMode } from '@tic-tac-toe/game-util-game-logic';
import {
  changeGameMode,
  playMove,
  resetCurrentGame,
  resetScoreboard,
  selectGame,
  selectScoreboard,
  undoLastMove,
  type AppDispatch,
} from '@tic-tac-toe/game-data-access';
import { GameBoard } from '@tic-tac-toe/game-ui-board';
import { ScoreboardPanel } from '@tic-tac-toe/scoreboard-feature';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function statusMessage(game: ReturnType<typeof selectGame>): string {
  if (game.status === 'Won' && game.winner) {
    return `Player ${game.winner} wins!`;
  }
  if (game.status === 'Draw') {
    return 'Game ended in a draw.';
  }
  if (game.isComputerMoving) {
    return 'Computer is thinking…';
  }
  return `Current player: ${game.currentPlayer}`;
}

export function GamePage() {
  const dispatch = useDispatch<AppDispatch>();
  const game = useSelector(selectGame);
  const scoreboard = useSelector(selectScoreboard);

  const boardDisabled =
    game.loading ||
    game.isComputerMoving ||
    game.status !== 'InProgress' ||
    (game.mode === 'Computer' && game.currentPlayer === 'O');

  const undoDisabled =
    game.moveHistory.length === 0 ||
    game.isComputerMoving ||
    game.status !== 'InProgress';

  const message = useMemo(() => statusMessage(game), [game]);

  const handleModeChange = useCallback(
    (mode: GameMode) => {
      dispatch(changeGameMode(mode));
    },
    [dispatch]
  );

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tic Tac Toe
      </Typography>

      {(game.loading || scoreboard.loading) && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Loading…</Typography>
        </Stack>
      )}

      {(game.error || scoreboard.error) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {game.error ?? scoreboard.error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box sx={{ flex: 1 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="game-mode-label">Game mode</InputLabel>
            <Select
              labelId="game-mode-label"
              label="Game mode"
              value={game.mode}
              onChange={(event) => handleModeChange(event.target.value as GameMode)}
            >
              <MenuItem value="TwoPlayer">Two Player</MenuItem>
              <MenuItem value="Computer">Play Against Computer</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Mode: {game.mode === 'Computer' ? 'Play against computer' : 'Two player'}
          </Typography>

          <Typography variant="h6" aria-live="polite" sx={{ mb: 2 }}>
            {message}
          </Typography>

          <GameBoard
            board={game.board}
            winningCells={game.winningCells}
            disabled={boardDisabled}
            onCellSelect={(cellIndex) => dispatch(playMove(cellIndex))}
          />

          <Stack direction="row" spacing={1} sx={{ mt: 3 }} flexWrap="wrap" useFlexGap>
            <Button variant="contained" onClick={() => dispatch(undoLastMove())} disabled={undoDisabled}>
              Undo Last Move
            </Button>
            <Button variant="outlined" onClick={() => dispatch(resetCurrentGame())}>
              Reset Game
            </Button>
            <Button variant="outlined" color="warning" onClick={() => dispatch(resetScoreboard())}>
              Reset Scoreboard
            </Button>
          </Stack>
        </Box>

        <Stack spacing={2} sx={{ minWidth: 280 }}>
          <ScoreboardPanel
            xWins={scoreboard.xWins}
            oWins={scoreboard.oWins}
            draws={scoreboard.draws}
            loading={scoreboard.loading}
          />

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Move history
              </Typography>
              {game.moveHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No moves yet.
                </Typography>
              ) : (
                <Table size="small" aria-label="Move history">
                  <TableHead>
                    <TableRow>
                      <TableCell>Move</TableCell>
                      <TableCell>Player</TableCell>
                      <TableCell>Position</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {game.moveHistory.map((move) => (
                      <TableRow key={move.id}>
                        <TableCell>{move.moveNumber}</TableCell>
                        <TableCell>{move.player}</TableCell>
                        <TableCell>
                          Row {move.row}, Column {move.column}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Box>
  );
}
