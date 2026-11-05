export interface LeantimeApiResponse<T = unknown> {
  data?: T;
  message?: string;
}

export class LeantimeClient {
  constructor(private readonly baseUrl: string, private readonly authHeader: string) {
    if (!baseUrl.match(/^https?:\/\//i)) throw new Error(`Invalid Leantime URL: ${baseUrl}`);
    if (!authHeader) throw new Error("Leantime auth header is empty.");
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<LeantimeApiResponse<T>> {
    const absPath = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: this.authHeader.startsWith("Bearer ")
        ? this.authHeader
        : `Bearer ${this.authHeader}`,
    };

    const res = await fetch(absPath, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Leantime ${method} ${path} -> HTTP ${res.status}: ${text.slice(0, 300)}`);
    }
    try {
      const json = JSON.parse(text || "{}") as { data?: T; message?: string } | undefined;
      return { data: json?.data, message: json?.message };
    } catch {
      return { data: undefined as unknown as T, message: text };
    }
  }

  /* ----------- list ----------- */
  listProjects<T = unknown>(): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", "/projects"); }
  listTickets<T = unknown>(): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", "/tickets"); }
  listTicketTypes<T = unknown>(): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", "/tickets/types"); }
  listProjectTypes<T = unknown>(): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", "/projects/types"); }
  listStatusLabels<T = unknown>(): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", "/ticket_statuses"); }
  listClients<T = unknown>(): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", "/clients"); }
  listSprints<T = unknown>(): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", "/sprints"); }
  listMilestones<T = unknown>(): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", "/milestones"); }
  listUsers<T = unknown>(): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", "/users"); }
  listTimeEntries<T = unknown>(): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", "/time-entries"); }

  /* ----------- get ----------- */
  getProject<T = unknown>(id: number): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", `/projects/${id}`); }
  getTicket<T = unknown>(id: number): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", `/tickets/${id}`); }
  getClient<T = unknown>(id: number): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", `/clients/${id}`); }
  getUser<T = unknown>(id: number): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", `/users/${id}`); }
  getMilestone<T = unknown>(id: number): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", `/milestones/${id}`); }

  /* ----------- search ----------- */
  searchProjects<T = unknown>(query: string): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", `/projects?search=${encodeURIComponent(query)}`); }
  searchTickets<T = unknown>(query: string): Promise<LeantimeApiResponse<T>> { return this.request<T>("GET", `/tickets?search=${encodeURIComponent(query)}`); }

  /* ----------- create ----------- */
  createProject<T = unknown>(name: string, description?: string): Promise<LeantimeApiResponse<T>> { return this.request<T>("POST", "/projects", { name, description }); }
  createTicket<T = unknown>(payload: Record<string, unknown>): Promise<LeantimeApiResponse<T>> { return this.request<T>("POST", "/tickets", payload); }
  createClient<T = unknown>(name: string, email?: string, phone?: string): Promise<LeantimeApiResponse<T>> { return this.request<T>("POST", "/clients", { name, email, phone }); }
  createUser<T = unknown>(name: string, email: string, role?: string): Promise<LeantimeApiResponse<T>> { return this.request<T>("POST", "/users", { name, email, role }); }
  createMilestone<T = unknown>(title: string, goalId?: number): Promise<LeantimeApiResponse<T>> { return this.request<T>("POST", "/milestones", { title, goalId }); }
  createSprint<T = unknown>(name: string): Promise<LeantimeApiResponse<T>> { return this.request<T>("POST", "/sprints", { name }); }
  addComment<T = unknown>(ticketId: number, content: string): Promise<LeantimeApiResponse<T>> { return this.request<T>("POST", "/comments", { ticketId, content }); }

  /* ----------- update ----------- */
  updateTicket<T = unknown>(id: number, updates: Record<string, unknown>): Promise<LeantimeApiResponse<T>> { return this.request<T>("PUT", `/tickets/${id}`, updates); }
  moveTicket<T = unknown>(id: number, status: string): Promise<LeantimeApiResponse<T>> { return this.request<T>("PUT", `/tickets/${id}`, { ticketStatus: status }); }
  upsertSubtask<T = unknown>(taskId: number, subtask: Record<string, unknown>): Promise<LeantimeApiResponse<T>> { return this.request<T>("POST", "/subtasks", { taskId, ...subtask }); }

  /* ----------- delete ----------- */
  deleteTicket<T = unknown>(id: number): Promise<LeantimeApiResponse<T>> { return this.request<T>("DELETE", `/tickets/${id}`); }
  deleteFile<T = unknown>(id: number): Promise<LeantimeApiResponse<T>> { return this.request<T>("DELETE", `/files/${id}`); }
  deleteClient<T = unknown>(id: number): Promise<LeantimeApiResponse<T>> { return this.request<T>("DELETE", `/clients/${id}`); }
  deleteUser<T = unknown>(id: number): Promise<LeantimeApiResponse<T>> { return this.request<T>("DELETE", `/users/${id}`); }

  /* ----------- time ----------- */
  logTime<T = unknown>(entries: Array<Record<string, unknown>>): Promise<LeantimeApiResponse<T>> { return this.request<T>("POST", "/time-entries", entries); }
}
