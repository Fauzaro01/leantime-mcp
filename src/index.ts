import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { loadConfig } from "./config.js";
import { LeantimeClient } from "./leantime.js";

const cfg = loadConfig();
const client = new LeantimeClient(cfg.url, cfg.token);

const server = new Server(
  {
    name: "leantime-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools = [
  {
    name: "ping",
    description: "Check connection to Leantime API",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "listProjects",
    description: "List all projects accessible to the user",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "getProject",
    description: "Get details of a single project by ID",
    inputSchema: {
      type: "object",
      properties: { id: { type: "number", description: "Project ID" } },
      required: ["id"],
    },
  },
  {
    name: "listTickets",
    description: "List tickets, optionally filtered by projectId",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "number", description: "Filter tickets by Project ID" },
      },
    },
  },
  {
    name: "getTicket",
    description: "Get details of a single ticket by ID",
    inputSchema: {
      type: "object",
      properties: { id: { type: "number", description: "Ticket ID" } },
      required: ["id"],
    },
  },
  {
    name: "createTicket",
    description: "Create a new ticket in Leantime",
    inputSchema: {
      type: "object",
      properties: {
        headline: { type: "string", description: "Ticket title" },
        description: { type: "string", description: "Ticket body / description" },
        projectId: { type: "number", description: "Project ID" },
        type: { type: "string", description: "task | story | bug | idea" },
        status: { type: "number", description: "Status ID" },
        editorId: { type: "number", description: "Assigned user ID" },
      },
      required: ["headline"],
    },
  },
  {
    name: "listUsers",
    description: "List workspace users",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "getUser",
    description: "Get user details by ID",
    inputSchema: {
      type: "object",
      properties: { id: { type: "number", description: "User ID" } },
      required: ["id"],
    },
  },
  {
    name: "listClients",
    description: "List clients",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "getClient",
    description: "Get client details by ID",
    inputSchema: {
      type: "object",
      properties: { id: { type: "number", description: "Client ID" } },
      required: ["id"],
    },
  },
  {
    name: "listTimesheets",
    description: "List logged time entries for a date range",
    inputSchema: {
      type: "object",
      properties: {
        dateFrom: { type: "string", description: "Start date YYYY-MM-DD" },
        dateTo: { type: "string", description: "End date YYYY-MM-DD" },
        projectId: { type: "number", description: "Filter by project ID" },
        userId: { type: "number", description: "Filter by user ID" },
      },
      required: ["dateFrom", "dateTo"],
    },
  },
  {
    name: "callRpc",
    description: "Call any arbitrary Leantime JSON-RPC method directly",
    inputSchema: {
      type: "object",
      properties: {
        method: { type: "string", description: "RPC method (e.g. leantime.rpc.projects.getAll)" },
        params: { type: "object", description: "Method parameters" },
      },
      required: ["method"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = (args as Record<string, unknown>) || {};

  try {
    let result: unknown;
    switch (name) {
      case "ping":
        await client.listProjects();
        result = { status: "ok", url: cfg.url };
        break;
      case "listProjects":
        result = await client.listProjects();
        break;
      case "getProject":
        result = await client.getProject(Number(a["id"]));
        break;
      case "listTickets":
        result = await client.listTickets(a["projectId"] ? Number(a["projectId"]) : undefined);
        break;
      case "getTicket":
        result = await client.getTicket(Number(a["id"]));
        break;
      case "createTicket":
        result = await client.createTicket(a);
        break;
      case "listUsers":
        result = await client.listUsers();
        break;
      case "getUser":
        result = await client.getUser(Number(a["id"]));
        break;
      case "listClients":
        result = await client.listClients();
        break;
      case "getClient":
        result = await client.getClient(Number(a["id"]));
        break;
      case "listTimesheets":
        result = await client.listTimesheets({
          dateFrom: String(a["dateFrom"]),
          dateTo: String(a["dateTo"]),
          projectId: a["projectId"] ? Number(a["projectId"]) : undefined,
          userId: a["userId"] ? Number(a["userId"]) : undefined,
        });
        break;
      case "callRpc":
        result = await client.call(
          String(a["method"]),
          a["params"] as Record<string, unknown> | undefined
        );
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Error executing ${name}: ${msg}` }],
      isError: true,
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch((err) => {
  console.error("MCP Server Error:", err);
  process.exit(1);
});
