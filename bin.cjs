#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const projectDir = __dirname;

const server = spawn('npx', ['tsx', 'server.ts'], { 
  cwd: projectDir, 
  stdio: 'inherit',
  shell: true 
});

const vite = spawn('npx', ['vite', '--host'], { 
  cwd: projectDir, 
  stdio: 'inherit',
  shell: true 
});

process.on('SIGINT', () => {
  server.kill();
  vite.kill();
  process.exit();
});
