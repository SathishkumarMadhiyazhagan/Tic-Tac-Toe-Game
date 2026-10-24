import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './app';

vi.mock('@tic-tac-toe/game-data-access', async () => {
  const actual = await vi.importActual<typeof import('@tic-tac-toe/game-data-access')>(
    '@tic-tac-toe/game-data-access'
  );
  return {
    ...actual,
    initializeApp: () => ({ type: 'MOCK_INIT' }),
  };
});

describe('App', () => {
  it('renders the game title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /tic tac toe/i })).toBeTruthy();
  });
});
