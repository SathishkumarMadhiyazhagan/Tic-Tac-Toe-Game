import {
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

export interface ScoreboardPanelProps {
  xWins: number;
  oWins: number;
  draws: number;
  loading: boolean;
}

export function ScoreboardPanel({ xWins, oWins, draws, loading }: ScoreboardPanelProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Scoreboard
        </Typography>
        {loading ? (
          <CircularProgress size={24} aria-label="Loading scoreboard" />
        ) : (
          <Table size="small" aria-label="Session scoreboard">
            <TableHead>
              <TableRow>
                <TableCell>X wins</TableCell>
                <TableCell>O wins</TableCell>
                <TableCell>Draws</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{xWins}</TableCell>
                <TableCell>{oWins}</TableCell>
                <TableCell>{draws}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
