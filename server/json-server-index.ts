import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const consoleHtml = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'api-console.html'),
  'utf8'
);

/** json-server-style interactive API home page */
export function renderJsonServerIndex(): string {
  return consoleHtml;
}
