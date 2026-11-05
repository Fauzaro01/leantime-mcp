# Leantime MCP Server

A custom MCP server bridge for the Leantime project management system, enabling MCP-compatible clients (Claude, VS Code, Cursor, etc.) to interact with Leantime via its public REST API.

## Features

- Full CRUD support for projects, tickets, tickets types, milestones, users, time entries, and more.
- Search functionality for projects and tickets.
- Create, update, delete, duplicate, and move tickets and projects.
- Log time entries and track progress.
- Auth via Personal Access Token (Bearer) or API key (`x-api-key` header).
- Compatible with Claude Desktop, VS Code, Cursor, and any MCP-compatible client.

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Install

```bash
git clone https://github.com/Fauzaro01/leantime-mcp.git
cd leantime-mcp
npm install
npm run build
```

### Run

```bash
npm start
```

The MCP server will listen on port 3456 (configurable via `PORT` env variable).

## Configuration

Create a `.env` file in the project root:

```env
LEANTIME_URL=https://your-leantime-instance.com
LEANTIME_TOKEN=your_personal_access_token
# Optional: LEANTIME_AUTH=bearer (default) or api_key for x-api-key header
```

### Configuration Options

| Variable | Description |
|----------|-------------|
| `LEANTIME_URL` | Base URL of your Leantime instance (e.g., `https://your-leantime-instance.com`) |
| `LEANTIME_TOKEN` | Personal Access Token or API key |
| `LEANTIME_AUTH` | `bearer` (default) or `api_key` to use `x-api-key` header |

## Usage

### In Claude Desktop

Add the server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "leantime": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "LEANTIME_URL": "https://your-leantime-instance.com",
        "LEANTIME_TOKEN": "your_token_here",
        "LEANTIME_AUTH": "bearer"
      }
    }
  }
}
```

Restart Claude Desktop. You can now call tools like `listProjects`, `listTickets`, `createTicket`, etc., directly from the chat.

### In VS Code / Cursor

Use the generic MCP client configuration pointing to the server executable:

```json
{
  "mcpServers": {
    "leantime": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "LEANTIME_URL": "https://your-leantime-instance.com",
        "LEANTIME_TOKEN": "your_token_here"
      }
    }
  }
}
```

## License

AGPL-3.0-or-later

---

© 2026 Fauzaro01. All rights reserved.