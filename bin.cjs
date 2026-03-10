#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const server = spawn('node', ['--experimental-modules', path.join(__dirname, 'dist', 'server.js')], { 
  stdio: 'inherit'
});

process.on('SIGINT', () => {
  server.kill();
  process.exit();
});
