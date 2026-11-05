import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { loadConfig } from "./config.js";
import { LeantimeClient } from "./leantime.js";

const cfg = loadConfig();
const client = new LeantimeClient(
  cfg.url,
  cfg.authMethod === "bearer" ? `Bearer ${cfg.token}` : cfg.token
);

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

const toolsDefinition = [
  { name: "listProjects", description: "List all projects accessible to the user" },
  { name: "listTickets", description: "List all tickets across active projects" },
  { name: "listTicketTypes", description: "Get valid ticket types (Story, Task, Bug, etc.)" },
  { name: "listStatusLabels", description: "Get board/kanban ticket statuses" },
  { name: "listProjectTypes", description: "Get all project types" },
  { name: "listClients", description: "List clients" },
  { name: "listSprints", description: "List all sprints" },
  { name: "listMilestones", description: "List all milestones" },
  { name: "listUsers", description: "List workspace users" },
  { name: "listTimeEntries", description: "List logged time entries" },
  { name: "searchProjects", description: "Search projects by query string" },
  { name: "searchTickets", description: "Search tickets by query string" },
  { name: "getProject", description: "Get details of a single project by id" },
  { name: "getTicket", description: "Get details of a single ticket by id" },
  { name: "getClient", description: "Get details of a client by id" },
  { name: "getUser", description: "Get details of a user by id" },
  { name: "getMilestone", description: "Get details of a milestone by id" },
  { name: "createProject", description: "Create a new project" },
  { name: "createTicket", description: "Create a new ticket" },
  { name: "updateTicket", description: "Update a ticket properties" },
  { name: "deleteTicket", description: "Delete a ticket by id" },
  { name: "moveTicket", description: "Move ticket to a different status" },
  { name: "addComment", description: "Add a comment to a ticket" },
  { name: "logTime", description: "Log work time against a project/ticket" },
  { name: "ping", description: "Check connection to Leantime API" },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolsDefinition.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: {
        type: "object",
        properties: {},
      },
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = (args as Record<string, unknown>) || {};

  try {
    let result: unknown;
    switch (name) {
      case "ping":
        result = { status: "ok", url: cfg.url };
        break;
      case "listProjects":
        result = await client.listProjects();
        break;
      case "listTickets":
        result = await client.listTickets();
        break;
      case "listTicketTypes":
        result = await client.listTicketTypes();
        break;
      case "listStatusLabels":
        result = await client.listStatusLabels();
        break;
      case "listProjectTypes":
        result = await client.listProjectTypes();
        break;
      case "listClients":
        result = await client.listClients();
        break;
      case "listSprints":
        result = await client.listSprints();
        break;
      case "listMilestones":
        result = await client.listMilestones();
        break;
      case "listUsers":
        result = await client.listUsers();
        break;
      case "listTimeEntries":
        result = await client.listTimeEntries();
        break;
      case "searchProjects":
        result = await client.searchProjects(String(a["query"] ?? ""));
        break;
      case "searchTickets":
        result = await client.searchTickets(String(a["query"] ?? ""));
        break;
      case "getProject":
        result = await client.getProject(Number(a["id"] ?? 0));
        break;
      case "getTicket":
        result = await client.getTicket(Number(a["id"] ?? 0));
        break;
      case "getClient":
        result = await client.getClient(Number(a["id"] ?? 0));
        break;
      case "getUser":
        result = await client.getUser(Number(a["id"] ?? 0));
        break;
      case "getMilestone":
        result = await client.getMilestone(Number(a["id"] ?? 0));
        break;
      case "createProject":
        result = await client.createProject(String(a["name"] ?? ""), a["description"] as string | undefined);
        break;
      case "createTicket":
        result = await client.createTicket(a);
        break;
      case "updateTicket":
        result = await client.updateTicket(Number(a["id"] ?? 0), a);
        break;
      case "deleteTicket":
        result = await client.deleteTicket(Number(a["id"] ?? 0));
        break;
      case "moveTicket":
        result = await client.moveTicket(Number(a["id"] ?? 0), String(a["status"] ?? ""));
        break;
      case "addComment":
        result = await client.addComment(Number(a["ticketId"] ?? 0), String(a["content"] ?? ""));
        break;
      case "logTime":
        result = await client.logTime(Array.isArray(a["entries"]) ? (a["entries"] as Array<Record<string, unknown>>) : [a]);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${msg}`,
        },
      ],
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