import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import { GameService } from '../libs/game/game-service/src/game-service';
import { ApiError } from '../libs/game/game-service/src/types';
import type { GameMode } from '../libs/game/util-game-logic/src/index';
import { renderJsonServerIndex } from './json-server-index';

export function createApp(service = new GameService()): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/', (_req: Request, res: Response) => {
    res.type('html').send(renderJsonServerIndex());
  });

  app.get('/api', (_req: Request, res: Response) => {
    res.type('html').send(renderJsonServerIndex());
  });

  app.post('/api/games', (req: Request, res: Response) => {
    const mode = req.body?.mode as GameMode | undefined;
    res.status(201).json(service.createGame({ mode }));
  });

  app.get('/api/games', (_req: Request, res: Response) => {
    res.json(service.listGames());
  });

  app.get('/api/games/:id', (req: Request, res: Response) => {
    try {
      res.json(service.getGame(req.params.id));
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post('/api/games/:id/moves', (req: Request, res: Response) => {
    try {
      const { row, column } = req.body ?? {};
      res.json(service.submitMove(req.params.id, { row, column }));
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post('/api/games/:id/undo', (req: Request, res: Response) => {
    try {
      res.json(service.undo(req.params.id));
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post('/api/games/:id/reset', (req: Request, res: Response) => {
    try {
      const mode = req.body?.mode as GameMode | undefined;
      res.json(service.resetGame(req.params.id, { mode }));
    } catch (error) {
      sendError(res, error);
    }
  });

  app.patch('/api/games/:id/mode', (req: Request, res: Response) => {
    try {
      const mode = req.body?.mode as GameMode;
      if (mode !== 'TwoPlayer' && mode !== 'Computer') {
        throw new ApiError('Invalid game mode.');
      }
      res.json(service.setMode(req.params.id, mode));
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get('/api/scoreboard', (_req: Request, res: Response) => {
    res.json(service.getScoreboard());
  });

  app.post('/api/scoreboard/reset', (_req: Request, res: Response) => {
    res.json(service.resetScoreboard());
  });

  return app;
}

function sendError(res: Response, error: unknown): void {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }
  res.status(500).json({ message: 'Internal server error.' });
}
