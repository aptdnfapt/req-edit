#!/usr/bin/env node
import { spawn } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const concurrently = require('concurrently');

const { result } = concurrently([
  { command: 'node server.ts', name: 'server' },
  { command: 'npx vite --host', name: 'vite' }
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 0,
});

result.then(
  () => process.exit(0),
  () => process.exit(1)
);
