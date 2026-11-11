# Leantime MCP Server

Model Context Protocol (MCP) server for [Leantime](https://leantime.io) self-hosted project management system, communicating via its native JSON-RPC 2.0 API.

## Features

- **Projects**: `listProjects`, `getProject`
- **Tickets**: `listTickets` (with optional `projectId` filter), `getTicket`, `createTicket`
- **Users**: `listUsers`, `getUser`
- **Clients**: `listClients`, `getClient`
- **Timesheets**: `listTimesheets` (requires `dateFrom`, `dateTo`, optional `projectId` / `userId`)
- **Health**: `ping`

## Quick Start (1 command)

No clone, no build — just configure your MCP client:

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "leantime": {
      "command": "npx",
      "args": ["-y", "@fauzaro01/leantime-mcp"],
      "env": {
        "LEANTIME_URL": "https://your-leantime-instance.com",
        "LEANTIME_TOKEN": "your_api_key_here"
      }
    }
  }
}
```

### VS Code / Cursor

```json
{
  "mcpServers": {
    "leantime": {
      "command": "npx",
      "args": ["-y", "@fauzaro01/leantime-mcp"],
      "env": {
        "LEANTIME_URL": "https://your-leantime-instance.com",
        "LEANTIME_TOKEN": "your_api_key_here"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add leantime -- npx -y @fauzaro01/leantime-mcp
```

Then set environment variables `LEANTIME_URL` and `LEANTIME_TOKEN`.

> **Note**: Generate your API key in Leantime under **User Profile / Settings -> API Keys**.

## Install from source (development)

```bash
git clone https://github.com/Fauzaro01/leantime-mcp.git
cd leantime-mcp
npm install
npm run build
```

## License

GPL-3.0
