import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.mts';

describe('REST API (task.pdf contract)', () => {
  const app = createApp();

  it('GET / serves json-server-style API index', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('JSON Server');
    expect(res.text).toContain('/api/games');
    expect(res.text).toContain('id="btnCreate"');
  });

  it('POST /api/games creates a session', async () => {
    const res = await request(app).post('/api/games').send({ mode: 'TwoPlayer' });
    expect(res.status).toBe(201);
    expect(res.body.gameId).toBeTruthy();
    expect(res.body.status).toBe('InProgress');
    expect(res.body.scoreboard).toEqual({ xWins: 0, oWins: 0, draws: 0 });
  });

  it('GET /api/games returns all sessions', async () => {
    const before = await request(app).get('/api/games');
    expect(before.status).toBe(200);
    expect(Array.isArray(before.body)).toBe(true);

    const created = await request(app).post('/api/games').send({ mode: 'Computer' });
    const list = await request(app).get('/api/games');
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(before.body.length + 1);
    expect(list.body.some((g: { gameId: string }) => g.gameId === created.body.gameId)).toBe(
      true
    );
  });

  it('GET /api/games/:id returns state', async () => {
    const created = await request(app).post('/api/games').send({});
    const res = await request(app).get(`/api/games/${created.body.gameId}`);
    expect(res.status).toBe(200);
    expect(res.body.gameId).toBe(created.body.gameId);
  });

  it('POST /api/games/:id/moves applies a move', async () => {
    const created = await request(app).post('/api/games').send({});
    const res = await request(app)
      .post(`/api/games/${created.body.gameId}/moves`)
      .send({ row: 1, column: 1 });
    expect(res.status).toBe(200);
    expect(res.body.board[0]).toBe('X');
  });

  it('POST /api/games/:id/undo reverts a move', async () => {
    const created = await request(app).post('/api/games').send({});
    await request(app)
      .post(`/api/games/${created.body.gameId}/moves`)
      .send({ row: 1, column: 1 });
    const res = await request(app).post(`/api/games/${created.body.gameId}/undo`).send();
    expect(res.status).toBe(200);
    expect(res.body.moveHistory).toHaveLength(0);
  });

  it('POST /api/games/:id/reset clears the board', async () => {
    const created = await request(app).post('/api/games').send({});
    await request(app)
      .post(`/api/games/${created.body.gameId}/moves`)
      .send({ row: 1, column: 1 });
    const res = await request(app).post(`/api/games/${created.body.gameId}/reset`).send();
    expect(res.status).toBe(200);
    expect(res.body.moveHistory).toHaveLength(0);
    expect(res.body.board.every((c: unknown) => c === '')).toBe(true);
  });

  it('GET /api/scoreboard and POST /api/scoreboard/reset', async () => {
    const getRes = await request(app).get('/api/scoreboard');
    expect(getRes.status).toBe(200);
    const resetRes = await request(app).post('/api/scoreboard/reset').send();
    expect(resetRes.status).toBe(200);
    expect(resetRes.body).toEqual({ xWins: 0, oWins: 0, draws: 0 });
  });

  it('rejects invalid moves with 400', async () => {
    const created = await request(app).post('/api/games').send({});
    const res = await request(app)
      .post(`/api/games/${created.body.gameId}/moves`)
      .send({ row: 5, column: 5 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
  });
});
