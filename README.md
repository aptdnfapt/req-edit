# req-edit

LLM API curl editor and runner. A web-based CLI tool for testing and debugging LLM API requests.

## Usage

Run with npx (no installation required):

```bash
npx req-edit
```

Or install globally:

```bash
npm install -g req-edit
req-edit
```

Then open http://localhost:8678 in your browser.

## Features

- 📝 Paste and edit curl requests
- 🎨 Syntax highlighting for JSON
- 🚀 Send requests to OpenAI, Anthropic, and other LLM APIs
- 📊 View and format responses
- 💾 Request history

## Requirements

- Node.js >= 18.0.0

## Development

```bash
# Clone repository
git clone https://github.com/aptdnfapt/req-edit.git
cd req-edit

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## License

MIT
