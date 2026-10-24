import { createApp } from './app.mts';

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(port, '0.0.0.0', () => {
  console.log(`Tic Tac Toe API listening on http://localhost:${port}`);
});
