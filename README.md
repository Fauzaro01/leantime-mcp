# Leantime MCP Server

Model Context Protocol (MCP) server for [Leantime](https://leantime.io) self-hosted project management system, communicating via its native JSON-RPC 2.0 API.

## Features

- **Projects**: `listProjects`, `getProject`
- **Tickets**: `listTickets` (with optional `projectId` filter), `getTicket`, `createTicket`
- **Users**: `listUsers`, `getUser`
- **Clients**: `listClients`, `getClient`
- **Timesheets**: `listTimesheets` (requires `dateFrom`, `dateTo`, optional `projectId` / `userId`)
- **Health**: `ping`

## Installation

```bash
git clone https://github.com/Fauzaro01/leantime-mcp.git
cd leantime-mcp
npm install
npm run build
```

## Configuration

Create `.env` file in the project root:

```env
LEANTIME_URL=https://your-leantime-instance.com
LEANTIME_TOKEN=your_api_key_or_token
```

> **Note**: Leantime uses Bearer token authentication against the `/api/jsonrpc` endpoint. Generate your API key in Leantime under **User Profile / Settings -> API Keys**.

## Usage

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "leantime": {
      "command": "node",
      "args": ["C:/path/to/leantime-mcp/dist/index.js"],
      "env": {
        "LEANTIME_URL": "https://your-leantime-instance.com",
        "LEANTIME_TOKEN": "your_api_key_here"
      }
    }
  }
}
```

### VS Code / Cursor

Point MCP client configuration to `dist/index.js` using `node`:

```json
{
  "mcpServers": {
    "leantime": {
      "command": "node",
      "args": ["/absolute/path/to/leantime-mcp/dist/index.js"],
      "env": {
        "LEANTIME_URL": "https://your-leantime-instance.com",
        "LEANTIME_TOKEN": "your_api_key_here"
      }
    }
  }
}
```

## License

GPL-3.0
