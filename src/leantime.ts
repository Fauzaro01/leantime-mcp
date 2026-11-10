export interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  id: number;
}

export class LeantimeClient {
  private idCounter = 1;
  private readonly endpoint: string;

  constructor(private readonly baseUrl: string, private readonly token: string) {
    if (!baseUrl.match(/^https?:\/\//i)) {
      throw new Error(`Invalid Leantime URL: ${baseUrl}`);
    }
    if (!token) throw new Error("Leantime token is empty.");
    this.endpoint = `${baseUrl.replace(/\/+$/, "")}/api/jsonrpc`;
  }

  async call<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
    const payload = {
      jsonrpc: "2.0",
      method,
      params: params && Object.keys(params).length > 0 ? params : undefined,
      id: this.idCounter++,
    };

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.token.startsWith("Bearer ") ? this.token : `Bearer ${this.token}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Leantime HTTP ${res.status}: ${text.slice(0, 300)}`);
    }

    const json = (await res.json()) as JsonRpcResponse<T>;
    if (json.error) {
      const dataStr = json.error.data ? ` (${JSON.stringify(json.error.data)})` : "";
      throw new Error(`Leantime RPC error ${json.error.code}: ${json.error.message}${dataStr}`);
    }

    return json.result as T;
  }

  /* Projects */
  listProjects() {
    return this.call("leantime.rpc.projects.getAll");
  }

  getProject(id: number) {
    return this.call("leantime.rpc.projects.getProject", { id });
  }

  /* Tickets */
  listTickets(projectId?: number) {
    return this.call("leantime.rpc.tickets.getAll", projectId ? { projectId } : undefined);
  }

  getTicket(id: number) {
    return this.call("leantime.rpc.tickets.getTicket", { id });
  }

  createTicket(values: Record<string, unknown>) {
    return this.call("leantime.rpc.tickets.addTicket", { values });
  }

  /* Users */
  listUsers() {
    return this.call("leantime.rpc.users.getAll");
  }

  getUser(id: number) {
    return this.call("leantime.rpc.users.getUser", { id });
  }

  /* Clients */
  listClients() {
    return this.call("leantime.rpc.clients.getAll");
  }

  getClient(id: number) {
    return this.call("leantime.rpc.clients.getClient", { id });
  }

  /* Timesheets */
  listTimesheets(params: { dateFrom: string; dateTo: string; projectId?: number; userId?: number }) {
    return this.call("leantime.rpc.timesheets.getAll", params as Record<string, unknown>);
  }
}
