#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const HELP_TEXT = `
req-edit - LLM API curl editor and runner

Usage: req-edit [options]

Options:
  -p, --port <port>  Server port (default: 8678)
  -h, --host <host>  Server host (default: localhost)
  --help             Show this help message

Examples:
  req-edit
  req-edit --port 3000
  req-edit --host 0.0.0.0 --port 8080
`;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { port: null, host: null };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help') {
      console.log(HELP_TEXT);
      process.exit(0);
    } else if (arg === '-p' || arg === '--port') {
      options.port = args[++i];
    } else if (arg === '-h' || arg === '--host') {
      options.host = args[++i];
    }
  }

  return options;
}

const options = parseArgs();

const env = { ...process.env };
if (options.port) env.PORT = options.port;
if (options.host) env.HOST = options.host;

const server = spawn('node', ['--experimental-modules', path.join(__dirname, 'dist', 'server.js')], {
  stdio: 'inherit',
  env
});

process.on('SIGINT', () => {
  server.kill();
  process.exit();
});
