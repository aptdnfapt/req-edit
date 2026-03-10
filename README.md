# req-edit

[![npm version](https://img.shields.io/npm/v/req-edit.svg)](https://www.npmjs.com/package/req-edit)
[![npm downloads](https://img.shields.io/npm/dm/req-edit.svg)](https://www.npmjs.com/package/req-edit)
[![license](https://img.shields.io/npm/l/req-edit.svg)](https://github.com/aptdnfapt/req-edit/blob/main/LICENSE)

LLM API curl editor and runner. A lightweight web-based CLI tool for testing and debugging LLM API requests.

## Quick Start

```bash
npx req-edit
```

Then open http://localhost:8678 in your browser.

## Installation

**One-time use (recommended):**
```bash
npx req-edit
```

**Global install:**
```bash
npm install -g req-edit
req-edit
```

## Features

- 📝 **Paste & Edit** - Import curl requests from clipboard
- 🎨 **JSON Highlighting** - Syntax highlighting for request/response bodies
- 🚀 **Multi-Provider** - Works with OpenAI, Anthropic, and any LLM API
- 📊 **Response Viewer** - Pretty-print JSON responses
- 💾 **History** - Track recent requests
- 🔒 **Local Only** - All data stays on your machine

## Example Usage

1. Copy a curl request from your LLM provider's docs
2. Run `npx req-edit`
3. Paste the curl command
4. Modify parameters as needed
5. Click "Send" to test

## Requirements

- Node.js >= 18.0.0
- Modern web browser (Chrome, Firefox, Edge, Safari)

## Technical Details

- **Package size:** ~380KB (gzipped)
- **Server bundle:** 2.3KB (external deps not bundled)
- **Port:** 8678 (configurable via `PORT` env var)

## Development

```bash
git clone https://github.com/aptdnfapt/req-edit.git
cd req-edit
npm install
npm run dev
```

Open http://localhost:8678

## License

MIT - see [LICENSE](LICENSE) file for details.
