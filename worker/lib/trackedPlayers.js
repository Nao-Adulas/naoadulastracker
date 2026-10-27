import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sharedPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../shared/tracked-players.json'
);

export const TRACKED_PLAYERS = JSON.parse(readFileSync(sharedPath, 'utf8'));
